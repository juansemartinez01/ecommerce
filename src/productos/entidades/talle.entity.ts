import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { ProductoColorTalle } from './producto-color-talle.entity';

@Entity()
export class Talle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre: string; // XS, S, M, L, etc.

  @OneToMany(() => ProductoColorTalle, pct => pct.talle)
  combinaciones: ProductoColorTalle[];
}
