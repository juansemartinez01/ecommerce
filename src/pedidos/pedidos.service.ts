import { Injectable } from '@nestjs/common';
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
          color: { id: item.colorId },
          talle: { id: item.talleId },
        },
        relations: ['producto', 'color', 'talle'],
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
