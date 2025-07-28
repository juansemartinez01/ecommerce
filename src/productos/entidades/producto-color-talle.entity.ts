import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Producto } from './producto.entity';
import { Talle } from './talle.entity';
import { Color } from './color.entity';

@Entity()
export class ProductoColorTalle {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Producto, producto => producto.combinaciones, { onDelete: 'CASCADE' })
  producto: Producto;

  @ManyToOne(() => Talle, { eager: true })
  talle: Talle;

  @ManyToOne(() => Color, { eager: true })
  color: Color;

  @Column('int')
  stock: number;

  @Column({ default: true })
  activo: boolean;
}
