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
import { MetodoPago } from '../enum/metodo-pago.enum';
import { EstadoPago } from '../enum/estado-pago.enum';
import { EstadoPedido } from '../enum/estado-pedido.enum';

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

@Column({
  type: 'enum',
  enum: MetodoPago,
  default: MetodoPago.CAJA,
})
metodoPago: MetodoPago;

@Column({
  type: 'enum',
  enum: EstadoPago,
  default: EstadoPago.PENDIENTE,
})
estadoPago: EstadoPago;

@Column({
  type: 'enum',
  enum: EstadoPedido,
  default: EstadoPedido.PENDIENTE,
})
estadoPedido: EstadoPedido;

}
