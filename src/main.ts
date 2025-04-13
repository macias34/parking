import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { patchNestJsSwagger } from 'nestjs-zod';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@nestjs/common';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  patchNestJsSwagger();

  const config = new DocumentBuilder().setTitle('Parking API').build();
  const document = SwaggerModule.createDocument(app, config);
  saveSwaggerSchema(document);

  SwaggerModule.setup('/api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

function saveSwaggerSchema(document: OpenAPIObject) {
  const projectRoot = path.resolve(__dirname, '../..');
  const outputPath = path.join(projectRoot, 'swagger-schema.json');

  try {
    fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
    logger.log(`Swagger specification successfully generated at ${outputPath}`);
  } catch (error) {
    logger.error('Failed to generate Swagger specification file:', error);
  }
}

bootstrap();
