import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carrito } from './entidades/carrito.entity';
import { CarritoItem } from './entidades/carrito-item.entity';
import { AddCarritoItemDto } from './dto/add-carrito-item.dto';
import { Usuario } from 'src/usuarios/entidades/usuario.entity';
import { ProductoColorTalle } from 'src/productos/entidades/producto-color-talle.entity';

@Injectable()
export class CarritoService {
  constructor(
    @InjectRepository(Carrito) private carritoRepo: Repository<Carrito>,
    @InjectRepository(CarritoItem) private itemRepo: Repository<CarritoItem>,
    @InjectRepository(ProductoColorTalle) private pctRepo: Repository<ProductoColorTalle>,
  ) {}

  async obtenerCarrito(usuario: Usuario): Promise<Carrito> {
    let carrito = await this.carritoRepo.findOne({
      where: { usuario: { id: usuario.id } },
      relations: [
        'items',
        'items.productoCombinacion',
        'items.productoCombinacion.producto',
        'items.productoCombinacion.talle',
        'items.productoCombinacion.color',
      ],
    });

    if (!carrito) {
      carrito = this.carritoRepo.create({ usuario, items: [] });
      await this.carritoRepo.save(carrito);
    }

    return carrito;
  }

  async agregarItem(usuario: Usuario, dto: AddCarritoItemDto): Promise<Carrito> {
    const carrito = await this.obtenerCarrito(usuario);

    const combinacion = await this.pctRepo.findOne({
      where: { id: dto.productoColorTalleId },
      relations: ['producto', 'talle', 'color'],
    });

    if (!combinacion) {
      throw new Error(`Combinación producto-talle-color con id ${dto.productoColorTalleId} no encontrada`);
    }

    // Verificar si ya existe un item con esa combinación
    const itemExistente = await this.itemRepo.findOne({
      where: {
        carrito: { id: carrito.id },
        productoCombinacion: { id: combinacion.id },
      },
      relations: ['carrito', 'productoCombinacion'],
    });

    if (itemExistente) {
      itemExistente.cantidad += dto.cantidad;
      await this.itemRepo.save(itemExistente);
    } else {
      const nuevoItem = this.itemRepo.create({
        carrito,
        productoCombinacion: combinacion,
        cantidad: dto.cantidad,
      });
      await this.itemRepo.save(nuevoItem);
    }

    return this.obtenerCarrito(usuario);
  }

  async eliminarItem(usuario: Usuario, itemId: number): Promise<Carrito> {
    const carrito = await this.obtenerCarrito(usuario);
    const item = carrito.items.find(i => i.id === itemId);
    if (item) await this.itemRepo.remove(item);
    return this.obtenerCarrito(usuario);
  }
}
