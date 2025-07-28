import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
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
import { CreateTalleDto } from './dto/create-talle.dto';

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
    private dataSource: DataSource
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

  

  

  



async modificarProducto(id: number, dto: UpdateProductoDto): Promise<Producto> {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 🔹 1. Buscar producto existente
    const producto = await queryRunner.manager.findOne(Producto, {
      where: { id },
      relations: ['combinaciones', 'imagenes', 'combinaciones.color', 'combinaciones.talle'],
    });

    if (!producto) throw new NotFoundException(`Producto con id ${id} no encontrado`);

    // 🔹 2. Actualizar campos básicos
    if (dto.nombre !== undefined) producto.nombre = dto.nombre;
    if (dto.descripcion !== undefined) producto.descripcion = dto.descripcion;
    if (dto.precio !== undefined) producto.precio = dto.precio;
    if (dto.precioOferta !== undefined) producto.precioOferta = dto.precioOferta;
    if (dto.enOferta !== undefined) producto.enOferta = dto.enOferta;
    if (dto.destacado !== undefined) producto.destacado = dto.destacado;

    // 🔹 3. Actualizar categoría si viene en el DTO
    if (dto.categoriaId !== undefined) {
      const categoria = await queryRunner.manager.findOne(Categoria, { where: { id: dto.categoriaId } });
      if (!categoria) throw new NotFoundException(`Categoría con id ${dto.categoriaId} no encontrada`);
      producto.categoria = categoria;
    }

    await queryRunner.manager.save(producto);

    // 🔹 4. Actualizar combinaciones (alta, modificación y eliminación de las no enviadas)
    if (dto.combinaciones) {
      // Mapeo de combinaciones existentes
      const existentesMap = new Map(producto.combinaciones.map(c => [ `${c.color.id}-${c.talle.id}`, c ]));

      // IDs de combinaciones que deben quedar
      const idsActualizados: string[] = [];

      for (const c of dto.combinaciones) {
        const key = `${c.colorId}-${c.talleId}`;
        idsActualizados.push(key);

        if (existentesMap.has(key)) {
          // ✅ Si existe, solo actualizo stock
          const existente = existentesMap.get(key) as ProductoColorTalle;
          existente.stock = c.stock;
          await queryRunner.manager.save(existente);
        } else {
          // ✅ Si no existe, creo la nueva combinación
          const color = await queryRunner.manager.findOne(Color, { where: { id: c.colorId } });
          const talle = await queryRunner.manager.findOne(Talle, { where: { id: c.talleId } });
          if (!color || !talle) throw new NotFoundException('Color o Talle inválido');

          const nueva = queryRunner.manager.create(ProductoColorTalle, {
            producto,
            color,
            talle,
            stock: c.stock,
          });
          await queryRunner.manager.save(nueva);
        }
      }

      // ❌ Eliminar combinaciones que no vinieron en el DTO
      const aEliminar = producto.combinaciones.filter(c => !idsActualizados.includes(`${c.color.id}-${c.talle.id}`));
      if (aEliminar.length > 0) {
        await queryRunner.manager.remove(ProductoColorTalle, aEliminar);
      }
    }

    // 🔹 5. Actualizar imágenes si vienen nuevas
    if (dto.imagenes) {
      // ❌ Eliminar imágenes existentes
      await queryRunner.manager.delete(ImagenProducto, { producto: { id } });

      // ✅ Insertar nuevas imágenes
      for (const url of dto.imagenes) {
        const nuevaImg = queryRunner.manager.create(ImagenProducto, { url, producto });
        await queryRunner.manager.save(nuevaImg);
      }
    }

    // 🔹 6. Confirmar transacción
    await queryRunner.commitTransaction();

    // 🔹 7. Retornar producto actualizado con todas sus relaciones
    return this.obtenerPorId(id);
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
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



  //Talles

  async crearTalle(dto: CreateTalleDto): Promise<Talle> {
    const nuevo = this.talleRepo.create(dto);
    return this.talleRepo.save(nuevo);
  }

  async borrarTalleLogicamente(id: number): Promise<void> {
    const talle = await this.talleRepo.findOne({ where: { id } });
    if (!talle) throw new NotFoundException('Talle no encontrado');
    talle.activo = false;
    await this.talleRepo.save(talle);
  }

  async obtenerTallesActivos(): Promise<Talle[]> {
    return this.talleRepo.find({
      where: { activo: true },
      order: { nombre: 'ASC' }
    });
  }

  async obtenerTalles(): Promise<Talle[]> {
    return this.talleRepo.find({ order: { nombre: 'ASC' } });
  }


}
