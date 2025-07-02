import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from './entidades/pedido.entity';
import { PedidoItem } from './entidades/pedido-item.entity';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { CarritoModule } from 'src/carrito/carrito.module';
import { CarritoItem } from 'src/carrito/entidades/carrito-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pedido, PedidoItem,CarritoItem]),
    CarritoModule,
  ],
  providers: [PedidosService],
  controllers: [PedidosController],
})
export class PedidosModule {}
