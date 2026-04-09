async function actualizarContadorCarrito() {
    try {
        const res = await fetch('/api/cart');
        if (!res.ok) return;

        const datos = await res.json();
        const totalItems = datos.reduce((acc, item) => acc + item.cantidad, 0);

        const contador = document.getElementById("contador");
        if (contador) contador.innerText = totalItems;
    } catch (error) {
        console.error("Error en contador:", error);
    }
}

async function obtenerTotalCarrito() {
    try {
        const res = await fetch('/api/cart');
        const datos = await res.json();
        return datos.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
    } catch (error) {
        console.error("Error obteniendo total:", error);
        return 0;
    }
}

async function aplicarCuponAlServidor(codigo) {
    const total = await obtenerTotalCarrito();
    
    if (total === 0) {
        alert("Tu carrito está vacío. ¡Agrega algunos antojos primero! 🍰");
        return;
    }

    try {
        const respuesta = await fetch('/api/cart/aplicar-cupon', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codigo, total })
        });

        const resultado = await respuesta.json();

        if (resultado.success) {
            alert(resultado.message);

            localStorage.setItem('descuentoActivo', resultado.data.ahorro);
            localStorage.setItem('nombreCupon', codigo);
            
            window.location.href = 'cart.html#seccion-cupones'; 
        } else {

            alert(resultado.message);
        }
    } catch (error) {
        console.error("Error en la conexión:", error);
        alert("Hubo un problema al aplicar el cupón.");
    }
}

async function cargarCupones() {
    const contenedor = document.getElementById("contenedor-cupones");
    if (!contenedor) return;

    try {
        const respuesta = await fetch('/api/cupones');
        const cupones = await respuesta.json();

        contenedor.innerHTML = "";
        cupones.forEach(cupon => {
            contenedor.innerHTML += `
                <div class="col-md-6 col-lg-4 mb-3">
                    <div class="coupon-card shadow-sm border rounded p-3 bg-white">
                        <div class="d-flex align-items-center mb-2">
                            <div class="fs-2 me-3">${cupon.icono}</div>
                            <div>
                                <h5 class="mb-0 fw-bold">${cupon.titulo}</h5>
                                <small class="text-muted">Mínimo: $${cupon.minimo}</small>
                            </div>
                        </div>
                        <hr>
                        <div class="d-flex justify-content-between align-items-center">
                            <small>Código: <strong>${cupon.codigo}</strong></small>
                            <button class="btn btn-sm btn-primary px-3" 
                                onclick="aplicarCuponAlServidor('${cupon.codigo}')">
                                usar
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error cargando cupones:", error);
        contenedor.innerHTML = "<p class='text-center'>No se pudieron cargar los descuentos.</p>";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    actualizarContadorCarrito();
    cargarCupones();

    const btnAplicar = document.getElementById('btn-aplicar-cupon');
    const inputCodigo = document.getElementById('input-codigo');

    if (btnAplicar && inputCodigo) {
        btnAplicar.addEventListener('click', () => {
            const valor = inputCodigo.value.trim();
            if (valor !== "") {
                aplicarCuponAlServidor(valor);
            } else {
                alert("Por favor ingresa un código.");
            }
        });
    }
});