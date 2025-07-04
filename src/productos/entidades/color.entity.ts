import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProductoColorTalle } from './producto-color-talle.entity';

@Entity()
export class Color {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre: string;

  @OneToMany(() => ProductoColorTalle, pct => pct.color)
  combinaciones: ProductoColorTalle[];
}
