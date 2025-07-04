import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Categoria } from './categoria.entity';
import { ProductoColorTalle } from './producto-color-talle.entity';
import { ImagenProducto } from './imagen-producto.entity';

@Entity()
export class Producto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column('decimal')
  precio: number;

  @Column({ default: false })
  enOferta: boolean;

  @Column('decimal', { nullable: true })
  precioOferta: number;

  @ManyToOne(() => Categoria, categoria => categoria.productos)
  categoria: Categoria;

  @OneToMany(() => ProductoColorTalle, pct => pct.producto, { cascade: true })
  combinaciones: ProductoColorTalle[];

  @OneToMany(() => ImagenProducto, img => img.producto, { cascade: true })
  imagenes: ImagenProducto[];
}
