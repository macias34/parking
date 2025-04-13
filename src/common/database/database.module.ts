import { Global, Logger, Module, OnModuleInit, Inject } from '@nestjs/common';
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
import { exec } from 'child_process';
import { promisify } from 'util';
import { DB } from './database.types';

export abstract class Database extends Kysely<DB> {}

const execPromise = promisify(exec);

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: Database,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Kysely<DB> => {
        const connectionString =
          configService.getOrThrow<string>('DATABASE_URL');
        const dialect = new PostgresDialect({
          pool: new Pool({ connectionString }),
        });
        return new Kysely<DB>({
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

  constructor(
    private readonly db: Database,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    try {
      await this.runMigrations();

      const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');

      if (nodeEnv !== 'production') {
        await this.generateDatabaseTypes();
      } else {
        this.logger.log(
          'Skipping database types generation in production environment.',
          DatabaseModule.name,
        );
      }

      this.logger.log(
        'Database initialization steps completed successfully.',
        DatabaseModule.name,
      );
    } catch (error) {
      this.logger.error(
        'Unhandled error during database module initialization. Exiting.',
        error.stack,
        DatabaseModule.name,
      );
      process.exit(1);
    }
  }

  private async runMigrations() {
    this.logger.log(
      'Attempting to run database migrations...',
      DatabaseModule.name,
    );
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
        if (it.status === 'Success')
          this.logger.log(
            `Migration "${it.migrationName}" was executed successfully`,
            DatabaseModule.name,
          );
        else if (it.status === 'Error')
          this.logger.error(
            `Failed to execute migration "${it.migrationName}"`,
            undefined,
            DatabaseModule.name,
          );
        else if (it.status === 'NotExecuted')
          this.logger.log(
            `Migration "${it.migrationName}" was already executed.`,
            DatabaseModule.name,
          );
      });

      if (error) {
        this.logger.error(
          'Failed to migrate database. Exiting process.',
          error,
          DatabaseModule.name,
        );
        process.exit(1);
      }

      const success = results?.some((r) => r.status === 'Success');
      if (success)
        this.logger.log(
          'Database migrations finished successfully.',
          DatabaseModule.name,
        );
      else if (results?.length > 0)
        this.logger.log(
          'All migrations were already executed.',
          DatabaseModule.name,
        );
      else this.logger.log('No migrations found to run.', DatabaseModule.name);
    } catch (error) {
      this.logger.error(
        'Critical error during migration setup. Exiting process.',
        error.stack,
        DatabaseModule.name,
      );
      process.exit(1);
    }
  }

  private async generateDatabaseTypes() {
    this.logger.log(
      'Attempting to generate database types (kysely-codegen)...',
      DatabaseModule.name,
    );
    try {
      const dbUrl = this.configService.getOrThrow<string>('DATABASE_URL');
      const outFile = path.join(
        process.cwd(),
        'src',
        'common',
        'database',
        'database.types.ts',
      );
      const command = `npx kysely-codegen --dialect=postgres --url="${dbUrl}" --out-file=${outFile}`;

      const { stdout, stderr } = await execPromise(command);

      if (stderr)
        this.logger.warn(
          `Database types generator finished with stderr output: ${stderr}`,
          DatabaseModule.name,
        );
      if (stdout)
        this.logger.log(
          `Database types generator stdout: ${stdout}`,
          DatabaseModule.name,
        );

      this.logger.log(
        'Database types generated successfully.',
        DatabaseModule.name,
      );
    } catch (error) {
      this.logger.error(
        'Database types generation failed. Exiting process.',
        error.stack,
        DatabaseModule.name,
      );
      if (error.stderr)
        this.logger.error(
          `Generator stderr on failure: ${error.stderr}`,
          DatabaseModule.name,
        );
      if (error.stdout)
        this.logger.warn(
          `Generator stdout on failure: ${error.stdout}`,
          DatabaseModule.name,
        );
      process.exit(1);
    }
  }
}
