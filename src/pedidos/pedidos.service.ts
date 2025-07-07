import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pedido } from './entidades/pedido.entity';
import { PedidoItem } from './entidades/pedido-item.entity';
import { Repository } from 'typeorm';
import { CarritoService } from 'src/carrito/carrito.service';
import { Usuario } from 'src/usuarios/entidades/usuario.entity';
import { CarritoItem } from 'src/carrito/entidades/carrito-item.entity';
import { Carrito } from 'src/carrito/entidades/carrito.entity';
import { plainToInstance } from 'class-transformer';
import { PedidoDto } from './dto/pedido.dto';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido) private pedidoRepo: Repository<Pedido>,
    @InjectRepository(PedidoItem) private itemRepo: Repository<PedidoItem>,
    @InjectRepository(CarritoItem) private carritoItemRepo: Repository<CarritoItem>,
    private carritoService: CarritoService,
  ) {}

  async confirmarPedido(usuario: Usuario): Promise<PedidoDto> {
  const carrito: Carrito = await this.carritoService.obtenerCarrito(usuario);

  if (!carrito.items || carrito.items.length === 0) {
    throw new Error('El carrito está vacío');
    }

    const pedido = this.pedidoRepo.create({
      usuario,
      estado: 'Pendiente',
      fechaHora: new Date(),
      items: [],
      total: 0,
    });

    let total = 0;

    for (const item of carrito.items) {
      const itemPedido = new PedidoItem();
      itemPedido.pedido = pedido;
      itemPedido.producto = item.productoCombinacion.producto;
      itemPedido.talle = item.productoCombinacion.talle;
      itemPedido.cantidad = item.cantidad;
      itemPedido.precioUnitario = +item.productoCombinacion.producto.precio;

      total += itemPedido.cantidad * itemPedido.precioUnitario;
      pedido.items.push(itemPedido);
    }

    pedido.total = total;

    const pedidoGuardado = await this.pedidoRepo.save(pedido);

    // Vaciar el carrito
    const carritoVacio = await this.carritoService.obtenerCarrito(usuario);
    await this.carritoItemRepo.remove(carritoVacio.items);

    // Transformar a DTO para evitar estructura circular
    return plainToInstance(PedidoDto, pedidoGuardado, { excludeExtraneousValues: true });
  }

  async obtenerPedidos(usuario: Usuario): Promise<PedidoDto[]> {
  const pedidos = await this.pedidoRepo.find({
    where: { usuario: { id: usuario.id } },
    relations: ['items', 'items.producto', 'items.talle'],
    order: { fechaHora: 'DESC' },
  });

  return plainToInstance(PedidoDto, pedidos, { excludeExtraneousValues: true });
}


  async vaciarCarrito(usuario: Usuario): Promise<void> {
    const carrito = await this.carritoService.obtenerCarrito(usuario);
    await this.carritoItemRepo.remove(carrito.items);
  }
}
