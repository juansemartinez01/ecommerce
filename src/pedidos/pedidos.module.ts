import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';
import { Pedido } from './entidades/pedido.entity';
import { PedidoItem } from './entidades/pedido-item.entity';
import { ProductoColorTalle } from 'src/productos/entidades/producto-color-talle.entity';
import { Usuario } from 'src/usuarios/entidades/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pedido,
      PedidoItem,
      ProductoColorTalle,
      Usuario,
    ]),
  ],
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class PedidosModule {}
