const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

const productRoutes = require('./routes/products'); 
const cartRoutes = require('./routes/cart');

app.use(cors());
app.use(express.json());
app.use(express.static('../frontend'));

// cupones
const cuponRoutes = require('./routes/cupones');

app.use('/api/cupones', cuponRoutes);

app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

const PORT = 3000;

app.listen(PORT, () => {
    console.log("Servidor corriendo en puerto " +300);
});