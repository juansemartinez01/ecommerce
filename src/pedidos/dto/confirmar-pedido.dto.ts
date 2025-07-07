import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ItemPedidoDto {
  @IsNumber()
  productoId: number;

  @IsNumber()
  colorId: number;

  @IsNumber()
  talleId: number;

  @IsNumber()
  cantidad: number;

  @IsNumber()
  precioUnitario: number;
}

export class ConfirmarPedidoDto {
  @IsNumber()
  usuarioId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemPedidoDto)
  items: ItemPedidoDto[];

  // 👤 Datos opcionales del cliente
  @IsOptional() @IsString()
  nombreCliente?: string;

  @IsOptional() @IsString()
  apellidoCliente?: string;

  @IsOptional() @IsString()
  emailCliente?: string;

  @IsOptional() @IsString()
  telefonoCliente?: string;

  // 🏠 Datos opcionales de envío
  @IsOptional() @IsString()
  nombreEnvio?: string;

  @IsOptional() @IsString()
  direccionEnvio?: string;

  @IsOptional() @IsString()
  codigoPostalEnvio?: string;

  @IsOptional() @IsString()
  ciudadEnvio?: string;

  @IsOptional() @IsString()
  provinciaEnvio?: string;

  @IsOptional() @IsString()
  aclaracionesEnvio?: string;
}
