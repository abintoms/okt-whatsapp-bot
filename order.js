const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config();

const baseUrl = "https://payments.sandbox.zoksh.com";
const endpoint = "/v2/order";
const ACCOUNT_ID = process.env.ACCOUNT_ID;
const ZOKSH_SECRET_KEY = process.env.ZOKSH_SECRET_KEY;

const createOrder = async (amount) => {
  const requestBody = {
    amount: amount,
    fiat: "USD",
    label: "",
    merchant: {
      desc: "",
      extra: "Any meta information you would like to attach with order",
      orderId: "your_order_id_here",
    },
  };

  const ts = new Date().getTime();
  const requestPath = endpoint;
  const toSign = `${ts}${requestPath}${JSON.stringify(requestBody)}`;
  const hmac = crypto.createHmac("sha256", ZOKSH_SECRET_KEY);
  const signature = hmac.update(toSign).digest("hex");

  const config = {
    headers: {
      "ZOKSH-KEY": ACCOUNT_ID,
      "ZOKSH-TS": ts,
      "ZOKSH-SIGN": signature,
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await axios.post(baseUrl + endpoint, requestBody, config);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

module.exports = createOrder;
