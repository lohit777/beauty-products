const express = require("express");
const Razorpay = require("razorpay");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

const razorpay = new Razorpay({
  key_id: "rzp_live_SVJmHc21qZLR1y",
  key_secret: "2EoJS3zdiaanq19aNsBFMncX"
});

// Create Order
app.post("/create-order", async (req, res) => {
  const { amount } = req.body;

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR"
    });

    res.json(order);
  } catch (err) {
    res.status(500).send("Error creating order");
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));