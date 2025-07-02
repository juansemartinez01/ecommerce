import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carrito } from './entidades/carrito.entity';
import { CarritoItem } from './entidades/carrito-item.entity';
import { CarritoService } from './carrito.service';
import { CarritoController } from './carrito.controller';
import { Producto } from 'src/productos/entidades/producto.entity';
import { Talle } from 'src/productos/entidades/talle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Carrito, CarritoItem, Producto, Talle])],
  providers: [CarritoService],
  controllers: [CarritoController],
  exports: [CarritoService],
})
export class CarritoModule {}
