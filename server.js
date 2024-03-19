// Importing required modules
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Creating an Express application
const app = express();
app.use(cors());
app.use(express.json());


// Define a route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.post('/api/v1/create-checkout-session', async (req, res) => {

  const { products } = req.body;

  const lineItems = products.cartItems.map(item => {
    return {
      price_data: {
        currency: process.env.CURENCY,
        product_data: {
          name: item.title,
          images: [item.image],
        },
        unit_amount: (item.price * Number(process.env.USD_DOLLAR_RATE)) * 100, // Amount in cents, assuming price is in dollars
      },
      quantity: item.cartQuantity,
    };
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: [process.env.PAYMENT_METHOD_TYPE],
    line_items: lineItems,
    mode: process.env.MODE,
    shipping_address_collection: {
      allowed_countries: [process.env.ALLOWED_CURENCY] // Allow shipping address collection for India
    },
    success_url: process.env.SUCCESS_URL,
    cancel_url: process.env.FAILURE_URL
  });

  res.json({ id: session.id })

})

// Starting the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


