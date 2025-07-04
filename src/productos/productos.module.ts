import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './entidades/producto.entity';
import { Categoria } from './entidades/categoria.entity';
import { Talle } from './entidades/talle.entity';
import { Color } from './entidades/color.entity';
import { ProductoColorTalle } from './entidades/producto-color-talle.entity';
import { ImagenProducto } from './entidades/imagen-producto.entity';
import { ProductosService } from './productos.service';
import { ProductosController } from './producto.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Producto,
      Categoria,
      Talle,
      Color,
      ProductoColorTalle,
      ImagenProducto,
    ]),
  ],
  providers: [ProductosService],
  controllers: [ProductosController],
})
export class ProductosModule {}
