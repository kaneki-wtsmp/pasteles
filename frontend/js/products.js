const contenedor = document.getElementById("contenedor-productos");

async function obtenerProductos() {
    try {
        const respuesta = await fetch('/api/products'); 
        const productos = await respuesta.json();
        pintarProductos(productos);
    } catch (error) {
        console.log("error productos", error);
    }
}

function pintarProductos(lista) {
    contenedor.innerHTML = ""; 

    lista.forEach(p => {
        contenedor.innerHTML += `
            <div class="col-md-3 mb-4">
                <div class="card h-100 shadow-sm">
                    <img src="${p.img}" class="card-img-top" alt="${p.nombre}">
                    <div class="card-body text-center">
                        <h6>${p.nombre}</h6>
                        <p class="text-muted">$${p.precio.toFixed(2)}</p>
                        <button class="btn w-100 btn-add-cart mi-boton" 
                                data-id="${p.id}" 
                                data-name="${p.nombre}" 
                                data-price="${p.precio}"
                                data-img="${p.img}">
                            Agregar
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    const botones = document.querySelectorAll(".btn-add-cart");

    botones.forEach(boton => {
        boton.addEventListener("click", (e) => {
            const btn = e.target;

            const producto = {
                id: btn.getAttribute("data-id"),
                nombre: btn.getAttribute("data-name"),
                precio: parseFloat(btn.getAttribute("data-price")),
                img: btn.getAttribute("data-img")
            };

            enviarAlServidor(producto);
        });
    });
}

async function enviarAlServidor(producto) {
    try {
        const respuesta = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(producto)
        });

        if (respuesta.ok) {
            await respuesta.json();
            actualizarContadorCarrito();
            alert(producto.nombre + " agregado");
        } else {
            alert("No se pudo agregar");
        }
    } catch (error) {
        console.log("error carrito", error);
    }
}

async function agregarProductos(producto){
    
    
}

document.addEventListener("DOMContentLoaded", obtenerProductos);