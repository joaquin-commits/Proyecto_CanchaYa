// Registro e inicio de sesión
function correoValido(correo) {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo);
}

function limpiarErrores() {
    document.querySelectorAll(".error").forEach(e => e.textContent = "");
}

const formularioLogin = document.getElementById("formLogin");
if (formularioLogin) {
    formularioLogin.addEventListener("submit", function (evento) {
        evento.preventDefault();
        limpiarErrores();

        const correo = document.getElementById("correo").value.trim().toLowerCase();
        const clave = document.getElementById("clave").value.trim();
        let correcto = true;

        if (correo === "") {
            document.getElementById("errorCorreo").textContent = "Ingrese su correo electrónico.";
            correcto = false;
        } else if (!correoValido(correo)) {
            document.getElementById("errorCorreo").textContent = "Ingrese un correo válido.";
            correcto = false;
        }

        if (clave === "") {
            document.getElementById("errorClave").textContent = "Ingrese su contraseña.";
            correcto = false;
        }

        if (!correcto) return;

        const usuarios = obtenerDatos(CLAVE_USUARIOS);
        const usuario = usuarios.find(u => u.correo.toLowerCase() === correo && u.clave === clave);

        if (!usuario) {
            document.getElementById("errorLogin").textContent = "Correo o contraseña incorrectos.";
            return;
        }

        localStorage.setItem(CLAVE_SESION, JSON.stringify({ id: usuario.id, nombre: usuario.nombre, tipo: usuario.tipo }));

        if (usuario.tipo === "cliente") window.location.href = "cliente.html";
        if (usuario.tipo === "dueno") window.location.href = "dueno.html";
        if (usuario.tipo === "admin") window.location.href = "admin.html";
    });
}

const formularioRegistro = document.getElementById("formRegistro");
if (formularioRegistro) {
    formularioRegistro.addEventListener("submit", function (evento) {
        evento.preventDefault();
        limpiarErrores();

        const nombre = document.getElementById("nombre").value.trim();
        const correo = document.getElementById("correo").value.trim().toLowerCase();
        const clave = document.getElementById("clave").value.trim();
        const tipo = document.getElementById("tipo").value;
        let correcto = true;

        if (nombre === "") {
            document.getElementById("errorNombre").textContent = "Ingrese su nombre.";
            correcto = false;
        }
        if (correo === "") {
            document.getElementById("errorCorreo").textContent = "Ingrese su correo electrónico.";
            correcto = false;
        } else if (!correoValido(correo)) {
            document.getElementById("errorCorreo").textContent = "Ingrese un correo válido.";
            correcto = false;
        }
        if (clave === "") {
            document.getElementById("errorClave").textContent = "Ingrese una contraseña.";
            correcto = false;
        }
        if (tipo === "") {
            document.getElementById("errorTipo").textContent = "Seleccione un tipo de perfil.";
            correcto = false;
        }

        if (!correcto) return;

        const usuarios = obtenerDatos(CLAVE_USUARIOS);
        if (usuarios.some(u => u.correo.toLowerCase() === correo)) {
            document.getElementById("errorCorreo").textContent = "Este correo ya está registrado.";
            return;
        }

        usuarios.push({
            id: "u" + Date.now(),
            nombre: nombre,
            correo: correo,
            clave: clave,
            tipo: tipo
        });
        guardarDatos(CLAVE_USUARIOS, usuarios);
        document.getElementById("mensajeRegistro").textContent = "Registro realizado. Ahora puede iniciar sesión.";
        formularioRegistro.reset();
    });
}
