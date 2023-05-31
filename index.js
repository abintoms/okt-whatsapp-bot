const express = require("express");
const body_parser = require("body-parser");
const axios = require("axios");
require("dotenv").config();
const createOrder = require("./libs/order");

const app = express().use(body_parser.json());

const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

app.listen(process.env.PORT, () => {
  console.log("whatsapp chatbot is listening");
});

//to verify the callback url from dashboard side - cloud api side
app.get("/webhook", (req, res) => {
  let mode = req.query["hub.mode"];
  let challange = req.query["hub.challenge"];
  let token = req.query["hub.verify_token"];

  if (mode && token) {
    if (mode === "subscribe" && token === WHATSAPP_TOKEN) {
      res.status(200).send(challange);
    } else {
      res.status(403);
    }
  }
});

// Webhook for whatsapp
app.post("/webhook", async (req, res) => {
  let body_param = req.body;

  if (body_param.object) {
    if (
      body_param.entry &&
      body_param.entry[0].changes &&
      body_param.entry[0].changes[0].value.messages &&
      body_param.entry[0].changes[0].value.messages[0]
    ) {
      let phon_no_id =
        body_param.entry[0].changes[0].value.metadata.phone_number_id;
      let from = body_param.entry[0].changes[0].value.messages[0].from;
      let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;

      if (msg_body.toLowerCase().includes("hi")) {
        axios({
          method: "POST",
          url:
            "https://graph.facebook.com/v13.0/" +
            phon_no_id +
            "/messages?access_token=" +
            WHATSAPP_ACCESS_TOKEN,
          data: {
            messaging_product: "whatsapp",
            to: from,
            text: {
              body: "Welcome to zoksh. To create an order please share an amount.",
            },
          },
          headers: {
            "Content-Type": "application/json",
          },
        });
      } else if (msg_body.toLowerCase().includes("order")) {
        const order = await createOrder("1");
        axios({
          method: "POST",
          url:
            "https://graph.facebook.com/v13.0/" +
            phon_no_id +
            "/messages?access_token=" +
            WHATSAPP_ACCESS_TOKEN,
          data: {
            messaging_product: "whatsapp",
            to: from,
            text: {
              body: "Your order link is " + order.url,
            },
          },
          headers: {
            "Content-Type": "application/json",
          },
        });
      } else {
        axios({
          method: "POST",
          url:
            "https://graph.facebook.com/v13.0/" +
            phon_no_id +
            "/messages?access_token=" +
            WHATSAPP_ACCESS_TOKEN,
          data: {
            messaging_product: "whatsapp",
            to: from,
            text: {
              body: "Please enter order amount in numbers for creating the payment link",
            },
          },
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  }
});

app.post("/zoksh/webhook", async (req, res) => {
  const payeeUser = req.body.payer;
  const orderInfo = req.body.order;

  axios({
    method: "POST",
    url:
      "https://graph.facebook.com/v13.0/101155999636102/messages?access_token=" +
      token,
    data: {
      messaging_product: "whatsapp",
      to: 918920781812,
      text: {
        body: `You have successfully received payment from ${payeeUser.name} ${payeeUser.email} for order of $ ${orderInfo.amount}.`,
      },
    },
    headers: {
      "Content-Type": "application/json",
    },
  });
});

app.get("/", (req, res) => {
  res.status(200).send("whatsapp chatbot connected");
});
