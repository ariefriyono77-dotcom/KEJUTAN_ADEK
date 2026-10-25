const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Server email aktif.' });
});

app.post('/send-email', async (req, res) => {
  const { to, subject, message } = req.body || {};

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return res.status(500).json({
      success: false,
      error: 'Konfigurasi Gmail belum lengkap. Isi GMAIL_USER dan GMAIL_APP_PASSWORD di file .env.'
    });
  }

  if (!to || !message) {
    return res.status(400).json({
      success: false,
      error: 'Body request harus berisi to dan message.'
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    const mailOptions = {
      from: `"Website Ulang Tahun" <${process.env.GMAIL_USER}>`,
      to,
      subject: subject || 'Harapan Ulang Tahun Baru',
      text: message,
      html: `<p>${message.replace(/\n/g, '<br>')}</p>`
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Email berhasil dikirim ke Gmail.'
    });
  } catch (error) {
    console.error('Gagal mengirim email:', error);
    res.status(500).json({
      success: false,
      error: 'Email gagal dikirim. Cek Gmail App Password dan konfigurasi SMTP.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server email aktif di http://localhost:${PORT}`);
});
