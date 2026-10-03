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
import { EntityManager } from 'typeorm';
import FileService from '../file-service';
import { PdfError } from '../../errors';
import { IPdfAble, IUnstoredPdfAble } from '../../entity/file/pdf-able';
import WithManager from '../../database/with-manager';
import { postCompileHtml } from '@gewis/pdf-compiler-ts';
import { createClient, type Client as PdfCompilerClient } from '@gewis/pdf-compiler-ts/dist/client/client';
import Config from '../../config';

/**
 * Base interface for all PDF services.
 * - createPdfBuffer always produces the PDF bytes
 * - createRaw produces the raw HTML as bytes
 * - getParameters must be implemented by concrete services
 */
export interface IPdfServiceBase<T> {
  createPdfBuffer(entity: T): Promise<Buffer>;
  createRaw(entity: T): Promise<Buffer>;
  getParameters(entity: T): Promise<any>;
}

/**
 * Optional interface for services that also persist and return a Pdf entity.
 * Services that do not persist can simply not implement this interface.
 */
export interface IStoredPdfService<T, S extends Pdf> {
  createPdfWithEntity(entity: T): Promise<S>;
}

/**
 * Type alias for template parameters used in HTML PDF services.
 * Parameters must be a record (object) with string keys.
 */
export type PdfTemplateParameters = Record<string, any>;

/**
 * Type alias for a function that generates HTML from a data object.
 * @param options The data to be used in the HTML template.
 * @returns The generated HTML as a string.
 */
export type HtmlGenerator<P> = (options: P) => string;

/**
 * Base class for HTML-to-PDF services.
 * Produces bytes via createPdfBuffer. Concrete stored services should
 * implement createPdfWithEntity to persist and return the Pdf entity.
 *
 * Templates are stored in static/pdf/ and use {{ key }} placeholders.
 *
 * @template T - The entity type
 * @template P - The template parameters type
 */
export abstract class BaseHtmlPdfService<T, P extends PdfTemplateParameters = PdfTemplateParameters>
  extends WithManager
  implements IPdfServiceBase<T> {
  protected htmlPdfGenUrl: string;

  protected client: PdfCompilerClient;

  /**
   * The function that generates the HTML.
   * This function should take a data object and return the complete HTML string.
   */
  abstract htmlGenerator: HtmlGenerator<P>;

  constructor(manager?: EntityManager) {
    super(manager);
    this.htmlPdfGenUrl = Config.get().pdf.htmlPdfGeneratorUrl;
    // Create a client instance per service instance to avoid race conditions
    this.client = createClient({ baseUrl: this.htmlPdfGenUrl });
  }

  /**
   * Get the data object to use with the HTML template.
   */
  public abstract getParameters(entity: T): Promise<P>;

  /**
   * Apply parameters to the template and return the complete HTML.
   */
  protected async getHtml(entity: T): Promise<string> {
    const data = await this.getParameters(entity);
    return this.htmlGenerator(data);
  }

  /**
   * Compile HTML to PDF using the external service.
   */
  protected async compileHtml(html: string): Promise<Buffer> {
    try {
      const data = await postCompileHtml<true>({
        client: this.client,
        body: { html },
        parseAs: 'stream',
      });

      if (data.response.status !== 200) {
        const errorText = await data.response.text().catch(() => 'Unknown error');
        throw new PdfError(`HTML PDF generation failed: ${data.response.status} ${errorText}`);
      }

      const arrayBuffer = await data.response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error: any) {
      if (error instanceof PdfError) {
        throw error;
      }
      throw new PdfError(`HTML PDF generation failed: ${error?.message ?? String(error)}`);
    }
  }

  /**
   * Create a PDF and return bytes.
   */
  public async createPdfBuffer(entity: T): Promise<Buffer> {
    const html = await this.getHtml(entity);
    return this.compileHtml(html);
  }

  /**
   * Create raw HTML output (for debugging or preview).
   */
  public async createRaw(entity: T): Promise<Buffer> {
    const html = await this.getHtml(entity);
    return Buffer.from(html, 'utf-8');
  }
}

/**
 * HTML-to-PDF service for entities that store PDFs.
 */
export abstract class HtmlPdfService<S extends Pdf, T extends IPdfAble<S>, P extends PdfTemplateParameters = PdfTemplateParameters>
  extends BaseHtmlPdfService<T, P>
  implements IStoredPdfService<T, S> {
  fileService: FileService;

  abstract pdfConstructor: new () => S;

  constructor(fileLocation: string, manager?: EntityManager) {
    super(manager);
    this.fileService = new FileService(fileLocation);
  }

  /**
   * Persist the generated PDF and return the stored Pdf entity.
   */
  public async createPdfWithEntity(entity: T): Promise<S> {
    const buffer = await this.createPdfBuffer(entity);
    const user = await entity.getOwner();
    return this.fileService.uploadPdf<T, S>(entity, this.pdfConstructor, buffer, user);
  }
}

/**
 * HTML-to-PDF service for entities that don't store PDFs.
 * It inherits createPdfBuffer and createRaw from BaseHtmlPdfService.
 * It does not implement any stored interface.
 */
export abstract class HtmlUnstoredPdfService<T extends IUnstoredPdfAble, P extends PdfTemplateParameters = PdfTemplateParameters>
  extends BaseHtmlPdfService<T, P> {
  // No additional logic required.
}
