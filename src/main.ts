import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Configurar CORS
  app.enableCors();

  // Configurar prefijo global para la API
  app.setGlobalPrefix('api');

  // Configurar Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('API Clínica Odontológica')
    .setDescription('Sistema de gestión integral para clínica odontológica con historias clínicas, odontogramas y gestión de archivos')
    .setVersion('2.0')
    .addTag('auth', 'Autenticación y autorización')
    .addTag('pacientes', 'Gestión de pacientes')
    .addTag('turnos', 'Gestión de turnos y citas')
    .addTag('historias', 'Historias clínicas')
    .addTag('odontogramas', 'Odontogramas con versionado')
    .addTag('adjuntos', 'Gestión de archivos médicos')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtenido del endpoint de login',
      },
      'access-token'
    )
    .addServer('http://localhost:3000', 'Servidor de desarrollo')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  await app.listen(process.env.PORT || 3000);
  console.log(`🚀 Aplicación ejecutándose en: http://localhost:${process.env.PORT || 3000}/api`);
  console.log(`📚 Documentación Swagger: http://localhost:${process.env.PORT || 3000}/docs`);
}
bootstrap();
