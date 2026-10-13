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
 * This is the module page of pdf-file.
 *
 * @module internal/files
 */

import { Column, Entity } from 'typeorm';
import BaseFile from './base-file';

/**
 * @typedef {BaseFile} Pdf
 */
@Entity()
export default class Pdf extends BaseFile {
  @Column()
  // Hash of the parameters this pdf was rendered from. The stored pdf is frozen; clearing the
  // hash marks it stale, so StoredPdfService.getOrCreate re-renders it on the next request.
  public hash: string;
}

