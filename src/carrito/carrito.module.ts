import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carrito } from './entidades/carrito.entity';
import { CarritoItem } from './entidades/carrito-item.entity';
import { CarritoService } from './carrito.service';
import { CarritoController } from './carrito.controller';

import { ProductoColorTalle } from 'src/productos/entidades/producto-color-talle.entity';
import { ProductosModule } from 'src/productos/productos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Carrito, CarritoItem, ProductoColorTalle]),
    ProductosModule, // 👈 IMPORTANTE
  ],
  providers: [CarritoService],
  controllers: [CarritoController],
  exports: [CarritoService],
})
export class CarritoModule {}
