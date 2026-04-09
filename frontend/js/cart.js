document.addEventListener("DOMContentLoaded", () => {
    cargarCarritoDesdeServidor();
    cargarCuponesEnCart();

    const btnQuitar = document.getElementById('btn-quitar-cupon');
    if (btnQuitar) {
        btnQuitar.addEventListener('click', () => {
            localStorage.removeItem('descuentoActivo');
            localStorage.removeItem('nombreCupon'); 
            cargarCarritoDesdeServidor();
            mostrarToast("Cupón removido 🗑️");
        });
    }
    const btnFinalizar = document.getElementById("btn-finalizar");
    if (btnFinalizar) {
        btnFinalizar.addEventListener("click", mostrarTicket);
    }
});
    const btnManual = document.getElementById("btn-aplicar-cart");
    if (btnManual) {
        btnManual.addEventListener("click", () => {
            const input = document.getElementById("input-codigo-cart");
            const cod = input ? input.value.trim() : "";
            if (cod) aplicarDesdeCart(cod);
        });
    }

function mostrarToast(mensaje) {
    const toast = document.createElement("div");
    toast.innerText = mensaje;

    Object.assign(toast.style, {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "#459677",
        color: "white",
        padding: "15px 25px",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        zIndex: "10000",
        fontFamily: "sans-serif",
        fontWeight: "bold",
        opacity: "0",
        animation: "fadein 0.5s forwards, fadeout 0.5s 1.5s forwards"
    });

    document.body.appendChild(toast);

    toast.addEventListener("animationend", (e) => {
        if (e.animationName === "fadeout") {
            toast.remove();
        }
    });
}

async function cargarCarritoDesdeServidor() {
    try {
        const respuesta = await fetch('/api/cart'); 
        const productos = await respuesta.json();

        const tabla = document.getElementById("lista-carrito");
        const subtotalTxt = document.getElementById("subtotal-carrito");
        const totalFinalTxt = document.getElementById("total-final-carrito");
        const lineaDescuento = document.getElementById("linea-descuento");
        const valorDescuentoTxt = document.getElementById("valor-descuento");
        const nombreCuponTxt = document.getElementById("nombre-cupon-aplicado"); 
        
        let subtotalAcumulado = 0;
        tabla.innerHTML = ""; 

        if (productos.length === 0) {
            tabla.innerHTML = '<tr><td colspan="6" class="py-5 text-center text-muted">Tu rincón de antojos está vacío...</td></tr>';
        } else {
            productos.forEach(p => {
                const sub = p.precio * p.cantidad;
                subtotalAcumulado += sub;

                tabla.innerHTML += `
                    <tr>
                        <td class="fw-bold">${p.nombre}</td>
                        <td><img src="${p.img}" width="60" class="rounded shadow-sm"></td>
                        <td>$${p.precio.toFixed(2)}</td>
                        <td>
                            <div class="mi-eli d-flex align-items-center justify-content-center border rounded-pill mx-auto" style="width: 110px;">
                                <button class="btn btn-sm btn-link text-dark fw-bold p-0" onclick="eliminarUno('${p.nombre}')"> - </button>
                                <span class="mx-3 fw-bold">${p.cantidad}</span>
                                <button class="btn btn-sm btn-link text-primary fw-bold p-0" onclick="sumarUno('${p.nombre}')"> + </button>
                            </div>
                        </td>
                        <td>$${sub.toFixed(2)}</td>
                        <td>
                            <button class="btn btn-sm border-0 mi-eli" onclick="quitarTodo('${p.nombre}')">🗑️</button>
                        </td>
                    </tr>
                `;
            });
        }

        const ahorro = parseFloat(localStorage.getItem('descuentoActivo')) || 0;
        const nombreCup = localStorage.getItem('nombreCupon') || "";
        const totalFinal = subtotalAcumulado - ahorro;

        subtotalTxt.innerText = `$${subtotalAcumulado.toFixed(2)}`;
        
        if (ahorro > 0) {
            lineaDescuento.style.display = 'flex'; 
            valorDescuentoTxt.innerText = `-$${ahorro.toFixed(2)}`;
            if (nombreCuponTxt) nombreCuponTxt.innerText = `(${nombreCup})`;
        } else {
            lineaDescuento.style.display = 'none';
        }

        totalFinalTxt.innerText = `$${totalFinal.toFixed(2)}`;

    } catch (error) {
        console.log("error cargando carrito", error);
    }
}

async function cargarCuponesEnCart() {
    const contenedor = document.getElementById("lista-cupones-disponibles");
    if (!contenedor) return;

    try {
        const res = await fetch('/api/cupones');
        const cupones = await res.json();
        
        contenedor.innerHTML = "";
        cupones.forEach(c => {
            contenedor.innerHTML += `
                <div class="col-6 col-md-4 mb-2">
                    <div class="p-2 border rounded d-flex align-items-center justify-content-between bg-white shadow-sm">
                        <div class="text-truncate">
                            <span class="me-1">${c.icono}</span>
                            <small class="fw-bold">${c.codigo}</small>
                        </div>
                        <button class="btn btn-sm border-0 text-primary fw-bold" 
                            onclick="aplicarDesdeCart('${c.codigo}')">
                            Add
                        </button>
                    </div>
                </div>
            `;
        });
    } catch (e) {
        console.error("Error cargando cupones", e);
    }
}

async function aplicarDesdeCart(codigo) {
    const totalTexto = document.getElementById("subtotal-carrito").innerText;
    const totalActual = parseFloat(totalTexto.replace('$', ''));

    try {
        const res = await fetch('/api/cart/aplicar-cupon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codigo, total: totalActual })
        });

        const resultado = await res.json();

        if (resultado.success) {
            localStorage.setItem('descuentoActivo', resultado.data.ahorro);
            localStorage.setItem('nombreCupon', codigo);
            mostrarToast("¡Cupón aplicado! ");
            cargarCarritoDesdeServidor();
        } else {
            alert(resultado.message);
        }
    } catch (e) {
        console.error("Error al aplicar cupón", e);
    }
}

async function validarImpactoCupon(montoAQuitar) {
    const cuponActivo = localStorage.getItem('nombreCupon');
    if (!cuponActivo) return true;
    try {
        const subtotal = parseFloat(
            document.getElementById("subtotal-carrito").innerText.replace('$', '')
        );
        const res = await fetch('/api/cupones');
        const cupon = (await res.json()).find(c => c.codigo === cuponActivo);
        const nuevoSubtotal = subtotal - montoAQuitar;
        if (cupon && nuevoSubtotal < cupon.minimo) {
            const seguir = confirm(
                `Ojo \n\nTu total quedaría en $${nuevoSubtotal.toFixed(2)}, ` +
                `ya no cumple el mínimo ($${cupon.minimo}).\n\n¿Continuar sin descuento?`
            );
            if (!seguir) return false;
            localStorage.removeItem('descuentoActivo');
            localStorage.removeItem('nombreCupon');
        }
        return true;
    } catch {
        return true;
    }
}

async function sumarUno(nombre) {
    try {
        const respuesta = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre })
        });
        if (respuesta.ok) {
            mostrarToast("¡Uno más!");
            cargarCarritoDesdeServidor();
            actualizarContadorCarrito();
        }
    } catch (error) { console.log(error); }

}
async function eliminarUno(nombre) {
    try {
        const resCarrito = await fetch('/api/cart');
        const productos = await resCarrito.json();
        const p = productos.find(prod => prod.nombre === nombre);
        if (!p) return;
        const sePuede = await validarImpactoCupon(p.precio);
        if (!sePuede) return; 
        if (p.cantidad === 1) {
            if (!confirm(`¿Quitar el último ${nombre}?`)) return;
        }
        const url = `/api/cart/${encodeURIComponent(nombre)}`;
        const respuesta = await fetch(url, { method: 'DELETE' });
        if (respuesta.ok) { 
            mostrarToast("¡Adiós antojo!");
            cargarCarritoDesdeServidor(); 
            if (typeof actualizarContadorCarrito === 'function') actualizarContadorCarrito();
        }
    } catch (error) {
        console.error("Error al eliminar uno:", error);
    }
}

async function quitarTodo(nombre) {
    try {
        const resCarrito = await fetch('/api/cart');
        const productos = await resCarrito.json();
        const p = productos.find(prod => prod.nombre === nombre);
        if (!p) return;
        const valorTotalProducto = p.precio * p.cantidad;
        const sePuede = await validarImpactoCupon(valorTotalProducto);
        if (!sePuede) return;
        if (confirm(`¿Quitar todos los ${nombre}?`)) {
            const url = `/api/cart/${encodeURIComponent(nombre)}?todo=true`; 
            const respuesta = await fetch(url, { method: 'DELETE' });
            if (respuesta.ok) {
                mostrarToast("¡Producto eliminado!");
                cargarCarritoDesdeServidor();
                if (typeof actualizarContadorCarrito === 'function') actualizarContadorCarrito();
            }
        }
    } catch (error) {
        console.error("Error al quitar todo:", error);
    }
}

async function mostrarTicket() {
    try {
        const res = await fetch('/api/cart');
        const productos = await res.json();

        if (!productos || productos.length === 0) {
            alert("Tu carrito está vacío");
            return;
        }

        let subtotal = 0;
        let listaHTML = "";

        productos.forEach(p => {
            const sub = p.precio * p.cantidad;
            subtotal += sub;
            listaHTML += `
                <div class="ticket-line">
                    <span>${p.nombre} x${p.cantidad}</span>
                    <span>$${sub.toFixed(2)}</span>
                </div>
            `;
        });

        const descuento = parseFloat(localStorage.getItem('descuentoActivo')) || 0;
        const cupon = localStorage.getItem('nombreCupon') || "";
        const total = subtotal - descuento;

        const overlay = document.createElement("div");
        overlay.className = "ticket-overlay";

        overlay.innerHTML = `
            <div class="ticket-box">
                <h4>🧾 Ticket</h4>
                <hr>
                ${listaHTML}
                <hr>
                <div class="ticket-line">
                    <strong>Subtotal:</strong>
                    <span>$${subtotal.toFixed(2)}</span>
                </div>
                ${descuento > 0 ? `
                <div class="ticket-descuento">
                    <strong>Descuento (${cupon}):</strong>
                    <span>-$${descuento.toFixed(2)}</span>
                </div>` : ""}
                <div class="ticket-total">
                    <strong>Total:</strong>
                    <strong>$${total.toFixed(2)}</strong>
                </div>
                <p class="ticket-footer">
                    El pago lo realizaras en tienda
                </p>
                <button class="ticket-btn" id="confirmar-compra">
                    Confirmar
                </button>
                <button class="ticket-btn" id="cerrar-ticket">
                    Cerrar
                </button>
            </div>
        `;
        document.body.appendChild(overlay);
        document.getElementById("cerrar-ticket").onclick = () => overlay.remove();
        document.getElementById("confirmar-compra").onclick = async () => {
            try {
                const response = await fetch('/api/cart/clear', { method: 'POST' });
                
                if (response.ok) {
                    localStorage.removeItem('descuentoActivo');
                    localStorage.removeItem('nombreCupon');
                    alert("Compra confirmada. Tu carrito ha sido vaciado.");
                    overlay.remove();
                    window.location.reload(); 
                } else {
                    throw new Error("Error en la respuesta del servidor");
                }
            } catch (err) {
                console.error("Error al vaciar carrito", err);
                alert("❌ Hubo un problema al confirmar la compra.");
            }
        };

    } catch (e) {
        console.error("Error generando ticket", e);
    }
}