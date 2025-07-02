import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Descuento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  codigo: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  montoFijo: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  porcentaje: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  usoMinimo: number;

  @Column('timestamp')
  fechaExpiracion: Date;

  @Column({ default: true })
  activo: boolean;
}
