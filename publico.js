// Mostrar canchas en la vista pública
const listaPublica = document.getElementById("listaPublica");
if (listaPublica) {
    const canchas = obtenerDatos(CLAVE_CANCHAS).filter(c => c.disponible);

    canchas.forEach(cancha => {
        const articulo = document.createElement("article");
        articulo.className = "tarjeta";
        articulo.innerHTML = `
            <img src="${cancha.imagen}" alt="Imagen de ${cancha.nombre}">
            <h3>${cancha.nombre}</h3>
            <p><strong>Tipo:</strong> ${cancha.tipo}</p>
            <p><strong>Ubicación:</strong> ${cancha.ubicacion}</p>
            <p><strong>Valor:</strong> ${formatoDinero(cancha.valor)}</p>
            <a class="boton" href="login.html">Iniciar sesión para reservar</a>
        `;
        listaPublica.appendChild(articulo);
    });
}
