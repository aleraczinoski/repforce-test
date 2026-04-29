import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule); // Cria a aplicação NestJS

  app.enableCors({
    origin: 'http://localhost:5173',
  }); //Conexão front e back -> Back aceita requisições vindas da porta 5173

  await app.listen(3000); // Back roda na porta 3000
}

bootstrap();
