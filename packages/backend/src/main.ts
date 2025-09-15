import { NestFactory } from '@nestjs/core';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS with specific origins (no wildcard in production)
  const corsOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.ADMIN_PORTAL_URL, process.env.IOS_APP_URL].filter((url): url is string => Boolean(url))
    : true;

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // Global validation pipe with Spanish error messages
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // No global prefix - routes at root level

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('SafeTrade API')
    .setDescription('API de Reportes de Ciberseguridad - SafeTrade')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Autenticación', 'Endpoints de registro y login de usuarios')
    .addTag('Módulo de Usuarios', 'Gestión de perfiles de usuario')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`SafeTrade API running on port ${port}`);
  console.log(`Swagger Documentation available at http://localhost:${port}/docs`);
}

bootstrap();