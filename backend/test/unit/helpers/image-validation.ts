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

import { expect } from 'chai';
import { UploadedFile } from 'express-fileupload';
import sharp from 'sharp';
import { IMAGE_REQUIREMENTS, validateImageUpload } from '../../../src/helpers/image-validation';
import { isFail, isPass } from '../../../src/helpers/specification-validation';

function toUpload(data: Buffer, name: string): UploadedFile {
  return {
    name,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mv: (filePath: string) => (Promise.resolve()),
    encoding: '',
    mimetype: 'application/octet-stream',
    data,
    tempFilePath: '',
    truncated: false,
    size: data.length,
    md5: '',
  };
}

function blankImage(width: number, height: number): sharp.Sharp {
  return sharp({ create: { width, height, channels: 3, background: '#ffffff' } });
}

describe('image-validation', () => {
  describe('validateImageUpload', () => {
    const formats: [keyof sharp.FormatEnum, string][] = [
      ['png', '.png'],
      ['jpeg', '.jpg'],
      ['webp', '.webp'],
      ['gif', '.gif'],
    ];

    formats.forEach(([format, extension]) => {
      it(`should name a ${format} upload after its detected format, not the uploaded file name`, async () => {
        const data = await blankImage(128, 128).toFormat(format).toBuffer();

        const result = await validateImageUpload(toUpload(data, 'image.html'), 'product');

        expect(isPass(result)).to.be.true;
        if (!isPass(result)) return;
        expect(result.pass.name).to.equal(`product${extension}`);
        expect(result.pass.data).to.equal(data);
      });
    });

    it('should use the EXIF orientation when checking banner dimensions', async () => {
      // Stored as 64x512, displayed as 512x64.
      const data = await blankImage(64, 512).jpeg().withMetadata({ orientation: 6 }).toBuffer();

      const result = await validateImageUpload(toUpload(data, 'banner.jpg'), 'banner');

      expect(isPass(result)).to.be.true;
      if (!isPass(result)) return;
      expect(result.pass.name).to.equal('banner.jpg');
    });

    it('should reject a banner that is only 8:1 before applying its EXIF orientation', async () => {
      // Stored as 512x64, displayed as 64x512.
      const data = await blankImage(512, 64).jpeg().withMetadata({ orientation: 6 }).toBuffer();

      const result = await validateImageUpload(toUpload(data, 'banner.jpg'), 'banner');

      expect(isFail(result)).to.be.true;
      if (!isFail(result)) return;
      expect(result.fail.value).to.equal(
        `Image file is not valid: Image resolution must be at least ${IMAGE_REQUIREMENTS.banner.minWidth}x${IMAGE_REQUIREMENTS.banner.minHeight}px (received 64x512px).`,
      );
    });
  });
});
