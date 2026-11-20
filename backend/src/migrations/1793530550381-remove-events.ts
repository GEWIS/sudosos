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
 * Removes the deprecated events system (event planning and shift assignment).
 *
 * Drops the `event`, `event_shift`, `event_shift_answer` tables and their join tables,
 * and removes leftover `ForgotEventPlanning` notification preferences and
 * `Event`/`EventAnswer` permissions.
 *
 * `down` only restores the empty table structure. Dropped rows, notification preferences
 * and permissions are not restored.
 */
export class RemoveEvents1793530550381 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM user_notification_preference WHERE type = ?', ['ForgotEventPlanning']);
    await queryRunner.query('DELETE FROM permission WHERE entity IN (?, ?)', ['Event', 'EventAnswer']);

    await queryRunner.dropTable('event_shift_answer', true);
    await queryRunner.dropTable('event_shift_roles_role', true);
    await queryRunner.dropTable('event_shifts_event_shift', true);
    await queryRunner.dropTable('event_shift', true);
    await queryRunner.dropTable('event', true);
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
        { name: 'IDX_event_createdAt', columnNames: ['createdAt'] },
      ],
    }), true);
    await queryRunner.createForeignKey('event', new TableForeignKey({
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION',
      name: 'FK_event_createdById_user',
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
        { name: 'IDX_event_shift_createdAt', columnNames: ['createdAt'] },
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
        { name: 'IDX_event_shifts_event_shift_eventId', columnNames: ['eventId'] },
        { name: 'IDX_event_shifts_event_shift_eventShiftId', columnNames: ['eventShiftId'] },
      ],
    }), true);
    await queryRunner.createForeignKeys('event_shifts_event_shift', [
      new TableForeignKey({
        name: 'FK_event_shifts_event_shift_eventId_event',
        columnNames: ['eventId'],
        referencedTableName: 'event',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
      new TableForeignKey({
        name: 'FK_event_shifts_event_shift_eventShiftId_event_shift',
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
        name: 'FK_event_shift_roles_role_eventShiftId_event_shift',
        columnNames: ['eventShiftId'],
        referencedTableName: 'event_shift',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
      new TableForeignKey({
        name: 'FK_event_shift_roles_role_roleId_role',
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
        { name: 'IDX_event_shift_answer_createdAt', columnNames: ['createdAt'] },
      ],
    }), true);
    await queryRunner.createForeignKeys('event_shift_answer', [
      new TableForeignKey({
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_event_shift_answer_userId_user',
        columnNames: ['userId'],
        referencedTableName: 'user',
        referencedColumnNames: ['id'],
      }),
      new TableForeignKey({
        onDelete: 'RESTRICT',
        onUpdate: 'NO ACTION',
        name: 'FK_event_shift_answer_shiftId_event_shift',
        columnNames: ['shiftId'],
        referencedTableName: 'event_shift',
        referencedColumnNames: ['id'],
      }),
      new TableForeignKey({
        name: 'FK_event_shift_answer_eventId_event',
        columnNames: ['eventId'],
        referencedTableName: 'event',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      }),
    ]);
  }
}
