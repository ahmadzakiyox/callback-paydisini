const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const axios = require('axios');
const { User, Deposit } = require('./models');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Koneksi ke MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Endpoint untuk menerima callback dari PayDisini
app.post('/callback', async (req, res) => {
  const { unique_code, status } = req.body;
  console.log('Received callback:', req.body);

  try {
    const deposit = await Deposit.findOne({ uniqueCode: unique_code });
    if (!deposit) {
      console.error('Deposit not found for unique_code:', unique_code);
      return res.status(404).send('Deposit not found');
    }

    if (status === 'Success') {
      deposit.status = 'BERHASIL ✅';
      const user = await User.findOne({ userId: deposit.userId });
      if (!user) {
        console.error('User not found for userId:', deposit.userId);
        return res.status(404).send('User not found');
      }
      user.saldo += deposit.amount;
      await user.save();

      // Kirim pesan ke bot menggunakan bot token
      const chatId = deposit.userId;
      const message = `╭──── 〔 *DEPOSIT BERHASIL* 〕
┊・ 🏷️| Jumlah Deposit: Rp ${deposit.amount}
┊・ 📦| Saldo Yang Sekarang: Rp ${user.saldo}
┊・ 🧾| Status: ${deposit.status}
┊
┊・ Pembelian barang berhasil, terima 
┊     kasih telah berbelanja. Yuk beli 
┊     akun di @IDevilsStoreBOT , Silakan Type /menu untuk membeli barang
┊
┊・ Owner : @IDevilsStoree
┊・ ©2024
╰┈┈┈┈┈┈┈┈`;

      const botToken = process.env.BOT_TOKEN;
      await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown', // Pastikan format Markdown diterima
      });
      console.log(`Deposit successful message sent to ${chatId}`);
    } else {
      deposit.status = 'failed';
    }
    await deposit.save();

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing callback:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Jalankan server express
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Callback server is running on port ${PORT}`);
});
         
