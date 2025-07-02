import { Controller, Post, Body } from '@nestjs/common';
import { DescuentosService } from './descuentos.service';
import { ValidarCuponDto } from './dto/validar-cupon.dto';

@Controller('descuentos')
export class DescuentosController {
  constructor(private readonly service: DescuentosService) {}

  @Post('validar')
  validar(@Body() dto: ValidarCuponDto) {
    return this.service.validarCupon(dto);
  }
}
