import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: [process.env.PROD_FRONTEND_URL ?? '', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new LoggingInterceptor());

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Life Med System API')
    .setDescription(
      'API do sistema de gestão médica Life Med — autenticação, usuários, profissionais de saúde e pacientes.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addTag('Auth', 'Registro, login e recuperação de senha')
    .addTag('Users', 'Gestão de usuários')
    .addTag('Professional', 'Configurações e agenda do profissional de saúde')
    .addTag('Patients', 'Exportação de relatórios do paciente')
    .addTag('Manager', 'Gestão de pacientes e consultas pelo gestor')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  app.use(
    '/api/docs',
    apiReference({
      theme: 'purple',
      content: document,
    }),
  );

  const port = process.env.PORT ?? 8000;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
  console.log(`API docs (Scalar) at http://localhost:${port}/api/docs`);
}
bootstrap();
