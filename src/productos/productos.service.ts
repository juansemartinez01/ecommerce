import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entidades/producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { Categoria } from './entidades/categoria.entity';
import { ProductoTalle } from './entidades/producto-talle.entity';
import { Talle } from './entidades/talle.entity';
import { FiltroProductoDto } from './dto/filtro-producto.dto';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private productoRepo: Repository<Producto>,
    @InjectRepository(Categoria)
    private categoriaRepo: Repository<Categoria>,
    @InjectRepository(Talle)
    private talleRepo: Repository<Talle>,
    @InjectRepository(ProductoTalle)
    private productoTalleRepo: Repository<ProductoTalle>,
  ) {}

  async crearProducto(dto: CreateProductoDto): Promise<Producto> {
  const categoria = await this.categoriaRepo.findOneBy({ id: dto.categoriaId });
  if (!categoria) {
    throw new Error(`Categoría con id ${dto.categoriaId} no encontrada`);
  }

  const producto = this.productoRepo.create({
    nombre: dto.nombre,
    descripcion: dto.descripcion,
    precio: dto.precio,
    enOferta: dto.enOferta,
    categoria,
    talles: [],
  });

  const productoGuardado = await this.productoRepo.save(producto);

  for (const t of dto.talles) {
    const talle = await this.talleRepo.findOneBy({ id: t.talleId });
    if (!talle) {
      throw new Error(`Talle con id ${t.talleId} no encontrado`);
    }

    const pt = new ProductoTalle();
    pt.producto = productoGuardado;
    pt.talle = talle;
    pt.stock = t.stock;

    await this.productoTalleRepo.save(pt);
  }

  const productoCompleto = await this.productoRepo.findOne({
    where: { id: productoGuardado.id },
    relations: ['categoria', 'talles', 'talles.talle'],
  });

  if (!productoCompleto) {
    throw new Error(`Producto con id ${productoGuardado.id} no encontrado`);
  }

  return productoCompleto;
}


  async listar(filtros: FiltroProductoDto): Promise<Producto[]> {
    const query = this.productoRepo.createQueryBuilder('producto')
      .leftJoinAndSelect('producto.categoria', 'categoria')
      .leftJoinAndSelect('producto.talles', 'talles')
      .leftJoinAndSelect('talles.talle', 'talle');

    if (filtros.categoriaId) {
      query.andWhere('categoria.id = :categoriaId', { categoriaId: filtros.categoriaId });
    }

    if (filtros.enOferta !== undefined) {
      query.andWhere('producto.enOferta = :enOferta', { enOferta: filtros.enOferta });
    }

    if (filtros.talleId) {
      query.andWhere('talles.talle = :talleId', { talleId: filtros.talleId });
    }

    return query.getMany();
  }

  async obtenerPorId(id: number): Promise<Producto> {
    const producto = await this.productoRepo.findOne({
        where: { id },
        relations: ['categoria', 'talles', 'talles.talle'],
    });
    if (!producto) {
        throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return producto;
  }

  async obtenerCategorias(): Promise<Categoria[]> {
  return this.categoriaRepo.find();
    }

    async obtenerTalles(): Promise<Talle[]> {
    return this.talleRepo.find();
    }

}
