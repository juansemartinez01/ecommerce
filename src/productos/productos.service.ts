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
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { CreateColorDto } from './dto/create-color.dto';

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
      destacado: dto.destacado ?? null,
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

    if (filtros.destacado !== undefined) {
      query.andWhere('producto.destacado = :destacado', { destacado: filtros.destacado });
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

  

  async obtenerTalles(): Promise<Talle[]> {
    return this.talleRepo.find();
  }

  

  async modificarProducto(id: number, dto: Partial<CreateProductoDto>): Promise<Producto> {
  const producto = await this.productoRepo.findOneBy({ id });
  if (!producto) throw new Error(`Producto con id ${id} no encontrado`);

  // Actualizar campos si vienen en el DTO
  if (dto.nombre) producto.nombre = dto.nombre;
  if (dto.descripcion) producto.descripcion = dto.descripcion;
  if (dto.precio !== undefined) producto.precio = dto.precio;
  if (dto.precioOferta !== undefined) producto.precioOferta = dto.precioOferta;
  if (dto.enOferta !== undefined) producto.enOferta = dto.enOferta;
  if (dto.destacado !== undefined) producto.destacado = dto.destacado;

  if (dto.categoriaId) {
    const categoria = await this.categoriaRepo.findOneBy({ id: dto.categoriaId });
    if (!categoria) throw new Error(`Categoría con id ${dto.categoriaId} no encontrada`);
    producto.categoria = categoria;
  }

  // Guardar modificaciones básicas
  await this.productoRepo.save(producto);

  // Actualizar combinaciones si vienen en el DTO
  if (dto.combinaciones && dto.combinaciones.length > 0) {
    for (const c of dto.combinaciones) {
      const existente = await this.productoColorTalleRepo.findOne({
        where: {
          producto: { id },
          color: { id: c.colorId },
          talle: { id: c.talleId },
        },
        relations: ['producto', 'color', 'talle'],
      });

      if (existente) {
        // Solo actualizar stock
        existente.stock = c.stock;
        await this.productoColorTalleRepo.save(existente);
      } else {
        // Crear nueva combinación si no existía
        const color = await this.colorRepo.findOneBy({ id: c.colorId });
        const talle = await this.talleRepo.findOneBy({ id: c.talleId });
        if (!color || !talle) throw new Error('Color o Talle inválido');

        const nueva = this.productoColorTalleRepo.create({
          producto,
          color,
          talle,
          stock: c.stock,
        });

        await this.productoColorTalleRepo.save(nueva);
      }
    }
  }

  return this.obtenerPorId(id);
}


async eliminarProducto(id: number): Promise<void> {
  const producto = await this.productoRepo.findOneBy({ id });
  if (!producto) throw new NotFoundException(`Producto con ID ${id} no encontrado`);
  await this.productoRepo.delete(id);
}


//Categoria
async crearCategoria(dto: CreateCategoriaDto): Promise<Categoria> {
    const nueva = this.categoriaRepo.create(dto);
    return this.categoriaRepo.save(nueva);
  }

  async borrarCategoriaLogicamente(id: number): Promise<void> {
    const categoria = await this.categoriaRepo.findOne({ where: { id } });
    if (!categoria) throw new NotFoundException('Categoría no encontrada');
    categoria.activo = false;
    await this.categoriaRepo.save(categoria);
  }

  async obtenerCategoriasActivas(): Promise<Categoria[]> {
  return this.categoriaRepo.find({
    where: { activo: true },
    order: { nombre: 'ASC' }
  });
}

  async obtenerCategorias(): Promise<Categoria[]> {
    return this.categoriaRepo.find();
  }

  //Colores

  async crearColor(dto: CreateColorDto): Promise<Color> {
    const nuevo = this.colorRepo.create(dto);
    return this.colorRepo.save(nuevo);
  }

  async borrarColorLogicamente(id: number): Promise<void> {
    const color = await this.colorRepo.findOne({ where: { id } });
    if (!color) throw new NotFoundException('Color no encontrado');
    color.activo = false;
    await this.colorRepo.save(color);
  }

  async obtenerColoresActivos(): Promise<Color[]> {
    return this.colorRepo.find({
      where: { activo: true },
      order: { nombre: 'ASC' }
    });
  }

  async obtenerColores(): Promise<Color[]> {
    return this.colorRepo.find({ order: { nombre: 'ASC' } });
  }



}
