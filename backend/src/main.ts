import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule); // Cria a aplicação NestJS

  app.enableCors({
    origin: ['http://localhost:5173', 'https://repforce-test.netlify.app'],
  }); // Permite requisições do frontend rodando localmente e do deploy na Netlify

  await app.listen(3000); // Back roda na porta 3000
}

bootstrap();
