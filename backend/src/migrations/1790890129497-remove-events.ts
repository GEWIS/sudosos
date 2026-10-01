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
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

/**
 * Removes the deprecated events system (events, event shifts and shift answers).
 */
export class RemoveEvents1790890129497 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM user_notification_preference WHERE type = \'ForgotEventPlanning\'');
    await queryRunner.query('DELETE FROM permission WHERE entity IN (\'Event\', \'EventAnswer\')');

    await queryRunner.dropTable('event_shift_answer', true, true, true);
    await queryRunner.dropTable('event_shifts_event_shift', true, true, true);
    await queryRunner.dropTable('event_shift_roles_role', true, true, true);
    await queryRunner.dropTable('event', true, true, true);
    await queryRunner.dropTable('event_shift', true, true, true);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'event',
      engine: 'InnoDB',
      columns: [
        { name: 'createdAt', type: 'datetime(6)', default: 'CURRENT_TIMESTAMP(6)', isNullable: false },
        { name: 'updatedAt', type: 'datetime(6)', default: 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)', isNullable: false },
        { name: 'version', type: 'int', isNullable: false },
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'name', type: 'varchar', length: '255', isNullable: false },
        { name: 'startDate', type: 'datetime', isNullable: false },
        { name: 'endDate', type: 'datetime', isNullable: false },
        { name: 'type', type: 'varchar', length: '255', isNullable: false },
        { name: 'createdById', type: 'int', isNullable: false },
      ],
      indices: [
        { name: 'IDX_77b45e61f3194ba2be468b0778', columnNames: ['createdAt'] },
      ],
    }), true);
    await queryRunner.createForeignKey('event', new TableForeignKey({
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION',
      name: 'FK_1d5a6b5f38273d74f192ae552a6',
      columnNames: ['createdById'],
      referencedTableName: 'user',
      referencedColumnNames: ['id'],
    }));

    await queryRunner.createTable(new Table({
      name: 'event_shift',
      engine: 'InnoDB',
      columns: [
        { name: 'createdAt', type: 'datetime(6)', default: 'CURRENT_TIMESTAMP(6)', isNullable: false },
        { name: 'updatedAt', type: 'datetime(6)', default: 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)', isNullable: false },
        { name: 'version', type: 'int', isNullable: false },
        { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
        { name: 'deletedAt', type: 'datetime(6)', isNullable: true },
        { name: 'name', type: 'varchar', length: '255', isNullable: false },
      ],
      indices: [
        { name: 'IDX_cdb1fdd9afd869277e2d754818', columnNames: ['createdAt'] },
      ],
    }), true);

    await queryRunner.createTable(new Table({
      name: 'event_shifts_event_shift',
      engine: 'InnoDB',
      columns: [
        { name: 'eventId', type: 'int', isPrimary: true },
        { name: 'eventShiftId', type: 'int', isPrimary: true },
      ],
      indices: [
        { name: 'IDX_4a5816ad85f83216ff9358452e', columnNames: ['eventId'] },
        { name: 'IDX_f37c7de1e636e65e2d45290cf9', columnNames: ['eventShiftId'] },
      ],
    }), true);
    await queryRunner.createForeignKeys('event_shifts_event_shift', [
      new TableForeignKey({
        name: 'FK_4a5816ad85f83216ff9358452e8',
        columnNames: ['eventId'],
        referencedTableName: 'event',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
      new TableForeignKey({
        name: 'FK_f37c7de1e636e65e2d45290cf91',
        columnNames: ['eventShiftId'],
        referencedTableName: 'event_shift',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    ]);

    await queryRunner.createTable(new Table({
      name: 'event_shift_roles_role',
      engine: 'InnoDB',
      columns: [
        { name: 'eventShiftId', type: 'int', isPrimary: true },
        { name: 'roleId', type: 'int', isPrimary: true },
      ],
    }), true);
    await queryRunner.createForeignKeys('event_shift_roles_role', [
      new TableForeignKey({
        name: 'FK_b7bc5f8d015ac4ab0fa9353cea0',
        columnNames: ['eventShiftId'],
        referencedTableName: 'event_shift',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
      new TableForeignKey({
        name: 'FK_ac36ca9f11e4cebf7a7fc4fd1e1',
        columnNames: ['roleId'],
        referencedTableName: 'role',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    ]);

    await queryRunner.createTable(new Table({
      name: 'event_shift_answer',
      engine: 'InnoDB',
      columns: [
        { name: 'createdAt', type: 'datetime(6)', default: 'CURRENT_TIMESTAMP(6)', isNullable: false },
        { name: 'updatedAt', type: 'datetime(6)', default: 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)', isNullable: false },
        { name: 'version', type: 'int', isNullable: false },
        { name: 'userId', type: 'int', isPrimary: true },
        { name: 'availability', type: 'varchar', length: '255', isNullable: true },
        { name: 'selected', type: 'tinyint', default: 0, isNullable: false },
        { name: 'shiftId', type: 'int', isPrimary: true },
        { name: 'eventId', type: 'int', isPrimary: true },
      ],
      indices: [
        { name: 'IDX_cde8d23385a9e5db4b82ec3b36', columnNames: ['createdAt'] },
      ],
    }), true);
    await queryRunner.createForeignKeys('event_shift_answer', [
      new TableForeignKey({
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_1e20b4b670a4b781ebb26671098',
        columnNames: ['userId'],
        referencedTableName: 'user',
        referencedColumnNames: ['id'],
      }),
      new TableForeignKey({
        onDelete: 'RESTRICT',
        onUpdate: 'NO ACTION',
        name: 'FK_0f619764862ac181f7ebb2eed27',
        columnNames: ['shiftId'],
        referencedTableName: 'event_shift',
        referencedColumnNames: ['id'],
      }),
      new TableForeignKey({
        name: 'FK_a6887f089a4dd5fe71c41526695',
        columnNames: ['eventId'],
        referencedTableName: 'event',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      }),
    ]);
  }
}
