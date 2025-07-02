import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Descuento } from './entidades/descuento.entity';
import { Repository } from 'typeorm';
import { ValidarCuponDto } from './dto/validar-cupon.dto';

@Injectable()
export class DescuentosService {
  constructor(
    @InjectRepository(Descuento)
    private readonly descuentoRepo: Repository<Descuento>,
  ) {}

  async validarCupon(dto: ValidarCuponDto) {
    const descuento = await this.descuentoRepo.findOneBy({ codigo: dto.codigo });

    if (!descuento || !descuento.activo) {
      throw new Error('Cupón inválido o inactivo');
    }

    const ahora = new Date();
    if (descuento.fechaExpiracion < ahora) {
      throw new Error('Cupón expirado');
    }

    if (dto.totalCarrito < +descuento.usoMinimo) {
      throw new Error(`Monto mínimo requerido: $${descuento.usoMinimo}`);
    }

    const descuentoCalculado =
      descuento.montoFijo ?? ((dto.totalCarrito * descuento.porcentaje) / 100);

    const totalConDescuento = dto.totalCarrito - descuentoCalculado;

    return {
      codigo: dto.codigo,
      descuentoAplicado: +descuentoCalculado.toFixed(2),
      totalFinal: +totalConDescuento.toFixed(2),
    };
  }
}
