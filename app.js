// Datos básicos del proyecto
const CLAVE_USUARIOS = "rc_usuarios";
const CLAVE_CANCHAS = "rc_canchas";
const CLAVE_RESERVAS = "rc_reservas";
const CLAVE_SESION = "rc_sesion";

function obtenerDatos(clave) {
    return JSON.parse(localStorage.getItem(clave)) || [];
}

function guardarDatos(clave, datos) {
    localStorage.setItem(clave, JSON.stringify(datos));
}

function iniciarDatos() {
    if (!localStorage.getItem(CLAVE_USUARIOS)) {
        guardarDatos(CLAVE_USUARIOS, [
            { id: "u1", nombre: "Dueño 1", correo: "dueno1@canchas.cl", clave: "1234", tipo: "dueno" },
            { id: "u2", nombre: "Dueño 2", correo: "dueno2@canchas.cl", clave: "1234", tipo: "dueno" },
            { id: "c1", nombre: "Cliente 1", correo: "cliente1@canchas.cl", clave: "1234", tipo: "cliente" },
            { id: "a1", nombre: "Administrador", correo: "admin@canchas.cl", clave: "admin123", tipo: "admin" }
        ]);
    }

    if (!localStorage.getItem(CLAVE_CANCHAS)) {
        guardarDatos(CLAVE_CANCHAS, [
            {
                id: "ca1", duenoId: "u1", nombre: "Cancha Central", tipo: "Fútbol",
                ubicacion: "Santiago Centro", valor: 25000, disponible: true,
                horarios: ["17:00", "18:00", "19:00", "20:00"], imagen: "img/cancha-futbol.svg"
            },
            {
                id: "ca2", duenoId: "u1", nombre: "Cancha Norte", tipo: "Pádel",
                ubicacion: "Independencia", valor: 18000, disponible: true,
                horarios: ["16:00", "17:00", "18:00", "19:00"], imagen: "img/cancha-padel.svg"
            },
            {
                id: "ca3", duenoId: "u2", nombre: "Cancha Sur", tipo: "Multiuso",
                ubicacion: "San Miguel", valor: 20000, disponible: true,
                horarios: ["18:00", "19:00", "20:00", "21:00"], imagen: "img/cancha-multiuso.svg"
            }
        ]);
    }

    if (!localStorage.getItem(CLAVE_RESERVAS)) {
        guardarDatos(CLAVE_RESERVAS, [
            {
                id: "r1", clienteId: "c1", canchaId: "ca1", fecha: "2026-10-10",
                horario: "18:00", valor: 25000, estado: "Confirmada", pago: "Pagada"
            }
        ]);
    }
}

function obtenerSesion() {
    return JSON.parse(localStorage.getItem(CLAVE_SESION));
}

function cerrarSesion() {
    localStorage.removeItem(CLAVE_SESION);
    window.location.href = "login.html";
}

function protegerPagina(tipo) {
    const sesion = obtenerSesion();
    if (!sesion || sesion.tipo !== tipo) {
        window.location.href = "login.html";
        return false;
    }
    return true;
}

function nombreUsuario(id) {
    const usuario = obtenerDatos(CLAVE_USUARIOS).find(u => u.id === id);
    return usuario ? usuario.nombre : "Sin usuario";
}

function nombreCancha(id) {
    const cancha = obtenerDatos(CLAVE_CANCHAS).find(c => c.id === id);
    return cancha ? cancha.nombre : "Cancha no disponible";
}

function formatoDinero(valor) {
    return "$" + Number(valor).toLocaleString("es-CL");
}

function conectarBotonSalir() {
    const boton = document.getElementById("btnSalir");
    if (boton) boton.addEventListener("click", cerrarSesion);
}

iniciarDatos();
document.addEventListener("DOMContentLoaded", conectarBotonSalir);
