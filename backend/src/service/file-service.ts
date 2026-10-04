/**
 *  SudoSOS back-end API service.
 *  Copyright (C) 2026 Study association GEWIS
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published
 *  by the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 *  @license
 */

/**
 * This is the module page of the file-service.
 *
 * @module internal/files
 */

import { UploadedFile } from 'express-fileupload';
import path from 'path';
import { DiskStorage, FileStorage, SIMPLE_FILE_LOCATION } from '../files/storage';
import BaseFile from '../entity/file/base-file';
import SimpleFileRequest from '../controller/request/simple-file-request';
import User from '../entity/user/user';
import Product from '../entity/product/product';
import ProductImage from '../entity/file/product-image';
import Banner from '../entity/banner';
import BannerImage from '../entity/file/banner-image';
import Pdf from '../entity/file/pdf-file';
import { AppDataSource } from '../database/database';
import { EntityManager } from 'typeorm';
import Config from '../config';

/**
 *  Possible storage methods that can be used
 */
export type StorageMethod = 'disk';

export interface DownloadFileResponse {
  file: BaseFile,
  data: Buffer,
}

export default class FileService {
  private fileStorage: FileStorage;

  constructor(workdir?: string, storageMethod?: StorageMethod) {
    const configuredStorageMethod = storageMethod ?? Config.get().files.storageMethod;

    switch (configuredStorageMethod) {
      case 'disk':
        this.fileStorage = new DiskStorage(workdir ?? SIMPLE_FILE_LOCATION);
        break;
      default:
        throw new TypeError(`Unknown file storage method: ${configuredStorageMethod}`);
    }
  }

  /**
   * Create a new file in storage, given the provided parameters
   */
  public async createFile(file: BaseFile, fileData: Buffer): Promise<BaseFile> {
    let location: string;
    try {
      location = await this.fileStorage.saveFile(file.downloadName, fileData);
    } catch (error) {
      await BaseFile.delete(file.id);
      throw new Error(error);
    }

    // eslint-disable-next-line no-param-reassign
    file.location = location;

    try {
      await file.save();
    } catch (error) {
      await this.fileStorage.deleteFile(file);
      await BaseFile.delete(file.id);
      throw new Error(error);
    }

    return file;
  }

  /**
   * Read and return the given file from storage
   */
  private async readFile(file: BaseFile): Promise<Buffer> {
    return this.fileStorage.getFile(file);
  }

  /**
   * Remove the given file from storage
   */
  private async removeFile(file: BaseFile) {
    await this.fileStorage.deleteFile(file);
  }

  /**
   * Upload a simple file to the database and put in storage
   */
  public async uploadSimpleFile(
    createdBy: User, uploadedFile: UploadedFile, fileEntity: SimpleFileRequest,
  ) {
    const fileExtension = path.extname(uploadedFile.name);

    const file = Object.assign(new BaseFile(), {
      downloadName: `${fileEntity.name}${fileExtension}`,
      createdBy,
      location: '',
    });
    await file.save();

    return this.createFile(file, uploadedFile.data);
  }

  /**
   * Get the given simple file object and data from storage
   */
  public async getSimpleFile(id: number): Promise<DownloadFileResponse | undefined> {
    const file = await BaseFile.findOne({ where: { id } });

    if (!file) {
      return undefined;
    }

    const data = await this.readFile(file);
    return { file, data };
  }

  /**
   * Delete the simple file with given ID from storage and database
   */
  public async deleteSimpleFile(id: number): Promise<void> {
    const file = await BaseFile.findOne({ where: { id } });

    if (!file) return;

    await this.removeFile(file);
    await BaseFile.delete(file.id);
  }


  /**
   * Upload a pdf file, replacing the entity's current pdf if it has one.
   * The new file is written before the old one is removed, so a failed upload keeps the issued pdf.
   * @param entity - The entity that has the pdf property
   * @param PdfType - The pdf type, must be manually specified since the entities pdf can be undefined
   * @param fileData - The file data
   * @param createdBy - The user that created the file
   * @param hash - The hash of the parameters the pdf was rendered from
   * @param manager - The entity manager to save with, so the pdf follows the caller's transaction
   */
  public async uploadPdf<T extends { pdf?: S }, S extends Pdf>(
    entity: T, PdfType: new () => S, fileData: Buffer, createdBy: User, hash: string,
    manager: EntityManager = AppDataSource.manager,
  ): Promise<S> {
    const old = entity.pdf;
    const location = await this.fileStorage.saveFile('', fileData);
    const pdf = Object.assign(new PdfType(), { createdBy }, old, {
      location,
      downloadName: path.parse(location).base,
      hash,
    });

    try {
      await manager.transaction(async (m) => {
        await m.save(PdfType, pdf);
        if (!old) await m.save(entity.constructor as new () => T, Object.assign(entity, { pdf }));
      });
    } catch (error) {
      if (!old) Object.assign(entity, { pdf: undefined });
      await this.fileStorage.deleteFile(pdf);
      throw error;
    }

    // Removed right away: an outer transaction that rolls back after this would point at a deleted file.
    if (old) await this.removeFile(old);
    // eslint-disable-next-line no-param-reassign
    entity.pdf = pdf;
    return pdf;
  }

  /**
   * Upload an entity image to the given entity and replace the old one, if it exists
   */
  public async uploadEntityImage(
    entity: Product | Banner, uploadedFile: UploadedFile, createdBy: User,
  ): Promise<ProductImage> {
    let entityImage = entity.image;

    if (entityImage == null) {
      entityImage = Object.assign(new BaseFile(), {
        downloadName: uploadedFile.name,
        createdBy,
        location: '',
      });
      await ProductImage.save(entityImage);
    } else {
      // If the file does exist, we first have to remove it from storage
      await this.removeFile(entityImage);
    }
    // Store the new file in storage.
    entityImage = await this.createFile(entityImage, uploadedFile.data);

    // Save the file name as the download name.
    entityImage.downloadName = path.parse(entityImage.location).base;
    // eslint-disable-next-line no-param-reassign
    entity.image = entityImage;
    if (entity instanceof Product) {
      await ProductImage.save(entityImage);
    } else if (entity instanceof Banner) {
      await BannerImage.save(entityImage);
    } else {
      throw new Error('Given entity is not a Product or a Banner');
    }
    await entity.save();
    return entityImage;
  }

  /**
   * Delete entity file from database
   */
  public async deleteEntityFile(entityFile: ProductImage | BannerImage) {
    await this.removeFile(entityFile);
    await entityFile.remove();
  }
}
