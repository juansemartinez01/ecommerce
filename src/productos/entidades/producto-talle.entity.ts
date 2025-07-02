import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Producto } from './producto.entity';
import { Talle } from './talle.entity';

@Entity()
export class ProductoTalle {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Producto, producto => producto.talles, { onDelete: 'CASCADE' })
  producto: Producto;

  @ManyToOne(() => Talle, talle => talle.productos, { eager: true })
  talle: Talle;

  @Column('int')
  stock: number;
}
