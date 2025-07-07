import { Controller, Post, Get, Body } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { ConfirmarPedidoDto } from './dto/confirmar-pedido.dto';

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly service: PedidosService) {}

  @Post()
  confirmar(@Body('usuarioId') usuarioId: number, @Body() dto: ConfirmarPedidoDto) {
    return this.service.confirmarPedidoPorId(usuarioId, dto);
  }

  @Get()
  listar() {
    // Para testeo, podés devolver todos los pedidos (no filtrado por usuario)
    return this.service.obtenerTodos();
  }
}
