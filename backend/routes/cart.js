const express = require('express');
const router = express.Router();
const CartController = require('../controllers/cartController');

router.get('/', CartController.getCart);
router.post('/', CartController.addToCart);
router.delete('/:nombre', CartController.removeFromCart);
router.post('/clear', CartController.clearCart);
router.post('/aplicar-cupon', CartController.aplicarDescuento);

module.exports = router;