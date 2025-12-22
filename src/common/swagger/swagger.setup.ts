import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication, title: string, description: string, tags: string[]) {
  const builder = new DocumentBuilder().setTitle(title).setDescription(description).setVersion('1.0');

  tags.forEach(tag => builder.addTag(tag));

  const document = SwaggerModule.createDocument(app, builder.build());
  SwaggerModule.setup('api/docs', app, document);
}
