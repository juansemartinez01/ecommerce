import { BadRequestException, Injectable } from '@nestjs/common';
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

  // 1. Crear y guardar el pedido sin items ni total
  const pedido = this.pedidoRepo.create({
    usuario,
    estado: 'Pendiente',
    fechaHora: new Date(),
    total: 0,

    // Datos de envío
    nombreEnvio: dto.nombreEnvio,
    direccionEnvio: dto.direccionEnvio,
    codigoPostalEnvio: dto.codigoPostalEnvio,
    ciudadEnvio: dto.ciudadEnvio,
    provinciaEnvio: dto.provinciaEnvio,
    aclaracionesEnvio: dto.aclaracionesEnvio,

    // Datos del cliente
    nombreCliente: dto.nombreCliente,
    apellidoCliente: dto.apellidoCliente,
    emailCliente: dto.emailCliente,
    telefonoCliente: dto.telefonoCliente,
  });

  await this.pedidoRepo.save(pedido); // necesario para tener ID

  let total = 0;
  const items: PedidoItem[] = [];

  // 2. Crear ítems relacionados con el pedido ya guardado
  for (const item of dto.items) {
  let combinacion: ProductoColorTalle;

  try {
    combinacion = await this.pctRepo.findOneOrFail({
      where: {
        producto: { id: item.productoId },
        color: { id: item.colorId },
        talle: { id: item.talleId },
      },
      relations: ['producto', 'color', 'talle'],
    });
  } catch (error) {
    if (error.name === 'EntityNotFoundError') {
      throw new BadRequestException(
      `No existe la combinación para producto ID ${item.productoId} con color ID ${item.colorId} y talle ID ${item.talleId}`
    );

    }
    throw error; // relanzamos si es otro tipo de error
  }

  const itemPedido = this.itemRepo.create({
    pedido,
    productoCombinacion: combinacion,
    cantidad: item.cantidad,
    precioUnitario: item.precioUnitario,
  });

  total += item.cantidad * item.precioUnitario;
  items.push(itemPedido);


  }

  await this.itemRepo.save(items);

  // 3. Actualizar el total del pedido
  pedido.total = total;
  await this.pedidoRepo.save(pedido);

  // 4. Consultar el pedido final con todas sus relaciones
  const pedidoFinal = await this.pedidoRepo.findOneOrFail({
    where: { id: pedido.id },
    relations: [
      'items',
      'items.productoCombinacion',
      'items.productoCombinacion.producto',
      'items.productoCombinacion.color',
      'items.productoCombinacion.talle',
    ],
  });

  return plainToInstance(PedidoDto, pedidoFinal, { excludeExtraneousValues: true });
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
}
