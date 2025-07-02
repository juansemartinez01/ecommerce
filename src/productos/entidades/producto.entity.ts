import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Categoria } from './categoria.entity';
import { ProductoTalle } from './producto-talle.entity';

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

  @ManyToOne(() => Categoria, categoria => categoria.productos)
  categoria: Categoria;

  @OneToMany(() => ProductoTalle, pt => pt.producto, { cascade: true })
  talles: ProductoTalle[];
}
