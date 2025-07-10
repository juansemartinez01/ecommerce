import { IsString } from 'class-validator';

export class UpdateEstadoPedidoDto {
  @IsString()
  estado: string;
}
