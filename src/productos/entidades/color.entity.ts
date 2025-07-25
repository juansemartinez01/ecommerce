import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProductoColorTalle } from './producto-color-talle.entity';

@Entity()
export class Color {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ default: true })
  activo: boolean;

  @OneToMany(() => ProductoColorTalle, pct => pct.color)
  combinaciones: ProductoColorTalle[];
}
