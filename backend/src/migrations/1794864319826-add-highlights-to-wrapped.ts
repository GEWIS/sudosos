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
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

const counter = (name: string) => new TableColumn({ name, type: 'int', isNullable: false, default: '0' });

export class AddHighlightsToWrapped1794864319826 implements MigrationInterface {
  private WRAPPED_TABLE = 'wrapped';

  private WRAPPED_ORGAN_MEMBER_TABLE = 'wrapped_organ_member';

  private wrappedColumns = [
    new TableColumn({ name: 'hourHistogram', type: 'text', isNullable: false, default: "'[]'" }),
    counter('daytimeTransactionCount'),
    counter('itemCount'),
    counter('alcoholicItemCount'),
    counter('distinctProducts'),
    counter('biggestRoundItems'),
    counter('biggestRoundSpent'),
    new TableColumn({ name: 'biggestRoundDate', type: 'datetime', isNullable: true, default: null }),
    counter('topUpCount'),
    counter('topUpTotal'),
    counter('fineCount'),
    counter('fineTotal'),
  ];

  private organMemberColumns = ['transactionsCreated', 'turnoverCreated', 'customersServed', 'sellerCount'].map(counter);

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns(this.WRAPPED_TABLE, this.wrappedColumns);
    await queryRunner.addColumns(this.WRAPPED_ORGAN_MEMBER_TABLE, this.organMemberColumns);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns(this.WRAPPED_ORGAN_MEMBER_TABLE, this.organMemberColumns);
    await queryRunner.dropColumns(this.WRAPPED_TABLE, this.wrappedColumns);
  }
}
