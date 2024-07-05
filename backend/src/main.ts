import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';


async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With, Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers',
  })

  await app.listen(3000);

}
bootstrap();
