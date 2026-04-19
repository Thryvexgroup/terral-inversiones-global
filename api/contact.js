import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    nombre,
    apellidos,
    email,
    telefono,
    whatsapp,
    'tipo-cliente': tipoCliente,
    'contacto-preferido': contactoPreferido,
    mensaje,
  } = req.body;

  if (!nombre || !apellidos || !email || !telefono || !tipoCliente || !mensaje) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const contactMethodLabels = {
    whatsapp:  'WhatsApp',
    llamada:   'Llamada telefónica',
    email:     'Email',
    videochat: 'Videochat',
  };

  const clientTypeLabels = {
    'persona-fisica': 'Persona Física',
    empresa:          'Empresa',
  };

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva consulta — Terral Inversiones Globales</title>
</head>
<body style="margin:0;padding:0;background:#cadff0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#cadff0;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#e6f4ff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(66,88,114,0.15);">

          <!-- Header -->
          <tr>
            <td style="background:#425872;padding:32px 40px;text-align:center;">
              <img
                src="https://cdn.prod.website-files.com/69c016157bffa9d566c4a040/69c585901898bcb4f86bb347_LOGO_TERRAL-removebg-preview.png"
                alt="Terral Inversiones Globales"
                width="180"
                style="display:block;margin:0 auto 16px;filter:brightness(0) invert(1);"
              >
              <p style="margin:0;color:#adc4e4;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;font-weight:600;">
                Nueva consulta recibida
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 28px;font-size:15px;color:#326097;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;">
                Datos del cliente
              </p>

              <!-- Fields -->
              <table width="100%" cellpadding="0" cellspacing="0">

                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #adc4e4;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#9bb4d3;">Nombre completo</p>
                    <p style="margin:0;font-size:15px;color:#425872;font-weight:600;">${nombre} ${apellidos}</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #adc4e4;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#9bb4d3;">Correo electrónico</p>
                    <p style="margin:0;font-size:15px;color:#425872;">
                      <a href="mailto:${email}" style="color:#326097;text-decoration:none;">${email}</a>
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #adc4e4;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#9bb4d3;">Teléfono</p>
                    <p style="margin:0;font-size:15px;color:#425872;">${telefono}</p>
                  </td>
                </tr>

                ${whatsapp ? `
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #adc4e4;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#9bb4d3;">WhatsApp</p>
                    <p style="margin:0;font-size:15px;color:#425872;">${whatsapp}</p>
                  </td>
                </tr>` : ''}

                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #adc4e4;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#9bb4d3;">Tipo de cliente</p>
                    <p style="margin:0;font-size:15px;color:#425872;">${clientTypeLabels[tipoCliente] || tipoCliente}</p>
                  </td>
                </tr>

                ${contactoPreferido ? `
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #adc4e4;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#9bb4d3;">Método de contacto preferido</p>
                    <p style="margin:0;font-size:15px;color:#425872;">${contactMethodLabels[contactoPreferido] || contactoPreferido}</p>
                  </td>
                </tr>` : ''}

                <tr>
                  <td style="padding:12px 0;">
                    <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#9bb4d3;">Comentario</p>
                    <p style="margin:0;font-size:15px;color:#425872;line-height:1.7;white-space:pre-wrap;">${mensaje}</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#dfeefa;padding:24px 40px;text-align:center;border-top:1px solid #adc4e4;">
              <p style="margin:0;font-size:12px;color:#9bb4d3;">
                © ${new Date().getFullYear()} Terral Inversiones Globales — Ciudad de Panamá, Panamá
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await resend.emails.send({
      from:    'Terral Inversiones Globales <noreply@thryvexgroup.com>',
      to:      'info@terral.global',
      replyTo: email,
      subject: `Nueva consulta de ${nombre} ${apellidos}`,
      html,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Resend error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
