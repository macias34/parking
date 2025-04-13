import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { patchNestJsSwagger } from 'nestjs-zod';
import { Logger } from '@nestjs/common';
import { exec as execCallback } from 'child_process';
import * as util from 'util';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  patchNestJsSwagger();

  const config = new DocumentBuilder().setTitle('Parking API').build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('/api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  await generateClientSchema();
}

const execPromise = util.promisify(execCallback);

async function generateClientSchema(): Promise<void> {
  const command =
    'npx openapi-typescript http://localhost:3000/api/docs-json -o api-client/schema.d.ts';
  logger.log(`Generating Swagger schema`);

  try {
    const { stdout, stderr } = await execPromise(command);

    if (stderr) {
      logger.warn(`Error while generating Swagger schema: ${stderr.trim()}`);
    }
    if (stdout) {
      logger.log(stdout.trim());
    }
    logger.log('Swagger schema generated successfully');
  } catch (error) {
    logger.error(
      `Failed to generate Swagger schema: ${error.message}`,
      error.stack,
    );
    if (error.stderr) {
      logger.error(`Failed to generate Swagger schema: ${error.stderr.trim()}`);
    }
  }
}

bootstrap();
