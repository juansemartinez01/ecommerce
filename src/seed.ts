// src/seed.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { Categoria } from './productos/entidades/categoria.entity';
import { Talle } from './productos/entidades/talle.entity';
import { Descuento } from './descuentos/entidades/descuento.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const categoriaRepo = dataSource.getRepository(Categoria);
  const talleRepo = dataSource.getRepository(Talle);
  const descuentoRepo = dataSource.getRepository(Descuento);

  // Categorías
  const categorias = ['Remeras', 'Pantalones', 'Camperas', 'Accesorios'];
  for (const nombre of categorias) {
    const existe = await categoriaRepo.findOneBy({ nombre });
    if (!existe) {
      await categoriaRepo.save(categoriaRepo.create({ nombre }));
    }
  }

  // Talles
  const talles = ['XS', 'S', 'M', 'L', 'XL'];
  for (const nombre of talles) {
    const existe = await talleRepo.findOneBy({ nombre });
    if (!existe) {
      await talleRepo.save(talleRepo.create({ nombre }));
    }
  }

  // Descuento de prueba
  const codigo = 'PROMO10';
  const yaExiste = await descuentoRepo.findOneBy({ codigo });
  if (!yaExiste) {
    const cupon = descuentoRepo.create({
      codigo,
      porcentaje: 10,
      montoFijo: undefined,
      usoMinimo: 1000,
      fechaExpiracion: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), // +30 días
      activo: true,
    });
    await descuentoRepo.save(cupon);
  }

  console.log('✅ Seed completado correctamente.');
  await app.close();
}

bootstrap();
