let paso=1;
const pasoInicial = 1;
const pasoFinal = 3

const cita = {
    id: '',
    nombre: '',
    fecha : '',
    hora: '',
    servicios: [],
}

document.addEventListener('DOMContentLoaded', function() {
    iniciarApp();
});


function iniciarApp() {
    mostarSeccion(); //Muestra y Oculta las secciones
    tabs(); //CAMBIA LA SECCIÓN CUANDO SE PRESIONES LOS TABS
    botonesPaginador(); // AGREGA O QUITA LOS BOTONES DEL PAGINADOR
    paginaSiguiente();
    paginaAnterior();

    consultarAPI() ; //CONSULTA LA API EN EL BACKEND DE PHP

    idCliente();
    nombreCliente(); // AÑADE EL NOMBRE DEL CLIENTE AL OBJETO DE CITA
    seleccionarFecha(); //AÑADE LA FECHA DE LA CITA EN EL OBJETO
    seleccionarHora(); //AÑADE LA HORA DE LA CITA EN EL OBEJTO

    mostrarResumen(); //Muestra el resumen de la cita
}

function mostarSeccion() {

    //OCULTAR LA SECCION QUE TENGA LA CLASE DE MOSTRAR
    const seccionAnterior = document.querySelector('.mostrar');
    if (seccionAnterior){
        seccionAnterior.classList.remove('mostrar');
    }

    //SELECCIONAR LA SECCION CON EL PASO
    const pasoSelector = `#paso-${paso}`
    const seccion = document.querySelector(pasoSelector);
    seccion.classList.add('mostrar');

    // QUITA LA CLASE DE ACTUAL AL TAB ANTERIOR
    const tabAnterior = document.querySelector('.actual');
    if (tabAnterior){
        tabAnterior.classList.remove('actual');
    }

    // RESALTA EL TAB ACTUAL
    const tabActual = document.querySelector(`[data-paso="${paso}"]`);
    tabActual.classList.add('actual');
}

function tabs() {
    const botones = document.querySelectorAll('.tabs button');
    
    botones.forEach((boton) => {
        boton.addEventListener('click', function(e) {
            paso = parseInt(e.target.dataset.paso);
            mostarSeccion();
            botonesPaginador();

        })
    })
}

function botonesPaginador() {
    const paginaAnterior = document.querySelector('#anterior');
    const paginaSiguiente = document.querySelector('#siguiente');

    if(paso === 1) {
        paginaAnterior.classList.add('ocultar');
        paginaSiguiente.classList.remove('ocultar') ;
    } else if(paso === 3){
        paginaAnterior.classList.remove('ocultar') ;
        paginaSiguiente.classList.add('ocultar') ;
        mostrarResumen();
    } else {
        paginaAnterior.classList.remove('ocultar') ;
        paginaSiguiente.classList.remove('ocultar') ;

    } 
    mostarSeccion();
}

function paginaAnterior(){
    const paginaAnterior = document.querySelector('#anterior');
    paginaAnterior.addEventListener('click', function() {
        if(paso <= pasoInicial) return;
        paso--;
        botonesPaginador();
    })
}
function paginaSiguiente(){
    const paginaSiguiente = document.querySelector('#siguiente');
    paginaSiguiente.addEventListener('click', function() {
        if(paso >= pasoFinal) return;
        paso++;
        botonesPaginador();
    })
}

async function consultarAPI() {
    try {
        const url = `/api/servicios`;
        const resultado = await fetch(url);
        const servicios = await resultado.json();
        mostrarServicios(servicios);
    } catch (error) {
        alert(error);
    }
}

function mostrarServicios(servicios) {
    servicios.forEach(servicio => {
        const {id, nombre, precio} = servicio;

        const nombreServicio = document.createElement('P');
        nombreServicio.classList.add('nombre-servicio');
        nombreServicio.textContent = nombre;

        const precioServicio = document.createElement('P');
        precioServicio.classList.add('precio-servicio');
        precioServicio.textContent = `$${precio}` ;

        const servicioDiv = document.createElement('DIV');
        servicioDiv.classList.add('servicio');
        servicioDiv.dataset.idServicio = id;
        servicioDiv.onclick = function() {
            seleccionarServicio(servicio);
        }

        servicioDiv.appendChild(nombreServicio);
        servicioDiv.appendChild(precioServicio);

        document.querySelector('#servicios').appendChild(servicioDiv);

    })
}

function seleccionarServicio(servicio) {
    const { id } = servicio;
    const { servicios } = cita
    //IDENTIFICAR EL ELEMENTO AL QUE SE LE DA CLICK
    const divServicio = document.querySelector(`[data-id-servicio = "${id}"`);
    //COMPROBAR SI UN SERVICIO YA FUE AGREGADO
    if(servicios.some(agregado => agregado.id === id)){
        //ELIMINARLO
        cita.servicios = servicios.filter( agregado => agregado.id !== id );
        divServicio.classList.remove('seleccionado');
    } else {
        //AGREGARLO
        cita.servicios = [...servicios, servicio];
        divServicio.classList.add('seleccionado');
    
    }
    

    
}

function idCliente() {
    cita.id = document.querySelector('#id').value;
}

function nombreCliente() {
    cita.nombre = document.querySelector('#nombre').value;
}

function seleccionarFecha(){
    const inputFecha = document.querySelector('#fecha');
    inputFecha.addEventListener('input', function(e) {
        const dia = new Date(e.target.value).getUTCDay();
        
        if([6,0].includes(dia)){
            e.target.value = '';
            mostrarAlerta('Fines de Semana No Permitidios', 'error', '.formulario');
        } else {
            cita.fecha=inputFecha.value;
        }
    })
}

function seleccionarHora(){
    const inputHora = document.querySelector('#hora');
    inputHora.addEventListener('input', function(e) {
        const horaCita = e.target.value;
        const hora = horaCita.split(":");
        if(hora[0]<10 || hora[0]>18){
            e.target.value = '';
            mostrarAlerta('Horario no válido, abierto únicamente de 10 a 18 hrs', 'error', '.formulario');
        }else {
            cita.hora = e.target.value;
        }
    })
}


function mostrarResumen(){
    const resumen = document.querySelector('.contenido-resumen');

    //LIMPIAR EL CONTENIDO DE RESUMEN
    while(resumen.firstChild){
        resumen.removeChild(resumen.firstChild);
    }

    if (Object.values(cita).includes('') || cita.servicios.length === 0){
        mostrarAlerta('Hacen Falta Datos o Servicios', 'error', '.contenido-resumen', false);
        return;
    }

    // FORMATEAR EL DIV DE RESUMEN
    const { nombre, fecha, hora, servicios } = cita;


    // HEADING SERVICIOS EN RESUMEN
    const headingServicio = document.createElement('H3');
    headingServicio.textContent ='Resumen de Servicios';

    resumen.appendChild(headingServicio)
    //ITERANDO Y MOSTRANDO LOS SERVICIO
    servicios.forEach(servicio => {
        const {id, nombre, precio} = servicio;

        const contenedorServicio = document.createElement('DIV')
        contenedorServicio.classList.add('contenedor-servicio');

        const textoServicio = document.createElement('P');
        textoServicio.textContent = nombre;

        const precioServicio = document.createElement('P')
        precioServicio.innerHTML = `<span>Precio: </span> $${precio}`

        contenedorServicio.appendChild(textoServicio)
        contenedorServicio.appendChild(precioServicio)

        resumen.appendChild(contenedorServicio);
    })

    // HEADING CITA EN RESUMEN
    const headingCita = document.createElement('H3');
    headingCita.textContent ='Resumen de Cita';
    resumen.appendChild(headingCita)

    const nombreCliente = document.createElement('P');
    nombreCliente.innerHTML = `<span>Nombre Cliente: </span> ${nombre}`

    //FORMATEAR LA FECHA
    const fechaObj = new Date(fecha);
    const mes = fechaObj.getMonth();
    const dia = fechaObj.getDate() + 2;
    const year = fechaObj.getFullYear();

    const fechaUTC = new Date(Date.UTC(year, mes, dia))

    const opciones = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}
    const fechaFormateada = fechaUTC.toLocaleDateString('es-MX', opciones);

    const fechaCita = document.createElement('P');
    fechaCita.innerHTML = `<span>Fecha: </span> ${fechaFormateada}`


    const horaCita = document.createElement('P');
    horaCita.innerHTML = `<span>Hora: </span> ${hora} Horas`

    //BOTON PARA CREAR UNA CITA
    const botonReservar = document.createElement('BUTTON');
    botonReservar.classList.add('boton');
    botonReservar.textContent = 'Reservar Cita';
    botonReservar.onclick = reservarCita;

    resumen.appendChild(nombreCliente);
    resumen.appendChild(fechaCita);
    resumen.appendChild(horaCita);
    
    resumen.appendChild(botonReservar)
    

}

function mostrarAlerta(mensaje, tipo, elemento, desapaerce = true) {

    // PREVIENE QUE SE GENERE MÁS DE UNA ALERTA
    const alertaPrevia = document.querySelector('.alerta')
    if(alertaPrevia) {
        alertaPrevia.remove();
    }

    //SCRIPTING PARA CREAR LA ALERTA
    const alerta = document.createElement('DIV');
    alerta.textContent = mensaje;
    alerta.classList.add('alerta');
    alerta.classList.add(tipo);

    const formulario = document.querySelector(elemento);
    formulario.appendChild(alerta);

    // ELIMINAR LA ALERTA
    if(desapaerce){
        setTimeout(() => {
            alerta.remove();
        }, 3000)
    }
}

async function reservarCita(){
    const { nombre, fecha, hora, servicios, id} = cita;
    const idServicio = servicios.map(servicio => servicio.id)


    const datos = new FormData();
    datos.append('fecha', fecha)
    datos.append('hora', hora)
    datos.append('usuarioId', id)
    datos.append('servicios', idServicio)

    try {
        //PETICION HACIA LA API
        const url = `/api/citas`

        const respuesta = await fetch(url, {
            method:"POST",
            body: datos
        });

        const resultado = await respuesta.json();

        if(resultado.resultado){
            Swal.fire({
                icon: 'success',
                title: 'Cita Creada...',
                text: 'Tu cita fue creada Correctamente!',
                button: 'OK'
            }).then(() => {
                window.location.reload();
            })
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un error al guardar la cita!',
            button: 'OK'
          })
    }
    
}