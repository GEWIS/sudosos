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
 * This is the module page of the image-validation.
 *
 * @module helpers
 */

import { UploadedFile } from 'express-fileupload';
import Sharp, { Metadata } from 'sharp';
import { INVALID_IMAGE_FILE } from '../controller/request/validators/validation-errors';
import { toFail, toPass, ValidationError, Either } from './specification-validation';

export type ImageType = 'product' | 'banner';

export interface ImageValidationRequirements {
  minWidth: number;
  minHeight: number;
  aspectRatio: number;
  aspectRatioTolerance: number;
  aspectRatioLabel: string;
  allowedFormats: string[];
}

/**
 * File extension used to store an image, keyed by the format sharp detects from the file contents.
 */
export const IMAGE_FORMAT_EXTENSIONS: Record<string, string> = {
  png: '.png',
  jpeg: '.jpg',
  webp: '.webp',
  gif: '.gif',
};

export const ALLOWED_IMAGE_FORMATS = Object.keys(IMAGE_FORMAT_EXTENSIONS);

export const IMAGE_REQUIREMENTS: Record<ImageType, ImageValidationRequirements> = {
  product: {
    minWidth: 64,
    minHeight: 64,
    aspectRatio: 1,
    aspectRatioTolerance: 0.2,
    aspectRatioLabel: '1:1',
    allowedFormats: ALLOWED_IMAGE_FORMATS,
  },
  banner: {
    minWidth: 512,
    minHeight: 64,
    aspectRatio: 8,
    aspectRatioTolerance: 0.2,
    aspectRatioLabel: '8:1',
    allowedFormats: ALLOWED_IMAGE_FORMATS,
  },
};

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/**
 * Validate an uploaded image against the requirements of the given image type.
 *
 * Format, resolution and aspect ratio are read from the file contents, never from the
 * uploaded file name or mimetype. Dimensions are taken after applying the EXIF orientation,
 * so they match how the image is displayed.
 *
 * On success, returns a copy of the upload whose name is `<imageType><extension>`, where the
 * extension is derived from the detected format. Pass that copy to storage so the stored file
 * never inherits the extension of the client-supplied file name.
 */
export async function validateImageUpload(
  uploadedFile: UploadedFile,
  imageType: ImageType,
): Promise<Either<ValidationError, UploadedFile>> {

  const requirements = IMAGE_REQUIREMENTS[imageType];

  let metadata: Metadata;
  try {
    metadata = await Sharp(uploadedFile.data).metadata();
  } catch (error) {
    return toFail(INVALID_IMAGE_FILE('File is not a valid or supported image.'));
  }

  if (!metadata.format || !requirements.allowedFormats.includes(metadata.format)) {
    const receivedFormat = metadata.format ?? 'unknown';
    return toFail(INVALID_IMAGE_FILE(
      `Unsupported image format (${receivedFormat}). Allowed formats: ${requirements.allowedFormats.join(', ')
      }.`,
    ));
  }

  const width = metadata.autoOrient?.width ?? 0;
  const height = metadata.autoOrient?.height ?? 0;

  if (width < requirements.minWidth || height < requirements.minHeight) {
    return toFail(INVALID_IMAGE_FILE(
      `Image resolution must be at least ${requirements.minWidth}x${requirements.minHeight}px `
            + `(received ${width}x${height}px).`,
    ));
  }

  const ratio = width / height;
  const ratioDiff = Math.abs(ratio - requirements.aspectRatio) / requirements.aspectRatio;
  if (ratioDiff > requirements.aspectRatioTolerance) {
    return toFail(INVALID_IMAGE_FILE(
      `Image aspect ratio must be ${requirements.aspectRatioLabel} `
            + `(+/- ${formatPercent(requirements.aspectRatioTolerance)}).`,
    ));
  }

  return toPass({
    ...uploadedFile,
    name: `${imageType}${IMAGE_FORMAT_EXTENSIONS[metadata.format]}`,
  });
}
