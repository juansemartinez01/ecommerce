import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './entidades/producto.entity';
import { Categoria } from './entidades/categoria.entity';
import { Talle } from './entidades/talle.entity';
import { ProductoTalle } from './entidades/producto-talle.entity';
import { ProductosService } from './productos.service';
import { ProductosController } from './producto.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, Categoria, Talle, ProductoTalle])],
  providers: [ProductosService],
  controllers: [ProductosController],
})
export class ProductosModule {}
