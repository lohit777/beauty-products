const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

// 🔐 Hardcoded PayPal credentials
const CLIENT_ID = "AZPZAnlXHeCbVbgasGJDaeQN8QdKPRzmCDr5aAEzgtZwWfk281dO5Y18OOQ7qCfxVB9VlLHqD6HQHU5k";
const CLIENT_SECRET = "EPH33J81nAv9kqITIOckq0FVURqwJv8oLk2cbQnwtom5IBTfK_ALiqdoF1VbHLp8h2dTyN28UEXRNQW3"; // 👈 paste your secret here

// 🔹 Get PayPal access token
async function getAccessToken() {
  const response = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Authorization":
        "Basic " +
        Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  return data.access_token;
}

// 🔹 Create PayPal order
app.post("/create-paypal-order", async (req, res) => {
  const { amount } = req.body;

  try {
    const accessToken = await getAccessToken();

    const response = await fetch(
      "https://api-m.sandbox.paypal.com/v2/checkout/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "GBP",
                value: amount.toFixed(2),
              },
            },
          ],
        }),
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating PayPal order");
  }
});

// 🔹 Capture PayPal order
app.post("/capture-paypal-order", async (req, res) => {
  const { orderID } = req.body;

  try {
    const accessToken = await getAccessToken();

    const response = await fetch(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error capturing PayPal order");
  }
});

app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});