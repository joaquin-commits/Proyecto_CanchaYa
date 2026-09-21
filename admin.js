// Funciones del administrador
const sesionAdmin = obtenerSesion();

function correoValidoAdmin(correo) {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo);
}

function panelAdmin() {
    if (!document.getElementById("resumenAdmin") || !protegerPagina("admin")) return;

    const usuarios = obtenerDatos(CLAVE_USUARIOS);
    const canchas = obtenerDatos(CLAVE_CANCHAS);
    const reservas = obtenerDatos(CLAVE_RESERVAS);

    document.getElementById("nombreSesion").textContent = sesionAdmin.nombre;
    document.getElementById("resumenAdmin").innerHTML = `
        <p class="dato">Canchas registradas: <strong>${canchas.length}</strong></p>
        <p class="dato">Dueños registrados: <strong>${usuarios.filter(u => u.tipo === "dueno").length}</strong></p>
        <p class="dato">Clientes registrados: <strong>${usuarios.filter(u => u.tipo === "cliente").length}</strong></p>
        <p class="dato">Reservas registradas: <strong>${reservas.length}</strong></p>
    `;
}

// Crear una cancha nueva y asignarla a un dueño
function cargarDuenosEnFormulario() {
    const select = document.getElementById("nuevoDueno");
    if (!select || !protegerPagina("admin")) return;

    const duenos = obtenerDatos(CLAVE_USUARIOS).filter(u => u.tipo === "dueno");
    duenos.forEach(dueno => {
        const opcion = document.createElement("option");
        opcion.value = dueno.id;
        opcion.textContent = dueno.nombre + " - " + dueno.correo;
        select.appendChild(opcion);
    });
}

function limpiarErroresNuevaCancha() {
    [
        "errorNuevoDueno",
        "errorNuevoNombre",
        "errorNuevoTipo",
        "errorNuevaUbicacion",
        "errorNuevoValor",
        "errorNuevosHorarios"
    ].forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.textContent = "";
    });
}

const formularioNuevaCancha = document.getElementById("formNuevaCancha");
if (formularioNuevaCancha) {
    formularioNuevaCancha.addEventListener("submit", function (evento) {
        evento.preventDefault();
        limpiarErroresNuevaCancha();
        document.getElementById("mensajeNuevaCancha").textContent = "";

        const duenoId = document.getElementById("nuevoDueno").value;
        const nombre = document.getElementById("nuevoNombreCancha").value.trim();
        const tipo = document.getElementById("nuevoTipoCancha").value.trim();
        const ubicacion = document.getElementById("nuevaUbicacionCancha").value.trim();
        const valor = Number(document.getElementById("nuevoValorCancha").value);
        const textoHorarios = document.getElementById("nuevosHorariosCancha").value.trim();
        const horarios = textoHorarios.split(",").map(h => h.trim()).filter(h => h !== "");
        let correcto = true;

        if (duenoId === "") {
            document.getElementById("errorNuevoDueno").textContent = "Seleccione un usuario dueño para la cancha.";
            correcto = false;
        }
        if (nombre === "") {
            document.getElementById("errorNuevoNombre").textContent = "Ingrese el nombre de la cancha.";
            correcto = false;
        }
        if (tipo === "") {
            document.getElementById("errorNuevoTipo").textContent = "Ingrese el tipo de cancha.";
            correcto = false;
        }
        if (ubicacion === "") {
            document.getElementById("errorNuevaUbicacion").textContent = "Ingrese la ubicación.";
            correcto = false;
        }
        if (valor <= 0) {
            document.getElementById("errorNuevoValor").textContent = "Ingrese un valor válido.";
            correcto = false;
        }
        if (horarios.length === 0) {
            document.getElementById("errorNuevosHorarios").textContent = "Ingrese al menos un horario.";
            correcto = false;
        }

        if (!correcto) return;

        const duenoExiste = obtenerDatos(CLAVE_USUARIOS).some(u => u.id === duenoId && u.tipo === "dueno");
        if (!duenoExiste) {
            document.getElementById("errorNuevoDueno").textContent = "Seleccione un usuario dueño válido.";
            return;
        }

        let imagen = "img/cancha-multiuso.svg";
        const tipoMinuscula = tipo.toLowerCase();
        if (tipoMinuscula.includes("futbol") || tipoMinuscula.includes("fútbol")) imagen = "img/cancha-futbol.svg";
        if (tipoMinuscula.includes("padel") || tipoMinuscula.includes("pádel")) imagen = "img/cancha-padel.svg";

        const canchas = obtenerDatos(CLAVE_CANCHAS);
        canchas.push({
            id: "ca" + Date.now(),
            duenoId: duenoId,
            nombre: nombre,
            tipo: tipo,
            ubicacion: ubicacion,
            valor: valor,
            disponible: document.getElementById("nuevaDisponibilidadCancha").value === "true",
            horarios: horarios,
            imagen: imagen
        });

        guardarDatos(CLAVE_CANCHAS, canchas);
        document.getElementById("mensajeNuevaCancha").textContent = "Cancha creada y asignada correctamente.";
        formularioNuevaCancha.reset();

        setTimeout(function () {
            window.location.reload();
        }, 500);
    });
}

function mostrarCanchasAdmin() {
    const contenedor = document.getElementById("canchasAdmin");
    if (!contenedor || !protegerPagina("admin")) return;

    const canchas = obtenerDatos(CLAVE_CANCHAS);
    if (canchas.length === 0) {
        contenedor.innerHTML = "<p>No hay canchas registradas.</p>";
        return;
    }

    canchas.forEach(cancha => {
        const articulo = document.createElement("article");
        articulo.className = "tarjeta";
        articulo.innerHTML = `
            <img src="${cancha.imagen}" alt="Imagen de ${cancha.nombre}">
            <p><strong>Dueño:</strong> ${nombreUsuario(cancha.duenoId)}</p>
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
            <button onclick="guardarCanchaAdmin('${cancha.id}')">Guardar</button>
            <button class="boton-rojo" onclick="eliminarCancha('${cancha.id}')">Eliminar cancha</button>
            <p class="mensaje-ok" id="ok_${cancha.id}"></p>
        `;
        contenedor.appendChild(articulo);
    });
}

function guardarCanchaAdmin(id) {
    const canchas = obtenerDatos(CLAVE_CANCHAS);
    const cancha = canchas.find(c => c.id === id);
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

function eliminarCancha(id) {
    if (!confirm("¿Desea eliminar esta cancha?")) return;
    const canchas = obtenerDatos(CLAVE_CANCHAS).filter(c => c.id !== id);
    guardarDatos(CLAVE_CANCHAS, canchas);
    window.location.reload();
}

function mostrarReservasAdmin() {
    const cuerpo = document.getElementById("tablaReservasAdmin");
    if (!cuerpo || !protegerPagina("admin")) return;

    const reservas = obtenerDatos(CLAVE_RESERVAS);
    if (reservas.length === 0) {
        cuerpo.innerHTML = '<tr><td colspan="8">No hay reservas registradas.</td></tr>';
        return;
    }

    reservas.forEach(reserva => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${nombreCancha(reserva.canchaId)}</td>
            <td>${nombreUsuario(reserva.clienteId)}</td>
            <td>${reserva.fecha}</td>
            <td>${reserva.horario}</td>
            <td>${formatoDinero(reserva.valor)}</td>
            <td>${reserva.estado}</td>
            <td>${reserva.pago}</td>
            <td>${reserva.estado !== "Cancelada" ? `<button class="boton-rojo" onclick="cancelarReservaAdmin('${reserva.id}')">Cancelar</button>` : "-"}</td>
        `;
        cuerpo.appendChild(fila);
    });
}

function cancelarReservaAdmin(id) {
    const reservas = obtenerDatos(CLAVE_RESERVAS);
    const reserva = reservas.find(r => r.id === id);
    if (!reserva) return;
    reserva.estado = "Cancelada";
    guardarDatos(CLAVE_RESERVAS, reservas);
    window.location.reload();
}

// Crear usuarios dueños
function limpiarErroresNuevoDueno() {
    ["errorNombreNuevoDueno", "errorCorreoNuevoDueno", "errorClaveNuevoDueno"].forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.textContent = "";
    });
}

const formularioNuevoDueno = document.getElementById("formNuevoDueno");
if (formularioNuevoDueno) {
    formularioNuevoDueno.addEventListener("submit", function (evento) {
        evento.preventDefault();
        limpiarErroresNuevoDueno();
        document.getElementById("mensajeNuevoDueno").textContent = "";

        const nombre = document.getElementById("nombreNuevoDueno").value.trim();
        const correo = document.getElementById("correoNuevoDueno").value.trim().toLowerCase();
        const clave = document.getElementById("claveNuevoDueno").value.trim();
        let correcto = true;

        if (nombre === "") {
            document.getElementById("errorNombreNuevoDueno").textContent = "Ingrese el nombre del usuario.";
            correcto = false;
        }
        if (correo === "") {
            document.getElementById("errorCorreoNuevoDueno").textContent = "Ingrese el correo electrónico.";
            correcto = false;
        } else if (!correoValidoAdmin(correo)) {
            document.getElementById("errorCorreoNuevoDueno").textContent = "Ingrese un correo válido.";
            correcto = false;
        }
        if (clave === "") {
            document.getElementById("errorClaveNuevoDueno").textContent = "Ingrese una contraseña.";
            correcto = false;
        }

        if (!correcto) return;

        const usuarios = obtenerDatos(CLAVE_USUARIOS);
        if (usuarios.some(u => u.correo.toLowerCase() === correo)) {
            document.getElementById("errorCorreoNuevoDueno").textContent = "Este correo ya está registrado.";
            return;
        }

        usuarios.push({
            id: "u" + Date.now(),
            nombre: nombre,
            correo: correo,
            clave: clave,
            tipo: "dueno"
        });

        guardarDatos(CLAVE_USUARIOS, usuarios);
        document.getElementById("mensajeNuevoDueno").textContent = "Usuario dueño creado correctamente.";
        formularioNuevoDueno.reset();
        mostrarDuenosAdmin();
    });
}

// Crear clientes
function limpiarErroresNuevoCliente() {
    ["errorNombreNuevoCliente", "errorCorreoNuevoCliente", "errorClaveNuevoCliente"].forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.textContent = "";
    });
}

const formularioNuevoCliente = document.getElementById("formNuevoCliente");
if (formularioNuevoCliente) {
    formularioNuevoCliente.addEventListener("submit", function (evento) {
        evento.preventDefault();
        limpiarErroresNuevoCliente();
        document.getElementById("mensajeNuevoCliente").textContent = "";

        const nombre = document.getElementById("nombreNuevoCliente").value.trim();
        const correo = document.getElementById("correoNuevoCliente").value.trim().toLowerCase();
        const clave = document.getElementById("claveNuevoCliente").value.trim();
        let correcto = true;

        if (nombre === "") {
            document.getElementById("errorNombreNuevoCliente").textContent = "Ingrese el nombre del cliente.";
            correcto = false;
        }
        if (correo === "") {
            document.getElementById("errorCorreoNuevoCliente").textContent = "Ingrese el correo electrónico.";
            correcto = false;
        } else if (!correoValidoAdmin(correo)) {
            document.getElementById("errorCorreoNuevoCliente").textContent = "Ingrese un correo válido.";
            correcto = false;
        }
        if (clave === "") {
            document.getElementById("errorClaveNuevoCliente").textContent = "Ingrese una contraseña.";
            correcto = false;
        }

        if (!correcto) return;

        const usuarios = obtenerDatos(CLAVE_USUARIOS);
        if (usuarios.some(u => u.correo.toLowerCase() === correo)) {
            document.getElementById("errorCorreoNuevoCliente").textContent = "Este correo ya está registrado.";
            return;
        }

        usuarios.push({
            id: "c" + Date.now(),
            nombre: nombre,
            correo: correo,
            clave: clave,
            tipo: "cliente"
        });

        guardarDatos(CLAVE_USUARIOS, usuarios);
        document.getElementById("mensajeNuevoCliente").textContent = "Cliente creado correctamente.";
        formularioNuevoCliente.reset();
        mostrarClientesAdmin();
    });
}

function mostrarDuenosAdmin() {
    const cuerpo = document.getElementById("tablaDuenos");
    if (!cuerpo || !protegerPagina("admin")) return;

    cuerpo.innerHTML = "";
    const duenos = obtenerDatos(CLAVE_USUARIOS).filter(u => u.tipo === "dueno");

    if (duenos.length === 0) {
        cuerpo.innerHTML = '<tr><td colspan="3">No hay usuarios dueños registrados.</td></tr>';
        return;
    }

    duenos.forEach(usuario => {
        cuerpo.innerHTML += `
            <tr>
                <td>${usuario.nombre}</td>
                <td>${usuario.correo}</td>
                <td><button class="boton-rojo" onclick="eliminarDueno('${usuario.id}')">Eliminar</button></td>
            </tr>
        `;
    });
}

function mostrarClientesAdmin() {
    const cuerpo = document.getElementById("tablaClientes");
    if (!cuerpo || !protegerPagina("admin")) return;

    cuerpo.innerHTML = "";
    const clientes = obtenerDatos(CLAVE_USUARIOS).filter(u => u.tipo === "cliente");

    if (clientes.length === 0) {
        cuerpo.innerHTML = '<tr><td colspan="3">No hay clientes registrados.</td></tr>';
        return;
    }

    clientes.forEach(cliente => {
        cuerpo.innerHTML += `
            <tr>
                <td>${cliente.nombre}</td>
                <td>${cliente.correo}</td>
                <td><button class="boton-rojo" onclick="eliminarCliente('${cliente.id}')">Eliminar</button></td>
            </tr>
        `;
    });
}

function eliminarDueno(id) {
    if (!confirm("¿Desea eliminar este usuario dueño? Sus canchas y las reservas de esas canchas también se eliminarán.")) return;

    const canchas = obtenerDatos(CLAVE_CANCHAS);
    const idsCanchas = canchas.filter(c => c.duenoId === id).map(c => c.id);
    const nuevasCanchas = canchas.filter(c => c.duenoId !== id);
    const nuevasReservas = obtenerDatos(CLAVE_RESERVAS).filter(r => !idsCanchas.includes(r.canchaId));
    const nuevosUsuarios = obtenerDatos(CLAVE_USUARIOS).filter(u => u.id !== id);

    guardarDatos(CLAVE_USUARIOS, nuevosUsuarios);
    guardarDatos(CLAVE_CANCHAS, nuevasCanchas);
    guardarDatos(CLAVE_RESERVAS, nuevasReservas);
    mostrarDuenosAdmin();
}

function eliminarCliente(id) {
    if (!confirm("¿Desea eliminar este cliente? Sus reservas también se eliminarán.")) return;

    const nuevosUsuarios = obtenerDatos(CLAVE_USUARIOS).filter(u => u.id !== id);
    const nuevasReservas = obtenerDatos(CLAVE_RESERVAS).filter(r => r.clienteId !== id);

    guardarDatos(CLAVE_USUARIOS, nuevosUsuarios);
    guardarDatos(CLAVE_RESERVAS, nuevasReservas);
    mostrarClientesAdmin();
}

panelAdmin();
cargarDuenosEnFormulario();
mostrarCanchasAdmin();
mostrarReservasAdmin();
mostrarDuenosAdmin();
mostrarClientesAdmin();
