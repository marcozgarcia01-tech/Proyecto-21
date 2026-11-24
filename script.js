const reloj = document.getElementById('reloj');
const sesionActual = document.getElementById('sesionActual');
const contador = document.getElementById('contador');
const puntos = document.getElementById('puntos');
const botonIniciar = document.getElementById('iniciar');
const botonReiniciar = document.getElementById('reiniciar');
const botonesTipo = document.querySelectorAll('.tipo');

const inputTrabajo = document.getElementById('minTrabajo');
const inputCorto = document.getElementById('minCorto');
const inputLargo = document.getElementById('minLargo');
const botonGuardar = document.getElementById('guardar');

let tiempos = { trabajo: 25, corto: 5, largo: 15 };
let tipo = 'trabajo';
let segundosRestantes = tiempos.trabajo * 60;
let sesionesCompletadas = 0;
let intervalo = null;
let ejecutando = false;

function mostrarTiempo() {
  const minutos = Math.floor(segundosRestantes / 60);
  const segundos = segundosRestantes % 60;
  reloj.textContent = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
  document.title = `${reloj.textContent} - Pomodoro`;
}

function actualizarVista() {
  const nombres = {
    trabajo: 'Sesión de trabajo',
    corto: 'Descanso corto',
    largo: 'Descanso largo'
  };
  sesionActual.textContent = nombres[tipo];
  botonesTipo.forEach(boton => {
    boton.classList.toggle('activo', boton.dataset.tipo === tipo);
    boton.setAttribute('aria-pressed', boton.dataset.tipo === tipo ? 'true' : 'false');
  });
  contador.textContent = sesionesCompletadas;
  puntos.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    const punto = document.createElement('span');
    punto.className = 'punto' + (i < sesionesCompletadas % 4 ? ' lleno' : '');
    puntos.appendChild(punto);
  }
  mostrarTiempo();
}

function detener() {
  clearInterval(intervalo);
  intervalo = null;
  ejecutando = false;
  botonIniciar.textContent = 'Iniciar';
}

function sonidoFin() {
  // Sonido sencillo generado con el navegador (no necesita archivo de audio).
  try {
    const audio = new AudioContext();
    const oscilador = audio.createOscillator();
    const volumen = audio.createGain();
    oscilador.connect(volumen);
    volumen.connect(audio.destination);
    oscilador.frequency.value = 880;
    volumen.gain.value = 0.15;
    oscilador.start();
    oscilador.stop(audio.currentTime + 0.35);
    oscilador.onended = () => audio.close();
  } catch (error) {
    console.log('No se pudo reproducir el sonido', error);
  }
}

function seleccionarTipo(nuevoTipo) {
  detener();
  tipo = nuevoTipo;
  segundosRestantes = tiempos[tipo] * 60;
  actualizarVista();
}

function terminarSesion() {
  detener();
  sonidoFin();

  if (tipo === 'trabajo') {
    sesionesCompletadas++;
    if (sesionesCompletadas % 4 === 0) {
      seleccionarTipo('largo');
    } else {
      seleccionarTipo('corto');
    }
  } else {
    seleccionarTipo('trabajo');
  }
}

function iniciar() {
  if (ejecutando) {
    detener();
    return;
  }
  ejecutando = true;
  botonIniciar.textContent = 'Pausar';
  intervalo = setInterval(() => {
    segundosRestantes--;
    mostrarTiempo();
    if (segundosRestantes <= 0) {
      terminarSesion();
    }
  }, 1000);
}

botonIniciar.addEventListener('click', iniciar);
botonReiniciar.addEventListener('click', () => {
  detener();
  segundosRestantes = tiempos[tipo] * 60;
  actualizarVista();
});

botonesTipo.forEach(boton => {
  boton.addEventListener('click', () => seleccionarTipo(boton.dataset.tipo));
});

botonGuardar.addEventListener('click', () => {
  const trabajo = Number(inputTrabajo.value);
  const corto = Number(inputCorto.value);
  const largo = Number(inputLargo.value);
  if ([trabajo, corto, largo].some(valor => !Number.isFinite(valor) || valor < 1)) {
    alert('Ingresa tiempos válidos, mayores que cero.');
    return;
  }
  tiempos = { trabajo, corto, largo };
  detener();
  segundosRestantes = tiempos[tipo] * 60;
  actualizarVista();
  alert('¡Tiempos guardados!');
});

actualizarVista();
