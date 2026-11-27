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
import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddYearToWrapped1794863168963 implements MigrationInterface {
  private WRAPPED_TABLE = 'wrapped';

  private WRAPPED_ORGAN_MEMBER_TABLE = 'wrapped_organ_member';

  private USER_FOREIGN_KEY = 'FK_wrapped_organ_member_userId_wrapped';

  private USER_YEAR_FOREIGN_KEY = 'FK_wrapped_organ_member_userId_year_wrapped';

  private yearColumn = new TableColumn({ name: 'year', type: 'int', isNullable: false });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(this.WRAPPED_ORGAN_MEMBER_TABLE, this.USER_FOREIGN_KEY);

    await queryRunner.addColumn(this.WRAPPED_TABLE, this.yearColumn);
    await queryRunner.query(`
      UPDATE ${this.WRAPPED_TABLE}
      SET year = COALESCE(YEAR(syncedFrom), YEAR(CURRENT_DATE))
    `);
    await queryRunner.query(`
      ALTER TABLE ${this.WRAPPED_TABLE}
      DROP PRIMARY KEY, ADD PRIMARY KEY (userId, year)
    `);

    await queryRunner.addColumn(this.WRAPPED_ORGAN_MEMBER_TABLE, this.yearColumn);
    await queryRunner.query(`
      UPDATE ${this.WRAPPED_ORGAN_MEMBER_TABLE} member
      INNER JOIN ${this.WRAPPED_TABLE} wrapped ON wrapped.userId = member.userId
      SET member.year = wrapped.year
    `);
    await queryRunner.query(`
      ALTER TABLE ${this.WRAPPED_ORGAN_MEMBER_TABLE}
      DROP PRIMARY KEY, ADD PRIMARY KEY (userId, organId, year)
    `);

    await queryRunner.createForeignKey(
      this.WRAPPED_ORGAN_MEMBER_TABLE,
      new TableForeignKey({
        columnNames: ['userId', 'year'],
        referencedTableName: this.WRAPPED_TABLE,
        referencedColumnNames: ['userId', 'year'],
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
        name: this.USER_YEAR_FOREIGN_KEY,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(this.WRAPPED_ORGAN_MEMBER_TABLE, this.USER_YEAR_FOREIGN_KEY);

    for (const table of [this.WRAPPED_ORGAN_MEMBER_TABLE, this.WRAPPED_TABLE]) {
      await queryRunner.query(`
        DELETE older FROM ${table} older
        INNER JOIN ${this.WRAPPED_TABLE} newer ON newer.userId = older.userId AND newer.year > older.year
      `);
    }

    await queryRunner.query(`
      ALTER TABLE ${this.WRAPPED_ORGAN_MEMBER_TABLE}
      DROP PRIMARY KEY, ADD PRIMARY KEY (userId, organId)
    `);
    await queryRunner.dropColumn(this.WRAPPED_ORGAN_MEMBER_TABLE, 'year');
    await queryRunner.query(`
      ALTER TABLE ${this.WRAPPED_TABLE}
      DROP PRIMARY KEY, ADD PRIMARY KEY (userId)
    `);
    await queryRunner.dropColumn(this.WRAPPED_TABLE, 'year');

    await queryRunner.createForeignKey(
      this.WRAPPED_ORGAN_MEMBER_TABLE,
      new TableForeignKey({
        columnNames: ['userId'],
        referencedTableName: this.WRAPPED_TABLE,
        referencedColumnNames: ['userId'],
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
        name: this.USER_FOREIGN_KEY,
      }),
    );
  }
}
