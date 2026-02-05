import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication, title: string, description: string, tags: string[]) {
  const builder = new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setVersion('1.0')

    /**
     * ============================
     * Internal API Key Security
     * ============================
     */
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-internal-api-key',
        in: 'header',
        description: 'Internal API Key required for internal endpoints'
      },
      'internal-api-key'
    );

  /**
   * ============================
   * Tags
   * ============================
   */
  tags.forEach(tag => builder.addTag(tag));

  const document = SwaggerModule.createDocument(app, builder.build());

  SwaggerModule.setup('api/docs', app, document);
}
