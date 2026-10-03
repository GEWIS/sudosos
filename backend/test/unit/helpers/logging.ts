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
import log4js, { LoggingEvent } from 'log4js';
import {
  flattenLogData,
  toPrettyLogLine,
  toStructuredLogEvent,
} from '../../../src/helpers/logging';
import { runWithRequestContext, setRequestActor } from '../../../src/helpers/request-context';

function event(...data: unknown[]): LoggingEvent {
  return {
    categoryName: 'InvoiceController',
    level: log4js.levels.TRACE,
    data,
    startTime: new Date('2026-04-23T10:11:12.000Z'),
    pid: 1,
    context: {},
    serialise: () => '',
  };
}

describe('logging', () => {
  describe('flattenLogData', () => {
    it('should take the leading string as the message', () => {
      expect(flattenLogData(['invoice.delete'])).to.deep.equal({ msg: 'invoice.delete', fields: {} });
    });

    it('should merge logged objects into the fields', () => {
      const { msg, fields } = flattenLogData(['invoice.update', { id: '4' }, { state: 'PAID' }]);
      expect(msg).to.equal('invoice.update');
      expect(fields).to.deep.equal({ id: '4', state: 'PAID' });
    });

    it('should serialise errors instead of dropping them', () => {
      const error = new Error('database is on fire');
      const { fields } = flattenLogData(['invoice.delete', error]);
      expect(fields.error).to.include({ name: 'Error', message: 'database is on fire' });
      expect((fields.error as { stack: string }).stack).to.be.a('string');
    });

    it('should collect values that are not objects under args', () => {
      const { fields } = flattenLogData(['invoice.delete', 4, 'extra']);
      expect(fields).to.deep.equal({ args: [4, 'extra'] });
    });

    it('should take a trailing string as the message as well', () => {
      const { msg, fields } = flattenLogData([{ jobId: 'job-1' }, 'mail.send_failed']);
      expect(msg).to.equal('mail.send_failed');
      expect(fields).to.deep.equal({ jobId: 'job-1' });
    });

    it('should keep any further strings as args', () => {
      const { msg, fields } = flattenLogData(['invoice.get', 'unexpected']);
      expect(msg).to.equal('invoice.get');
      expect(fields).to.deep.equal({ args: ['unexpected'] });
    });

    it('should leave the message empty when nothing was logged as a string', () => {
      expect(flattenLogData([{ id: '4' }])).to.deep.equal({ msg: '', fields: { id: '4' } });
    });
  });

  describe('toStructuredLogEvent', () => {
    it('should describe the event', () => {
      expect(toStructuredLogEvent(event('invoice.delete', { id: '4' }))).to.deep.equal({
        timestamp: '2026-04-23T10:11:12.000Z',
        level: 'TRACE',
        category: 'InvoiceController',
        msg: 'invoice.delete',
        id: '4',
      });
    });

    it('should annotate the event with the context of its request', () => {
      runWithRequestContext({ requestId: 'abc', method: 'DELETE', path: '/v1/invoices/4' }, () => {
        setRequestActor(42);
        expect(toStructuredLogEvent(event('invoice.delete'))).to.include({
          requestId: 'abc',
          actorId: 42,
          method: 'DELETE',
          path: '/v1/invoices/4',
        });
      });
    });
  });

  describe('toPrettyLogLine', () => {
    it('should render the event as a single line', () => {
      expect(toPrettyLogLine(event('invoice.delete', { id: '4' }))).to.equal(
        '[2026-04-23T10:11:12.000Z] [TRACE] InvoiceController - invoice.delete {"id":"4"}',
      );
    });

    it('should prefix the line with a shortened request id', () => {
      runWithRequestContext({ requestId: 'abcdefgh-ijkl', method: 'DELETE', path: '/v1' }, () => {
        expect(toPrettyLogLine(event('invoice.delete'))).to.equal(
          '[2026-04-23T10:11:12.000Z] [TRACE] InvoiceController - [abcdefgh] invoice.delete',
        );
      });
    });
  });
});
