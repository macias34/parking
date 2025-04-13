import type { Kysely } from 'kysely';

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('order')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .execute();

  await db.schema
    .createTable('order_line')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn('product_id', 'varchar', (col) => col.notNull())
    .addColumn('price', 'decimal', (col) => col.notNull())
    .addColumn('quantity', 'int4', (col) => col.notNull())
    .execute();
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('order').execute();
  await db.schema.dropTable('order_line').execute();
}
