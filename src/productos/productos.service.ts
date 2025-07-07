import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entidades/producto.entity';
import { Categoria } from './entidades/categoria.entity';
import { Talle } from './entidades/talle.entity';
import { Color } from './entidades/color.entity';
import { ProductoColorTalle } from './entidades/producto-color-talle.entity';
import { ImagenProducto } from './entidades/imagen-producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { FiltroProductoDto } from './dto/filtro-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private productoRepo: Repository<Producto>,
    @InjectRepository(Categoria)
    private categoriaRepo: Repository<Categoria>,
    @InjectRepository(Talle)
    private talleRepo: Repository<Talle>,
    @InjectRepository(Color)
    private colorRepo: Repository<Color>,
    @InjectRepository(ProductoColorTalle)
    private productoColorTalleRepo: Repository<ProductoColorTalle>,
    @InjectRepository(ImagenProducto)
    private imagenRepo: Repository<ImagenProducto>,
  ) {}

  async crearProducto(dto: CreateProductoDto): Promise<Producto> {
    const categoria = await this.categoriaRepo.findOneBy({ id: dto.categoriaId });
    if (!categoria) throw new Error(`Categoría con id ${dto.categoriaId} no encontrada`);

    const producto = this.productoRepo.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      precio: dto.precio,
      precioOferta: dto.precioOferta,
      enOferta: dto.enOferta,
      categoria,
    });

    const productoGuardado = await this.productoRepo.save(producto);

    // Guardar combinaciones producto-color-talle
    for (const c of dto.combinaciones) {
      const talle = await this.talleRepo.findOneBy({ id: c.talleId });
      const color = await this.colorRepo.findOneBy({ id: c.colorId });

      if (!talle || !color) throw new Error('Color o Talle inválido');

      const pct = new ProductoColorTalle();
      pct.producto = productoGuardado;
      pct.talle = talle;
      pct.color = color;
      pct.stock = c.stock;

      await this.productoColorTalleRepo.save(pct);
    }

    // Guardar imágenes
    for (const url of dto.imagenes) {
      const imagen = this.imagenRepo.create({ url, producto: productoGuardado });
      await this.imagenRepo.save(imagen);
    }

    return this.obtenerPorId(productoGuardado.id);
  }

  async listar(filtros: FiltroProductoDto): Promise<Producto[]> {
    const query = this.productoRepo.createQueryBuilder('producto')
      .leftJoinAndSelect('producto.categoria', 'categoria')
      .leftJoinAndSelect('producto.combinaciones', 'combinaciones')
      .leftJoinAndSelect('combinaciones.talle', 'talle')
      .leftJoinAndSelect('combinaciones.color', 'color')
      .leftJoinAndSelect('producto.imagenes', 'imagenes');

    if (filtros.categoriaId) {
      query.andWhere('categoria.id = :categoriaId', { categoriaId: filtros.categoriaId });
    }

    if (filtros.enOferta !== undefined) {
      query.andWhere('producto.enOferta = :enOferta', { enOferta: filtros.enOferta });
    }

    if (filtros.talleId) {
      query.andWhere('combinaciones.talle = :talleId', { talleId: filtros.talleId });
    }

    return query.getMany();
  }

  async obtenerPorId(id: number): Promise<Producto> {
    const producto = await this.productoRepo.findOne({
      where: { id },
      relations: [
        'categoria',
        'combinaciones',
        'combinaciones.talle',
        'combinaciones.color',
        'imagenes',
      ],
    });

    if (!producto) throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    return producto;
  }

  async obtenerCategorias(): Promise<Categoria[]> {
    return this.categoriaRepo.find();
  }

  async obtenerTalles(): Promise<Talle[]> {
    return this.talleRepo.find();
  }

  async obtenerColores(): Promise<Color[]> {
    return this.colorRepo.find();
  }

  async modificarProducto(id: number, dto: UpdateProductoDto): Promise<Producto> {
  const producto = await this.productoRepo.findOne({
    where: { id },
    relations: ['combinaciones', 'imagenes'],
  });

  if (!producto) throw new NotFoundException(`Producto con ID ${id} no encontrado`);

  if (dto.nombre !== undefined) producto.nombre = dto.nombre;
  if (dto.descripcion !== undefined) producto.descripcion = dto.descripcion;
  if (dto.precio !== undefined) producto.precio = dto.precio;
  if (dto.precioOferta !== undefined) producto.precioOferta = dto.precioOferta;
  if (dto.enOferta !== undefined) producto.enOferta = dto.enOferta;

  if (dto.categoriaId) {
    const categoria = await this.categoriaRepo.findOneBy({ id: dto.categoriaId });
    if (!categoria) throw new NotFoundException(`Categoría con ID ${dto.categoriaId} no encontrada`);
    producto.categoria = categoria;
  }

  await this.productoRepo.save(producto);

  // Actualizar combinaciones (eliminar y volver a crear)
  if (dto.combinaciones) {
    await this.productoColorTalleRepo.delete({ producto: { id } });
    for (const c of dto.combinaciones) {
      const talle = await this.talleRepo.findOneBy({ id: c.talleId });
      const color = await this.colorRepo.findOneBy({ id: c.colorId });
      if (!talle || !color) throw new Error('Color o Talle inválido');

      const pct = new ProductoColorTalle();
      pct.producto = producto;
      pct.talle = talle;
      pct.color = color;
      pct.stock = c.stock;

      await this.productoColorTalleRepo.save(pct);
    }
  }

  // Actualizar imágenes (eliminar y volver a crear)
  if (dto.imagenes) {
    await this.imagenRepo.delete({ producto: { id } });
    for (const url of dto.imagenes) {
      const imagen = this.imagenRepo.create({ url, producto });
      await this.imagenRepo.save(imagen);
    }
  }

  return this.obtenerPorId(id);
}

async eliminarProducto(id: number): Promise<void> {
  const producto = await this.productoRepo.findOneBy({ id });
  if (!producto) throw new NotFoundException(`Producto con ID ${id} no encontrado`);
  await this.productoRepo.delete(id);
}


}
