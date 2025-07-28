import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3000','http://frontend-ecommerce-mutuo-production.up.railway.app','https://mutuonline.com.ar'],
    credentials: true,
  });

  const reflector = app.get(Reflector);
  // Si querés proteger todo por default:
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();







