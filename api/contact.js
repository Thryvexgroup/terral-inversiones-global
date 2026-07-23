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

  if (!nombre || !apellidos || !email) {
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

  // one field row — hairline divider, muted label, ink value
  const row = (label, value, opts = {}) => `
                <tr>
                  <td style="padding:15px 0;${opts.last ? '' : 'border-bottom:1px solid #E6E5E0;'}">
                    <p style="margin:0 0 5px;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#8C877D;">${label}</p>
                    <p style="margin:0;font-size:16px;line-height:1.5;color:#141310;${opts.bold ? 'font-weight:600;' : ''}white-space:pre-wrap;">${value}</p>
                  </td>
                </tr>`;

  const nombreCompleto = `${nombre}${apellidos ? ' ' + apellidos : ''}`;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva consulta — Terral Inversiones Globales</title>
</head>
<body style="margin:0;padding:0;background:#E6E5E0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#E6E5E0;padding:44px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FCFCFA;border-radius:14px;overflow:hidden;box-shadow:0 12px 44px rgba(20,19,16,0.10);">

          <!-- Header -->
          <tr>
            <td style="background:#141310;padding:40px 46px 34px;">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:700;letter-spacing:-0.01em;color:#F3F2EF;line-height:1;">TERRAL<span style="color:#78705F;">.</span></p>
              <p style="margin:16px 0 0;color:#8C877D;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">Nueva consulta recibida</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:42px 46px;">
              <p style="margin:0 0 26px;font-size:11px;color:#78705F;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">Datos del cliente</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${row('Nombre completo', nombreCompleto, { bold: true })}
                ${row('Correo electrónico', `<a href="mailto:${email}" style="color:#5E5749;text-decoration:none;">${email}</a>`)}
                ${row('Teléfono', telefono || '—')}
                ${whatsapp ? row('WhatsApp', whatsapp) : ''}
                ${row('Tipo de cliente', clientTypeLabels[tipoCliente] || tipoCliente || '—')}
                ${contactoPreferido ? row('Método de contacto preferido', contactMethodLabels[contactoPreferido] || contactoPreferido) : ''}
                ${row('Comentario', mensaje || '—', { last: true })}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F3F2EF;padding:24px 46px;text-align:center;border-top:1px solid #E6E5E0;">
              <p style="margin:0;font-size:11px;color:#8C877D;letter-spacing:0.02em;">© ${new Date().getFullYear()} Terral Inversiones Globales · Ciudad de Panamá, Panamá</p>
            </td>
          </tr>

        </table>
        <p style="margin:18px 0 0;font-size:11px;color:#8C877D;letter-spacing:0.04em;">Responda personalmente en menos de 24&nbsp;horas.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const { data, error } = await resend.emails.send({
    from:    'Terral Inversiones Globales <noreply@thryvexgroup.com>',
    to:      'info@terral.global',
    replyTo: email,
    subject: `Nueva consulta de ${nombreCompleto}`,
    html,
  });

  if (error) {
    console.error('Resend error:', JSON.stringify(error, null, 2));
    return res.status(500).json({ error: 'Failed to send email', detail: error.message });
  }

  return res.status(200).json({ success: true, id: data?.id });
}
