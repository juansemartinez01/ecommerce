import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pedido } from './entidades/pedido.entity';
import { PedidoItem } from './entidades/pedido-item.entity';
import { Repository } from 'typeorm';
import { ProductoColorTalle } from 'src/productos/entidades/producto-color-talle.entity';
import { Usuario } from 'src/usuarios/entidades/usuario.entity';
import { ConfirmarPedidoDto } from './dto/confirmar-pedido.dto';
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

  async confirmarPedido(dto: ConfirmarPedidoDto): Promise<PedidoDto> {
  const usuario = await this.usuarioRepo.findOneByOrFail({ id: dto.usuarioId });

  // Crear pedido base
  const pedido = this.pedidoRepo.create({
    usuario,
    estado: 'Pendiente',
    fechaHora: new Date(),
    total: 0,
    nombreCliente: dto.nombreCliente,
    apellidoCliente: dto.apellidoCliente,
    emailCliente: dto.emailCliente,
    telefonoCliente: dto.telefonoCliente,
    nombreEnvio: dto.nombreEnvio,
    direccionEnvio: dto.direccionEnvio,
    codigoPostalEnvio: dto.codigoPostalEnvio,
    ciudadEnvio: dto.ciudadEnvio,
    provinciaEnvio: dto.provinciaEnvio,
    aclaracionesEnvio: dto.aclaracionesEnvio,
    metodoPago: dto.metodoPago,
  // estadoPago y estadoPedido se ponen por defecto
  });

  // Guardar el pedido para que tenga ID (requerido para la relación)
  const pedidoGuardado = await this.pedidoRepo.save(pedido);

  let total = 0;
  const itemsPedido: PedidoItem[] = [];

  for (const item of dto.items) {
    const combinacion = await this.pctRepo.findOne({
      where: {
        producto: { id: item.productoId },
        color: { id: item.colorId },
        talle: { id: item.talleId },
      },
      relations: ['producto', 'color', 'talle'],
    });

    if (!combinacion) {
    throw new BadRequestException(`No existe una combinación para producto ID ${item.productoId}, talle ID ${item.talleId} y color ID ${item.colorId}`);
  }


    if (combinacion.stock < item.cantidad) {
    throw new BadRequestException(`Stock insuficiente para el producto "${combinacion.producto.nombre}", talle "${combinacion.talle.nombre}", color "${combinacion.color.nombre}"`);
  }


    // Descontar stock (usamos save, no update para evitar errores)
    combinacion.stock -= item.cantidad;
    await this.pctRepo.save(combinacion);

    const nuevoItem = this.itemRepo.create({
      pedido: pedidoGuardado,
      productoCombinacion: combinacion,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
    });

    total += item.cantidad * item.precioUnitario;
    itemsPedido.push(nuevoItem);
  }

  // Guardar los ítems del pedido
  await this.itemRepo.save(itemsPedido);

  // Actualizar total del pedido
  pedidoGuardado.total = total;
  pedidoGuardado.items = itemsPedido;
  await this.pedidoRepo.save(pedidoGuardado);

  return plainToInstance(PedidoDto, pedidoGuardado, {
    excludeExtraneousValues: true,
  });
}




  async listarTodos(): Promise<PedidoDto[]> {
    const pedidos = await this.pedidoRepo.find({
      relations: [
        'items',
        'items.productoCombinacion',
        'items.productoCombinacion.producto',
        'items.productoCombinacion.color',
        'items.productoCombinacion.talle',
      ],
      order: { fechaHora: 'DESC' },
    });

    return plainToInstance(PedidoDto, pedidos, { excludeExtraneousValues: true });
  }


  async cancelarPedido(pedidoId: number): Promise<string> {
  const pedido = await this.pedidoRepo.findOne({
    where: { id: pedidoId },
    relations: ['items', 'items.productoCombinacion'],
  });

  if (!pedido) {
    throw new Error(`Pedido con ID ${pedidoId} no encontrado`);
  }

  if (pedido.estado === 'Cancelado') {
    throw new Error(`El pedido ya está cancelado`);
  }

  // Devolver el stock
  for (const item of pedido.items) {
    const combinacion = item.productoCombinacion;
    combinacion.stock += item.cantidad;
    await this.pctRepo.save(combinacion);
  }

  // Cambiar estado del pedido
  pedido.estado = 'Cancelado';
  await this.pedidoRepo.save(pedido);

  return `Pedido ID ${pedidoId} cancelado y stock restituido`;
}

async actualizarEstado(id: number, nuevoEstado: string): Promise<Pedido> {
  const pedido = await this.pedidoRepo.findOneBy({ id });
  if (!pedido) throw new NotFoundException(`Pedido con ID ${id} no encontrado`);

  pedido.estado = nuevoEstado;
  await this.pedidoRepo.save(pedido);

  return pedido;
}

}
