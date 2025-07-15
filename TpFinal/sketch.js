/* para que respondiera bien a mi mic:
cambie los valores de VolMin 
agregué VolMax y lo voy cambiando segun se necesite
puse cosas como userStartAudio()
y mic.getLevel() en el draw

cami */

let mic, amplitude, fft;
let micReady = false;

// VARIABLES DE CALIBRACIÓN DEL MICRÓFONO
let volMin = 0.02; 
let volMax = 0.07; 
let freqMin = 200; // graves
let freqMax = 350; // agudos

let Dibujos = [];
let duracionDibujo = 10000;

let sonidoActivo = false;
let sonidoActivoDesde = null;
let dibujosActuales = [];

function preload() {
  cargarImagenes(); // desde gestor.js
}

function setup() {
  createCanvas(fondo.width, fondo.height);
  imageMode(CENTER);

  audioContext = getAudioContext();
  mic = new p5.AudioIn();
  mic.start(() => {
    mic.connect();
    amplitude = new p5.Amplitude();
    amplitude.setInput(mic);
    fft = new p5.FFT();
    fft.setInput(mic);
    micReady = true;
  }, (err) => {
    console.error("❌ Error al activar el micrófono:", err);
  });
  userStartAudio();
}

function draw() {
  if (!micReady || !amplitude) {
    background(200);
    fill(0);
    text("Esperando al micrófono...", 20, 30);
    return;
  }

  background(230, 244, 254);
  image(fondo, width / 2, height / 2);

  let ahora = millis();
  let level = amplitude.getLevel(); // LEVEL ES AMPLITUD DEL MICRÓFONO

  mic.getLevel(); // Actualizar el nivel del micrófono

  // Mantener solo dibujos vivos y dibujarlos
  Dibujos = Dibujos.filter(d => d.estaVivo());
  for (const d of Dibujos) {
    d.dibujar();
  }

  // Mostrar info de audio
  fill(255);
  textSize(16);
  textAlign(LEFT, TOP);
  text(`🎚 Volumen: ${nf(level, 1, 3)}`, 20, 20);

  const freq = obtenerFrecuenciaDominante();
  const tipoSonido = freq < 400 ? "Grave" : "Agudo";
  text(`🎵 Frecuencia: ${nf(freq, 1, 2)} Hz (${tipoSonido})`, 20, 40);

  if (level > volMin && level < volMax) {
    if (!sonidoActivo) {
      sonidoActivo = true;
      sonidoActivoDesde = ahora;
      dibujosActuales = agregarDibujos(level);
    }
    if (ahora - sonidoActivoDesde > 1200) {
      for (const d of dibujosActuales) {
        d.incrementarRotacion();
      }
    }
  } else {
    if (sonidoActivo) {
      for (const d of dibujosActuales) {
        if (d.esProlongado) d.comenzarCountdown();
      }
    }
    sonidoActivo = false;
    sonidoActivoDesde = null;
  }
}