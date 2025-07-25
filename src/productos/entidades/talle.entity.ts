import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { ProductoColorTalle } from './producto-color-talle.entity';

@Entity()
export class Talle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string; // XS, S, M, L, etc.

  @Column({ default: true })
  activo: boolean;

  @OneToMany(() => ProductoColorTalle, pct => pct.talle)
  combinaciones: ProductoColorTalle[];
}
