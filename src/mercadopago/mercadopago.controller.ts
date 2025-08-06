import { Controller, Post, Body, Req, Res, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import { Public } from 'src/auth/isPublic';

@Controller('mercadopago')
export class MercadoPagoController {
  private mercadopago = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!, // Token seguro de MercadoPago
  });

  // ✅ 1. ENDPOINT PARA RECIBIR EL WEBHOOK DE MERCADOPAGO
  @Public()
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

        console.log('📦 Metadata recibido desde MercadoPago:', metadata);

        // ✅ Validar que exista cart_items
        if (!metadata?.cart_items) {
          console.warn('⚠️ Metadata incompleta, ignorando webhook.');
          return res.status(HttpStatus.OK).json({ received: true });
        }

        // ✅ Construir el payload del pedido
        const pedidoPayload = {
          usuarioId: 1,
          items: metadata.cart_items.map((item: any) => ({
            productoId: item.id,
            cantidad: item.cantidad,
            precioUnitario: item.precio_oferta ?? item.precio_original,
            talleId: item.talla.id,
            colorId: item.color?.id || 0,
          })),
          metodoPago: 'Online',
          nombreCliente: metadata.nombre_cliente,
          apellidoCliente: metadata.apellido_cliente,
          emailCliente: metadata.email_cliente,
          telefonoCliente: metadata.telefono_cliente,
          nombreEnvio: metadata.realizar_envio ? metadata.nombre_envio : '',
          direccionEnvio: metadata.realizar_envio ? metadata.direccion_envio : '',
          codigoPostalEnvio: metadata.realizar_envio ? metadata.codigo_postal_envio : '',
          ciudadEnvio: metadata.realizar_envio ? metadata.ciudad_envio : '',
          provinciaEnvio: metadata.realizar_envio ? metadata.provincia_envio : '',
          aclaracionesEnvio: metadata.realizar_envio ? metadata.aclaraciones_envio : '',
        };

        // ✅ Enviar pedido a tu servicio interno
        console.log('✅ Hola - enviando pedido a backend interno', pedidoPayload);

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

  // ✅ 2. ENDPOINT PARA CREAR LA PREFERENCIA DE PAGO DIRECTAMENTE DESDE EL BACKEND
  @Public()
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

      // ✅ Usar BACKEND_API_URL (Railway) para construir el notification_url
      const backendUrl = process.env.BACKEND_API_URL ?? 'https://mi-backend.up.railway.app';
      const frontendUrl = process.env.FRONTEND_URL ?? 'https://mi-frontend.vercel.app';

      const preferenceData = {
        items: [
          {
            id: '1',
            title: 'Compra en Mutuo',
            quantity: 1,
            unit_price: Number(total),
          },
        ],
        metadata: {
          cart_items: cartItems,
          nombre_cliente: nombreCliente,
          apellido_cliente: apellidoCliente,
          telefono_cliente: telefonoCliente,
          email_cliente: emailCliente,
          realizar_envio: realizarEnvio,
          nombre_envio: nombreEnvio,
          direccion_envio: direccionEnvio,
          codigo_postal_envio: codigoPostalEnvio,
          ciudad_envio: ciudadEnvio,
          provincia_envio: provinciaEnvio,
          aclaraciones_envio: aclaracionesEnvio,
        },
        back_urls: {
          success: `${frontendUrl}/exitoso`,
          failure: `${frontendUrl}/fallido`,
          pending: `${frontendUrl}/pendiente`,
        },
        auto_return: 'approved',
        notification_url: `${backendUrl}/mercadopago/webhook`,
      };

      console.log('✅ Creando preferencia en MercadoPago con:', preferenceData);

      const preference = await new Preference(this.mercadopago).create({ body: preferenceData });

      return res.status(HttpStatus.OK).json({ init_point: preference.init_point });
    } catch (error) {
      console.error('❌ Error creando preferencia MercadoPago:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Error interno' });
    }
  }
}
