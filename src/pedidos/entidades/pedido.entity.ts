import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Usuario } from 'src/usuarios/entidades/usuario.entity';
import { PedidoItem } from './pedido-item.entity';

@Entity()
export class Pedido {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, usuario => usuario.pedidos)
  usuario: Usuario;

  @OneToMany(() => PedidoItem, item => item.pedido, { cascade: true })
  items: PedidoItem[];

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column({ default: 'Pendiente' })
  estado: string;

  @CreateDateColumn()
  fechaHora: Date;

  // 📦 Datos opcionales de envío (como ya hablamos)
@Column({ nullable: true })
nombreEnvio: string;

@Column({ nullable: true })
direccionEnvio: string;

@Column({ nullable: true })
codigoPostalEnvio: string;

@Column({ nullable: true })
ciudadEnvio: string;

@Column({ nullable: true })
provinciaEnvio: string;

@Column({ type: 'text', nullable: true })
aclaracionesEnvio: string;

// 👤 Datos del cliente en el momento del pedido (opcional)
@Column({ nullable: true })
nombreCliente: string;

@Column({ nullable: true })
apellidoCliente: string;

@Column({ nullable: true })
emailCliente: string;

@Column({ nullable: true })
telefonoCliente: string;

}
