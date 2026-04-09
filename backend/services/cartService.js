const CartRepository = require('../repository/cartRepository');

const CartService = {
    getCart: () => {
        return CartRepository.getAll();
    },

    addToCart: (producto) => {
        let carrito = CartRepository.getAll();
        const existe = carrito.find(p => p.nombre === producto.nombre);
        let mensaje = "";

        if (existe) {
            existe.cantidad += 1;
            mensaje = "Se agregó uno más";
        } else {
            producto.cantidad = 1;
            carrito.push(producto);
            mensaje = "Producto agregado";
        }

        CartRepository.saveAll(carrito);
        return { carrito, mensaje };
    },

    removeFromCart: (nombre, todo) => {
        let carrito = CartRepository.getAll();
        const index = carrito.findIndex(p => p.nombre === nombre);

        if (index === -1) return null;

        let mensaje = "";

        if (todo === 'true' || carrito[index].cantidad <= 1) {
            carrito.splice(index, 1);
            mensaje = "Producto eliminado";
        } else {
            carrito[index].cantidad -= 1;
            mensaje = "Se quitó uno";
        }

        CartRepository.saveAll(carrito);
        return { carrito, mensaje };
    },

    validarYAplicarCupon: (codigoUsuario, totalCompra) => {
        const cupones = CartRepository.getCupones();
        const cupon = cupones.find(c => c.codigo === codigoUsuario);

        if (!cupon) return { error: "El código no existe 🍫" };
        
        if (totalCompra < cupon.minimo) {
            return { error: cupon.mensajeError || `Necesitas comprar más de $${cupon.minimo}` };
        }

        let porcentaje = 0;
        if (cupon.titulo.includes("20")) porcentaje = 0.20;
        else if (cupon.titulo.includes("10")) porcentaje = 0.10;
        else porcentaje = 0.05; 

        let ahorro = totalCompra * porcentaje;

        if (cupon.usosActuales !== undefined) {
            cupon.usosActuales++;
            CartRepository.actualizarCupon(cupones);
        }

        return { 
            success: true, 
            mensaje: cupon.mensajeExito || "¡Cupón aplicado!", 
            ahorro: ahorro, 
            nuevoTotal: totalCompra - ahorro 
        };
    },
    clear: () => {
        const carritoVacio = [];
        CartRepository.saveAll(carritoVacio); 
        return carritoVacio;
    }
};

module.exports = CartService;