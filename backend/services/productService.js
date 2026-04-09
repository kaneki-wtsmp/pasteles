const ProductRepository = require('../repository/productRepository');

const ProductService = {
    getAll: () => {
        return ProductRepository.getAll();
    }
};

module.exports = ProductService;