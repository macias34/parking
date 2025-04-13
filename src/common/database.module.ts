import { Global, Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  FileMigrationProvider,
  Kysely,
  Migrator,
  PostgresDialect,
} from 'kysely';
import { Pool } from 'pg';
import { promises as fs } from 'fs';
import * as path from 'path';

export abstract class Database extends Kysely<{}> {}

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: Database,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Database => {
        const connectionString = configService.get<string>('DATABASE_URL');
        if (!connectionString) {
          throw new Error('DATABASE_URL environment variable is not set');
        }

        const dialect = new PostgresDialect({
          pool: new Pool({ connectionString }),
        });

        return new Kysely<{}>({
          dialect,
          log(event) {
            if (event.level === 'query') {
              console.log(event.query.sql, event.query.parameters);
            }
          },
        });
      },
    },
  ],
  exports: [Database],
})
export class DatabaseModule implements OnModuleInit {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(private readonly db: Database) {}

  async onModuleInit() {
    this.logger.log('Running migrations to latest...');

    try {
      const migrator = new Migrator({
        db: this.db,
        provider: new FileMigrationProvider({
          fs,
          path,
          migrationFolder: path.join(process.cwd(), 'migrations'),
        }),
      });
      const { error, results } = await migrator.migrateToLatest();

      results?.forEach((it) => {
        if (it.status === 'Success') {
          this.logger.log(
            `Migration "${it.migrationName}" was executed successfully`,
          );
        } else if (it.status === 'Error') {
          this.logger.error(
            `Failed to execute migration "${it.migrationName}"`,
          );
        } else if (it.status === 'NotExecuted') {
          this.logger.log(
            `Migration "${it.migrationName}" was already executed.`,
          );
        }
      });

      if (error) {
        this.logger.error('Failed to migrate database', error);
        process.exit(1);
      } else {
        const success =
          results &&
          results.length > 0 &&
          results.some((r) => r.status === 'Success');

        if (success) {
          this.logger.log('Database migrations finished successfully.');
        } else {
          this.logger.log('No new database migrations to run.');
        }
      }
    } catch (error) {
      this.logger.error('Could not run database migrations', error);
      process.exit(1);
    }
  }
}
