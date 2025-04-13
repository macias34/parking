import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';

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
export class DatabaseModule {}
