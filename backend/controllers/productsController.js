const ProductService = require('../services/productService');

const getAllProducts = (req, res) => {
    const lista = ProductService.getAll();
    res.json(lista);
};

module.exports = { getAllProducts };