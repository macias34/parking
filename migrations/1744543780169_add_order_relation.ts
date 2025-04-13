import type { Kysely } from 'kysely';

const foreignKeyConstraint = 'order_line_order_id_fk';

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('order_line')
    .addForeignKeyConstraint(foreignKeyConstraint, ['order_id'], 'order', [
      'id',
    ])
    .execute();
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('order_line').dropConstraint(foreignKeyConstraint);
}
