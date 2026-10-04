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
 * This is the page of pdf-service.
 *
 * @module internal/pdf
 */

import Pdf from '../../entity/file/pdf-file';
import User from '../../entity/user/user';
import FileService from '../file-service';
import { PdfError } from '../../errors';
import WithManager from '../../database/with-manager';
import { postCompileHtml } from '@gewis/pdf-compiler-ts';
import { createClient } from '@gewis/pdf-compiler-ts/dist/client/client';
import Config from '../../config';
import { ReturnFileType } from '../../helpers/pdf';
import { hashJSON } from '../../helpers/hash';

export type PdfTemplateParameters = Record<string, any>;

export const PdfCompiler = {
  async compile(html: string): Promise<Buffer> {
    try {
      const data = await postCompileHtml<true>({
        client: createClient({ baseUrl: Config.get().pdf.htmlPdfGeneratorUrl }),
        body: { html },
        parseAs: 'stream',
      });

      if (data.response.status !== 200) {
        const errorText = await data.response.text().catch(() => 'Unknown error');
        throw new PdfError(`HTML PDF generation failed: ${data.response.status} ${errorText}`);
      }

      return Buffer.from(await data.response.arrayBuffer());
    } catch (error: any) {
      if (error instanceof PdfError) throw error;
      throw new PdfError(`HTML PDF generation failed: ${error?.message ?? String(error)}`);
    }
  },
};

/**
 * Turns an entity into HTML and PDF bytes. One subclass per document type.
 */
export abstract class PdfService<T, P extends PdfTemplateParameters> extends WithManager {
  abstract getParameters(entity: T): Promise<P>;

  abstract render(params: P): string;

  async html(entity: T): Promise<Buffer> {
    return Buffer.from(this.render(await this.getParameters(entity)), 'utf-8');
  }

  async pdf(entity: T): Promise<Buffer> {
    return this.compile(await this.getParameters(entity));
  }

  async output(entity: T, fileType: ReturnFileType): Promise<Buffer> {
    return fileType === ReturnFileType.PDF ? this.pdf(entity) : this.html(entity);
  }

  protected compile(params: P): Promise<Buffer> {
    return PdfCompiler.compile(this.render(params));
  }
}

/**
 * A PdfService whose output is a record we send to people. Once stored, the PDF
 * is frozen (#141): it is returned as-is, and only re-rendered when `force` is
 * set or its hash was cleared to mark it stale.
 */
export abstract class StoredPdfService<T extends { pdf?: S }, S extends Pdf, P extends PdfTemplateParameters>
  extends PdfService<T, P> {
  abstract readonly location: string;

  abstract readonly pdfConstructor: new () => S;

  abstract getOwner(entity: T): User;

  async getOrCreate(entity: T, force = false): Promise<S> {
    if (entity.pdf?.hash && !force) return entity.pdf;

    const params = await this.getParameters(entity);
    const buffer = await this.compile(params);
    return new FileService(this.location)
      .uploadPdf(entity, this.pdfConstructor, buffer, this.getOwner(entity), hashJSON(params), this.manager);
  }
}
