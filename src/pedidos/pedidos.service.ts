import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from './entidades/pedido.entity';
import { PedidoItem } from './entidades/pedido-item.entity';
import { ConfirmarPedidoDto } from './dto/confirmar-pedido.dto';
import { Usuario } from 'src/usuarios/entidades/usuario.entity';
import { ProductoColorTalle } from 'src/productos/entidades/producto-color-talle.entity';
import { plainToInstance } from 'class-transformer';
import { PedidoDto } from './dto/pedido.dto';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido) private pedidoRepo: Repository<Pedido>,
    @InjectRepository(PedidoItem) private itemRepo: Repository<PedidoItem>,
    @InjectRepository(ProductoColorTalle) private pctRepo: Repository<ProductoColorTalle>,
    @InjectRepository(Usuario) private usuarioRepo: Repository<Usuario>,
  ) {}

  async confirmarPedido(usuario: Usuario, dto: ConfirmarPedidoDto): Promise<PedidoDto> {
  if (!dto.items || dto.items.length === 0) {
    throw new Error('No se recibieron ítems');
  }

  const pedido = this.pedidoRepo.create({
    usuario,
    estado: 'Pendiente',
    fechaHora: new Date(),
    items: [],
    total: 0,
  });

  let total = 0;

  for (const item of dto.items) {
    const combinacion = await this.pctRepo.findOneOrFail({
      where: {
        producto: { id: item.productoId },
        talle: { id: item.talleId },
        color: { id: item.colorId },
      },
      relations: ['producto', 'talle', 'color'],
    });

    const itemPedido = this.itemRepo.create({
      pedido,
      productoCombinacion: combinacion,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
    });

    total += item.cantidad * item.precioUnitario;
    pedido.items.push(itemPedido);
  }

  pedido.total = total;

  const pedidoGuardado = await this.pedidoRepo.save(pedido);

  return plainToInstance(PedidoDto, pedidoGuardado, { excludeExtraneousValues: true });
}


  async confirmarPedidoPorId(usuarioId: number, dto: ConfirmarPedidoDto): Promise<PedidoDto> {
  const usuario = await this.usuarioRepo.findOneByOrFail({ id: usuarioId });
  return this.confirmarPedido(usuario, dto);
  }

  async obtenerTodos(): Promise<PedidoDto[]> {
  const pedidos = await this.pedidoRepo.find({
    relations: ['items', 'items.productoCombinacion', 'items.productoCombinacion.producto', 'items.productoCombinacion.talle', 'items.productoCombinacion.color'],
    order: { fechaHora: 'DESC' },
  });

  return plainToInstance(PedidoDto, pedidos, { excludeExtraneousValues: true });
}


}
