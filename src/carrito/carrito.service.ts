import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carrito } from './entidades/carrito.entity';
import { CarritoItem } from './entidades/carrito-item.entity';
import { AgregarItemDto } from './dto/agregar-item.dto';
import { Usuario } from 'src/usuarios/entidades/usuario.entity';
import { Producto } from 'src/productos/entidades/producto.entity';
import { Talle } from 'src/productos/entidades/talle.entity';

@Injectable()
export class CarritoService {
  constructor(
    @InjectRepository(Carrito) private carritoRepo: Repository<Carrito>,
    @InjectRepository(CarritoItem) private itemRepo: Repository<CarritoItem>,
    @InjectRepository(Producto) private productoRepo: Repository<Producto>,
    @InjectRepository(Talle) private talleRepo: Repository<Talle>,
  ) {}

  async obtenerCarrito(usuario: Usuario): Promise<Carrito> {
    let carrito = await this.carritoRepo.findOne({
      where: { usuario: { id: usuario.id } },
      relations: ['items', 'items.producto', 'items.talle'],
    });

    if (!carrito) {
      carrito = this.carritoRepo.create({ usuario, items: [] });
      await this.carritoRepo.save(carrito);
    }

    return carrito;
  }

  async agregarItem(usuario: Usuario, dto: AgregarItemDto): Promise<Carrito> {
  const carrito = await this.obtenerCarrito(usuario);

  const producto = await this.productoRepo.findOne({
    where: { id: dto.productoId },
  });
  if (!producto) {
    throw new Error(`Producto con id ${dto.productoId} no encontrado`);
  }

  const talle = await this.talleRepo.findOne({
    where: { id: dto.talleId },
  });
  if (!talle) {
    throw new Error(`Talle con id ${dto.talleId} no encontrado`);
  }

  const itemExistente = await this.itemRepo.findOne({
    where: {
      carrito: { id: carrito.id },
      producto: { id: producto.id },
      talle: { id: talle.id },
    },
    relations: ['carrito', 'producto', 'talle'],
  });

  if (itemExistente) {
    itemExistente.cantidad += dto.cantidad;
    await this.itemRepo.save(itemExistente);
  } else {
    const nuevoItem = new CarritoItem();
    nuevoItem.carrito = carrito;
    nuevoItem.producto = producto;
    nuevoItem.talle = talle;
    nuevoItem.cantidad = dto.cantidad;

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
