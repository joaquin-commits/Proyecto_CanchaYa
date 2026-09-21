// Funciones del cliente
const sesionCliente = obtenerSesion();

function mostrarCanchasCliente(filtro = "") {
    const contenedor = document.getElementById("listaCanchasCliente");
    if (!contenedor) return;

    contenedor.innerHTML = "";
    const texto = filtro.toLowerCase();
    const canchas = obtenerDatos(CLAVE_CANCHAS).filter(c =>
        c.disponible &&
        (c.nombre.toLowerCase().includes(texto) || c.tipo.toLowerCase().includes(texto) || c.ubicacion.toLowerCase().includes(texto))
    );

    if (canchas.length === 0) {
        contenedor.innerHTML = "<p>No se encontraron canchas.</p>";
        return;
    }

    canchas.forEach(cancha => {
        const articulo = document.createElement("article");
        articulo.className = "tarjeta";
        articulo.innerHTML = `
            <img src="${cancha.imagen}" alt="Imagen de ${cancha.nombre}">
            <h3>${cancha.nombre}</h3>
            <p><strong>Tipo:</strong> ${cancha.tipo}</p>
            <p><strong>Ubicación:</strong> ${cancha.ubicacion}</p>
            <p><strong>Valor:</strong> ${formatoDinero(cancha.valor)}</p>
            <p><strong>Horarios:</strong> ${cancha.horarios.join(", ")}</p>
            <a class="boton" href="reservar.html?id=${cancha.id}">Reservar</a>
        `;
        contenedor.appendChild(articulo);
    });
}

if (document.getElementById("listaCanchasCliente")) {
    if (protegerPagina("cliente")) {
        mostrarCanchasCliente();
        document.getElementById("nombreSesion").textContent = sesionCliente.nombre;
        document.getElementById("buscarCancha").addEventListener("input", function () {
            mostrarCanchasCliente(this.value);
        });
    }
}

function cargarReserva() {
    if (!document.getElementById("formReserva")) return;
    if (!protegerPagina("cliente")) return;

    const canchas = obtenerDatos(CLAVE_CANCHAS).filter(c => c.disponible);
    const selectCancha = document.getElementById("cancha");
    const idUrl = new URLSearchParams(window.location.search).get("id");

    canchas.forEach(cancha => {
        const opcion = document.createElement("option");
        opcion.value = cancha.id;
        opcion.textContent = `${cancha.nombre} - ${formatoDinero(cancha.valor)}`;
        if (cancha.id === idUrl) opcion.selected = true;
        selectCancha.appendChild(opcion);
    });

    const hoy = new Date();
    hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());
    document.getElementById("fecha").min = hoy.toISOString().split("T")[0];
    selectCancha.addEventListener("change", actualizarHorarios);
    document.getElementById("fecha").addEventListener("change", actualizarHorarios);
    document.getElementById("horario").addEventListener("change", mostrarResumen);
    actualizarHorarios();

    document.getElementById("formReserva").addEventListener("submit", pagarYGuardarReserva);
}

function actualizarHorarios() {
    const canchaId = document.getElementById("cancha").value;
    const fecha = document.getElementById("fecha").value;
    const selectHorario = document.getElementById("horario");
    const canchas = obtenerDatos(CLAVE_CANCHAS);
    const reservas = obtenerDatos(CLAVE_RESERVAS);
    const cancha = canchas.find(c => c.id === canchaId);

    selectHorario.innerHTML = '<option value="">Seleccione un horario</option>';
    if (!cancha) return;

    cancha.horarios.forEach(hora => {
        const ocupado = reservas.some(r =>
            r.canchaId === canchaId &&
            r.fecha === fecha &&
            r.horario === hora &&
            r.estado !== "Cancelada" &&
            r.pago === "Pagada"
        );
        if (!ocupado) {
            const opcion = document.createElement("option");
            opcion.value = hora;
            opcion.textContent = hora;
            selectHorario.appendChild(opcion);
        }
    });
    mostrarResumen();
}

function mostrarResumen() {
    const canchaId = document.getElementById("cancha")?.value;
    const fecha = document.getElementById("fecha")?.value;
    const horario = document.getElementById("horario")?.value;
    const resumen = document.getElementById("resumenReserva");
    if (!resumen) return;

    const cancha = obtenerDatos(CLAVE_CANCHAS).find(c => c.id === canchaId);
    if (!cancha || !fecha || !horario) {
        resumen.innerHTML = "Complete cancha, fecha y horario para revisar la reserva.";
        return;
    }

    resumen.innerHTML = `
        <strong>Nombre de la cancha:</strong> ${cancha.nombre}<br>
        <strong>Fecha:</strong> ${fecha}<br>
        <strong>Horario:</strong> ${horario}<br>
        <strong>Valor:</strong> ${formatoDinero(cancha.valor)}
    `;
}

function pagarYGuardarReserva(evento) {
    evento.preventDefault();
    document.getElementById("errorReserva").textContent = "";
    document.getElementById("mensajeReserva").textContent = "";

    const canchaId = document.getElementById("cancha").value;
    const fecha = document.getElementById("fecha").value;
    const horario = document.getElementById("horario").value;

    if (!canchaId || !fecha || !horario) {
        document.getElementById("errorReserva").textContent = "Complete todos los datos de la reserva.";
        return;
    }

    const reservas = obtenerDatos(CLAVE_RESERVAS);
    const duplicada = reservas.some(r =>
        r.canchaId === canchaId &&
        r.fecha === fecha &&
        r.horario === horario &&
        r.estado !== "Cancelada" &&
        r.pago === "Pagada"
    );

    if (duplicada) {
        document.getElementById("errorReserva").textContent = "Ese horario ya fue reservado. Seleccione otro.";
        actualizarHorarios();
        return;
    }

    const cancha = obtenerDatos(CLAVE_CANCHAS).find(c => c.id === canchaId);
    reservas.push({
        id: "r" + Date.now(),
        clienteId: sesionCliente.id,
        canchaId: canchaId,
        fecha: fecha,
        horario: horario,
        valor: cancha.valor,
        estado: "Confirmada",
        pago: "Pagada"
    });

    guardarDatos(CLAVE_RESERVAS, reservas);
    document.getElementById("mensajeReserva").textContent = "Pago realizado. Reserva confirmada correctamente.";
    document.getElementById("formReserva").reset();
    document.getElementById("resumenReserva").textContent = "Complete cancha, fecha y horario para revisar la reserva.";
    actualizarHorarios();
}

function sePuedeCancelar(fechaReserva) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fecha = new Date(fechaReserva + "T00:00:00");
    return hoy < fecha;
}

function mostrarMisReservas() {
    const contenedor = document.getElementById("tablaMisReservas");
    if (!contenedor || !protegerPagina("cliente")) return;

    const reservas = obtenerDatos(CLAVE_RESERVAS).filter(r => r.clienteId === sesionCliente.id);
    if (reservas.length === 0) {
        contenedor.innerHTML = '<tr><td colspan="7">No tiene reservas registradas.</td></tr>';
        return;
    }

    reservas.forEach(reserva => {
        const fila = document.createElement("tr");
        const puedeCancelar = reserva.estado !== "Cancelada" && sePuedeCancelar(reserva.fecha);

        fila.innerHTML = `
            <td>${nombreCancha(reserva.canchaId)}</td>
            <td>${reserva.fecha}</td>
            <td>${reserva.horario}</td>
            <td>${formatoDinero(reserva.valor)}</td>
            <td>${reserva.estado}</td>
            <td>${reserva.pago}</td>
            <td>${puedeCancelar ? `<button class="boton-rojo" onclick="cancelarReservaCliente('${reserva.id}')">Cancelar</button>` : "-"}</td>
        `;
        contenedor.appendChild(fila);
    });
}

function cancelarReservaCliente(id) {
    const reservas = obtenerDatos(CLAVE_RESERVAS);
    const reserva = reservas.find(r => r.id === id && r.clienteId === sesionCliente.id);

    if (!reserva || reserva.estado === "Cancelada" || !sePuedeCancelar(reserva.fecha)) return;

    reserva.estado = "Cancelada";
    guardarDatos(CLAVE_RESERVAS, reservas);
    window.location.reload();
}

cargarReserva();
mostrarMisReservas();
