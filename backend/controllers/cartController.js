const CartService = require('../services/cartService');

const CartController = {
    getCart: (req, res) => {
        res.json(CartService.getCart());
    },
    addToCart: (req, res) => {
        const resultado = CartService.addToCart(req.body);
        res.json(resultado);
    },
    removeFromCart: (req, res) => {
        const { nombre } = req.params;
        const { todo } = req.query;
        const resultado = CartService.removeFromCart(nombre, todo);
        if (!resultado) return res.status(404).json({ mensaje: "No encontrado" });
        res.json(resultado);
    },
    aplicarDescuento: (req, res) => {
        const { codigo, total } = req.body;
        const resultado = CartService.validarYAplicarCupon(codigo, total);

        if (resultado.error) {
            return res.status(400).json({ success: false, message: resultado.error });
        }

        res.json({ 
            success: true, 
            message: resultado.mensaje,
            data: {
                ahorro: resultado.ahorro,
                nuevoTotal: resultado.nuevoTotal
            }
        });
    },
    clearCart: (req, res) => {
        const resultado = CartService.clear(); // Llamamos al servicio
        res.json({ success: true, message: "Carrito vaciado", data: resultado });
    }
};

module.exports = CartController;