const cors = require("cors");
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();
app.use(cors({
  origin: "https://www.likepunk.com"
}));
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (_, res) => {
  res.send("LikePunk backend is running");
});

app.post("/create-payment", async (req, res) => {
  const { amount, currency, order_id } = req.body;

  try {
    const response = await axios.post(
      "https://api.nowpayments.io/v1/invoice",
      {
        price_amount: amount,
        price_currency: currency,
        order_id,
        ipn_callback_url: process.env.NOWPAYMENTS_WEBHOOK_URL,
        success_url: process.env.DOMAIN,
        cancel_url: process.env.DOMAIN
      },
      {
        headers: {
          "x-api-key": process.env.NOWPAYMENTS_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ invoice_url: response.data.invoice_url });
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});
app.post("/webhook", (req, res) => {
  console.log("Webhook received:", req.body);
  // Здесь позже подключим отправку заказа на JAP API
  res.status(200).send("OK");
});
// Получить список продуктов с Peakerr
app.get("/products", async (req, res) => {
  try {
    const response = await axios.post(
      "https://peakerr.com/api/v2",
      new URLSearchParams({
        key: process.env.PEAKERR_API_KEY,
        action: "services"
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Ошибка при получении продуктов:", error.response?.data || error.message || error);
    res.status(500).json({ error: "Ошибка при получении продуктов" });
  }
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
