// Funciones del dueño de cancha
const sesionDueno = obtenerSesion();

function panelDueno() {
    if (!document.getElementById("resumenDueno") || !protegerPagina("dueno")) return;

    const canchas = obtenerDatos(CLAVE_CANCHAS).filter(c => c.duenoId === sesionDueno.id);
    const ids = canchas.map(c => c.id);
    const reservas = obtenerDatos(CLAVE_RESERVAS).filter(r => ids.includes(r.canchaId));

    document.getElementById("nombreSesion").textContent = sesionDueno.nombre;
    document.getElementById("resumenDueno").innerHTML = `
        <p class="dato">Canchas propias: <strong>${canchas.length}</strong></p>
        <p class="dato">Reservas recibidas: <strong>${reservas.length}</strong></p>
    `;
}

function mostrarMisCanchas() {
    const contenedor = document.getElementById("misCanchasDueno");
    if (!contenedor || !protegerPagina("dueno")) return;

    const canchas = obtenerDatos(CLAVE_CANCHAS).filter(c => c.duenoId === sesionDueno.id);
    if (canchas.length === 0) {
        contenedor.innerHTML = "<p>No tiene canchas registradas.</p>";
        return;
    }

    canchas.forEach(cancha => {
        const articulo = document.createElement("article");
        articulo.className = "tarjeta";
        articulo.innerHTML = `
            <img src="${cancha.imagen}" alt="Imagen de ${cancha.nombre}">
            <div class="campo"><label for="nombre_${cancha.id}">Nombre</label><input id="nombre_${cancha.id}" value="${cancha.nombre}"></div>
            <div class="campo"><label for="tipo_${cancha.id}">Tipo</label><input id="tipo_${cancha.id}" value="${cancha.tipo}"></div>
            <div class="campo"><label for="ubicacion_${cancha.id}">Ubicación</label><input id="ubicacion_${cancha.id}" value="${cancha.ubicacion}"></div>
            <div class="campo"><label for="valor_${cancha.id}">Valor</label><input id="valor_${cancha.id}" type="number" min="1" value="${cancha.valor}"></div>
            <div class="campo"><label for="horarios_${cancha.id}">Horarios separados por coma</label><input id="horarios_${cancha.id}" value="${cancha.horarios.join(", ")}"></div>
            <div class="campo"><label for="disp_${cancha.id}">Disponibilidad</label>
                <select id="disp_${cancha.id}">
                    <option value="true" ${cancha.disponible ? "selected" : ""}>Disponible</option>
                    <option value="false" ${!cancha.disponible ? "selected" : ""}>No disponible</option>
                </select>
            </div>
            <button onclick="guardarCanchaDueno('${cancha.id}')">Guardar cambios</button>
            <p class="mensaje-ok" id="ok_${cancha.id}"></p>
        `;
        contenedor.appendChild(articulo);
    });
}

function guardarCanchaDueno(id) {
    const canchas = obtenerDatos(CLAVE_CANCHAS);
    const cancha = canchas.find(c => c.id === id && c.duenoId === sesionDueno.id);
    if (!cancha) return;

    const nombre = document.getElementById("nombre_" + id).value.trim();
    const tipo = document.getElementById("tipo_" + id).value.trim();
    const ubicacion = document.getElementById("ubicacion_" + id).value.trim();
    const valor = Number(document.getElementById("valor_" + id).value);
    const horarios = document.getElementById("horarios_" + id).value.split(",").map(h => h.trim()).filter(h => h !== "");

    if (!nombre || !tipo || !ubicacion || valor <= 0 || horarios.length === 0) {
        document.getElementById("ok_" + id).textContent = "Complete correctamente todos los datos.";
        return;
    }

    cancha.nombre = nombre;
    cancha.tipo = tipo;
    cancha.ubicacion = ubicacion;
    cancha.valor = valor;
    cancha.horarios = horarios;
    cancha.disponible = document.getElementById("disp_" + id).value === "true";
    guardarDatos(CLAVE_CANCHAS, canchas);
    document.getElementById("ok_" + id).textContent = "Cambios guardados.";
}

function mostrarReservasDueno() {
    const cuerpo = document.getElementById("tablaReservasDueno");
    if (!cuerpo || !protegerPagina("dueno")) return;

    const canchas = obtenerDatos(CLAVE_CANCHAS).filter(c => c.duenoId === sesionDueno.id);
    const ids = canchas.map(c => c.id);
    const reservas = obtenerDatos(CLAVE_RESERVAS).filter(r => ids.includes(r.canchaId));

    if (reservas.length === 0) {
        cuerpo.innerHTML = '<tr><td colspan="7">No hay reservas en sus canchas.</td></tr>';
        return;
    }

    reservas.forEach(reserva => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${nombreCancha(reserva.canchaId)}</td>
            <td>${nombreUsuario(reserva.clienteId)}</td>
            <td>${reserva.fecha}</td>
            <td>${reserva.horario}</td>
            <td>${reserva.estado}</td>
            <td>${reserva.pago}</td>
            <td>${reserva.estado !== "Cancelada" ? `<button class="boton-rojo" onclick="cancelarReservaDueno('${reserva.id}')">Cancelar</button>` : "-"}</td>
        `;
        cuerpo.appendChild(fila);
    });
}

function cancelarReservaDueno(id) {
    const canchas = obtenerDatos(CLAVE_CANCHAS).filter(c => c.duenoId === sesionDueno.id);
    const ids = canchas.map(c => c.id);
    const reservas = obtenerDatos(CLAVE_RESERVAS);
    const reserva = reservas.find(r => r.id === id && ids.includes(r.canchaId));
    if (!reserva) return;

    reserva.estado = "Cancelada";
    guardarDatos(CLAVE_RESERVAS, reservas);
    window.location.reload();
}

panelDueno();
mostrarMisCanchas();
mostrarReservasDueno();
