import { Controller, Post, Body, Req, Res, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import fetch from 'node-fetch';

@Controller('mercadopago')
export class MercadoPagoController {
  private mercadopago = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!, // Token seguro de MercadoPago
  });

  // ✅ 1. ENDPOINT PARA RECIBIR EL WEBHOOK
  @Post('webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    try {
      const body = req.body;

      if (body.type !== 'payment') {
        return res.status(HttpStatus.OK).json({ received: true });
      }

      const paymentId = body.data.id;
      const payment = await new Payment(this.mercadopago).get({ id: paymentId });

      if (payment.status === 'approved') {
        const metadata: any = payment.metadata;

        if (!metadata?.cartItems) {
          console.warn('⚠️ Metadata incompleta, ignorando webhook.');
          return res.status(HttpStatus.OK).json({ received: true });
        }

        // ✅ Construir el payload del pedido
        const pedidoPayload = {
          usuarioId: 1,
          items: metadata.cartItems.map((item: any) => ({
            productoId: item.id,
            cantidad: item.cantidad,
            precioUnitario: item.precio_oferta ?? item.precio_original,
            talleId: item.talla.id,
            colorId: item.color?.id || 0,
          })),
          metodoPago: 'MercadoPago',
          nombreCliente: metadata.nombreCliente,
          apellidoCliente: metadata.apellidoCliente,
          emailCliente: metadata.emailCliente,
          telefonoCliente: metadata.telefonoCliente,
          nombreEnvio: metadata.realizarEnvio ? metadata.nombreEnvio : '',
          direccionEnvio: metadata.realizarEnvio ? metadata.direccionEnvio : '',
          codigoPostalEnvio: metadata.realizarEnvio ? metadata.codigoPostalEnvio : '',
          ciudadEnvio: metadata.realizarEnvio ? metadata.ciudadEnvio : '',
          provinciaEnvio: metadata.realizarEnvio ? metadata.provinciaEnvio : '',
          aclaracionesEnvio: metadata.realizarEnvio ? metadata.aclaracionesEnvio : '',
        };

        // ✅ Enviar el pedido al servicio interno de pedidos
        const backendResponse = await fetch(`${process.env.BACKEND_API_URL}/pedidos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pedidoPayload),
        });

        const data = await backendResponse.json();
        return res.status(backendResponse.status).json(data);
      }

      return res.status(HttpStatus.OK).json({ received: true });
    } catch (err) {
      console.error('❌ Error procesando webhook MercadoPago:', err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Error interno' });
    }
  }

  // ✅ 2. ENDPOINT PARA CREAR LA PREFERENCIA DIRECTAMENTE DESDE EL BACKEND
  @Post('preference')
  async createPreference(@Body() body: any, @Res() res: Response) {
    try {
      const {
        total,
        cartItems,
        nombreCliente,
        apellidoCliente,
        telefonoCliente,
        emailCliente,
        realizarEnvio,
        nombreEnvio,
        direccionEnvio,
        codigoPostalEnvio,
        ciudadEnvio,
        provinciaEnvio,
        aclaracionesEnvio,
      } = body;

      if (!total || total <= 0 || !cartItems?.length) {
        return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Datos inválidos' });
      }

      const preference = await new Preference(this.mercadopago).create({
        body: {
          items: [
            {
              id: '1',
              title: 'Compra en Mutuo',
              quantity: 1,
              unit_price: total,
            },
          ],
          metadata: {
            cartItems,
            nombreCliente,
            apellidoCliente,
            telefonoCliente,
            emailCliente,
            realizarEnvio,
            nombreEnvio,
            direccionEnvio,
            codigoPostalEnvio,
            ciudadEnvio,
            provinciaEnvio,
            aclaracionesEnvio,
          },
          back_urls: {
            success: `${process.env.FRONTEND_URL}/exitoso`,
            failure: `${process.env.FRONTEND_URL}/fallido`,
            pending: `${process.env.FRONTEND_URL}/pendiente`,
          },
          auto_return: 'approved',
          notification_url: `${process.env.BACKEND_URL}/mercadopago/webhook`,
        },
      });

      return res.status(HttpStatus.OK).json({ init_point: preference.init_point });
    } catch (error) {
      console.error('❌ Error creando preferencia MercadoPago:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Error interno' });
    }
  }
}
