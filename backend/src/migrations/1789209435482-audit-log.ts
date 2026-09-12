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
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class AuditLog1789209435482 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'audit_log_entry',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'version',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'actorId',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'actorName',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'action',
            type: 'varchar',
            length: '64',
            isNullable: false,
          },
          {
            name: 'entityType',
            type: 'varchar',
            length: '64',
            isNullable: false,
          },
          {
            name: 'entityId',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'changes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'datetime(6)',
            default: 'current_timestamp',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'datetime(6)',
            default: 'current_timestamp',
            onUpdate: 'current_timestamp',
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.createIndex(
      'audit_log_entry',
      new TableIndex({
        name: 'IDX_audit_log_entry_entityType_entityId',
        columnNames: ['entityType', 'entityId'],
      }),
    );

    await queryRunner.createIndex(
      'audit_log_entry',
      new TableIndex({
        name: 'IDX_audit_log_entry_actorId',
        columnNames: ['actorId'],
      }),
    );

    await queryRunner.createIndex(
      'audit_log_entry',
      new TableIndex({
        name: 'IDX_audit_log_entry_createdAt',
        columnNames: ['createdAt'],
      }),
    );

    // The actor is nullable so that removing a user never removes the record of
    // what they did. The name of the actor is stored on the entry itself.
    await queryRunner.createForeignKey(
      'audit_log_entry',
      new TableForeignKey({
        name: 'FK_audit_log_entry_actorId',
        columnNames: ['actorId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'SET NULL',
        onUpdate: 'NO ACTION',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('audit_log_entry', 'FK_audit_log_entry_actorId');
    await queryRunner.dropIndex('audit_log_entry', 'IDX_audit_log_entry_createdAt');
    await queryRunner.dropIndex('audit_log_entry', 'IDX_audit_log_entry_actorId');
    await queryRunner.dropIndex('audit_log_entry', 'IDX_audit_log_entry_entityType_entityId');
    await queryRunner.dropTable('audit_log_entry');
  }
}
