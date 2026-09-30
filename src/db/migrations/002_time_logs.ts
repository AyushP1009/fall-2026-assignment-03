/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('time_logs')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('ticket_id', 'integer', (col) =>
      col.notNull().references('tickets.id'),
    )
    .addColumn('user_id', 'integer', (col) =>
      col.notNull().references('users.id'),
    )
    .addColumn('hours', 'integer', (col) => col.notNull())
    .addColumn('logged_at', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('time_logs').execute();
}
