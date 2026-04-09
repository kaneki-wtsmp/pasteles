const fs = require('fs');
const path = require('path');

const rutaCart = path.join(__dirname, '../data/cart.json');
const rutaDescuento = path.join(__dirname, '../data/descuento.json');

const CartRepository = {
    getAll: () => {
        const data = fs.readFileSync(rutaCart, 'utf8');
        return JSON.parse(data);
    },
    saveAll: (carrito) => {
        fs.writeFileSync(rutaCart, JSON.stringify(carrito, null, 2));
    },
    getCupones: () => {
        const data = fs.readFileSync(rutaDescuento, 'utf-8');
        return JSON.parse(data);
    },
    actualizarCupon: (cuponesActualizados) => {
        fs.writeFileSync(rutaDescuento, JSON.stringify(cuponesActualizados, null, 2));
    }
    
};

module.exports = CartRepository;