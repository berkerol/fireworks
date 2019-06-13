/* global performance FPSMeter */
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const getTime = typeof performance === 'function' ? performance.now : Date.now;
const FRAME_DURATION = 1000 / 58;
let then = getTime();
let acc = 0;
FPSMeter.theme.colorful.container.height = '40px';
const meter = new FPSMeter({
  left: canvas.width - 130 + 'px',
  top: 'auto',
  bottom: '12px',
  theme: 'colorful',
  heat: 1,
  graph: 1
});

let random = true;

const firework = {
  explosionAlpha: 0.6,
  lineCap: 'round',
  lineWidth: 2,
  highestAlphaDecrease1: 0.025,
  highestAlphaDecrease2: 0.015,
  highestDegree: 16,
  highestSpeed: 1.6,
  highestSpeedDecrease: 0.015,
  highestStep: 0.3,
  lowestAlphaDecrease1: 0.015,
  lowestAlphaDecrease2: 0.005,
  lowestDegree: 12,
  lowestSpeed: 1.2,
  lowestSpeedDecrease: 0.005,
  lowestStep: 0.1,
  radius: 2
};

const rocket = {
  color: 16,
  colors: [[255, 30, 40], [255, 150, 20], [255, 220, 0], [0, 255, 100], [100, 255, 20], [50, 200, 200], [120, 220, 255], [80, 180, 255], [220, 120, 255], [255, 100, 150], [240, 20, 200], [140, 140, 140], [170, 170, 170], [200, 200, 200], [255, 0, 0], [0, 0, 0]],
  lineCap: 'round',
  lineWidth: 3,
  shadowBlur: 20,
  highestLength: 30,
  highestSpeed: 10,
  lowestLength: 20,
  lowestSpeed: 6,
  probability: 0.05,
  speed: 8
};

const fireworks = [];
const rockets = [];

draw();
document.querySelectorAll('.dropdown-item').forEach(e => {
  e.addEventListener('click', function () {
    document.getElementById('change-color-text').innerText = this.innerText;
    rocket.color = +this.dataset.value;
    if (rocket.color === rocket.colors.length - 1) {
      rocket.colors[rocket.colors.length - 1] = rocket.colors[Math.floor(Math.random() * (rocket.colors.length - 2))];
    }
  });
});
document.getElementById('customColor').addEventListener('change', function () {
  rocket.colors[rocket.colors.length - 2] = this.value.match(/[A-Za-z0-9]{2}/g).map(v => parseInt(v, 16));
});
document.addEventListener('mousedown', mouseDownHandler);
window.addEventListener('resize', resizeHandler);

function draw () {
  const now = getTime();
  let ms = now - then;
  let frames = 0;
  then = now;
  if (ms < 1000) {
    acc += ms;
    while (acc >= FRAME_DURATION) {
      frames++;
      acc -= FRAME_DURATION;
    }
  } else {
    ms = 0;
  }
  meter.tick();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.shadowBlur = rocket.shadowBlur;
  ctx.lineCap = firework.lineCap;
  ctx.lineWidth = firework.lineWidth;
  for (const f of fireworks) {
    drawFirework(f);
  }
  ctx.lineCap = rocket.lineCap;
  ctx.lineWidth = rocket.lineWidth;
  for (const r of rockets) {
    drawRocket(r);
  }
  if (random && Math.random() < rocket.probability) {
    createRocket(Math.random() * canvas.width, Math.random() * canvas.height);
  }
  removeFireworks(frames);
  removeRockets(frames);
  window.requestAnimationFrame(draw);
}

function drawFirework (f) {
  if (f.alpha1 > 0) {
    const color1 = `rgba(${f.color[0]}, ${f.color[1]}, ${f.color[2]}, ${f.alpha1})`;
    ctx.shadowColor = color1;
    ctx.strokeStyle = color1;
    ctx.beginPath();
    for (const degree of f.degrees) {
      const angle = degree * Math.PI / 180;
      const x = f.length * Math.cos(angle);
      const y = f.length * Math.sin(angle);
      ctx.moveTo(f.x, f.y);
      ctx.lineTo(f.x + x, f.y + y);
    }
    ctx.stroke();
  }
  if (f.alpha2 > 0) {
    const color2 = `rgba(${f.color[0]}, ${f.color[1]}, ${f.color[2]}, ${f.alpha2})`;
    ctx.shadowColor = color2;
    ctx.fillStyle = color2;
    ctx.beginPath();
    for (const step of f.steps) {
      for (const degree of f.degrees) {
        const angle = degree * Math.PI / 180;
        const x = f.length * Math.cos(angle) * step;
        const y = f.length * Math.sin(angle) * step;
        ctx.arc(f.x, f.y, firework.radius, 0, 2 * Math.PI);
        ctx.arc(f.x + x, f.y + y, firework.radius, 0, 2 * Math.PI);
      }
    }
    ctx.fill();
  }
}

function drawRocket (r) {
  ctx.shadowColor = r.color;
  ctx.strokeStyle = r.color;
  ctx.beginPath();
  ctx.moveTo(r.x, r.y);
  ctx.lineTo(r.x + r.speedX / rocket.speed * r.length, r.y + r.speedY / rocket.speed * r.length);
  ctx.stroke();
}

function removeFireworks (frames) {
  for (let i = fireworks.length - 1; i >= 0; i--) {
    const f = fireworks[i];
    f.length += f.speed * frames;
    if (f.speed > f.speedDecrease * frames) {
      f.speed -= f.speedDecrease * frames;
    } else {
      f.speed = 0;
    }
    if (f.alpha1 > f.alphaDecrease1 * frames) {
      f.alpha1 -= f.alphaDecrease1 * frames;
    } else {
      f.alpha1 = 0;
    }
    if (f.alpha1 < firework.explosionAlpha) {
      if (f.alpha2 === -1) {
        f.alpha2 = 1;
      } else if (f.alpha2 > f.alphaDecrease2 * frames) {
        f.alpha2 -= f.alphaDecrease2 * frames;
      } else {
        fireworks.splice(i, 1);
      }
    }
  }
}

function removeRockets (frames) {
  for (let i = rockets.length - 1; i >= 0; i--) {
    const r = rockets[i];
    if (Math.abs(r.speedX) < 0.5 && Math.abs(r.speedY) < 0.5) {
      rockets.splice(i, 1);
      createFirework(r.x, r.y, r.colorFirework);
    } else {
      r.x += r.speedX * frames;
      r.y += r.speedY * frames;
      r.speedX -= r.speedDecreaseX * frames;
      r.speedY -= r.speedDecreaseY * frames;
    }
  }
}

function createFirework (x, y, color) {
  const degrees = [];
  let degree = 0;
  while (degree < 360) {
    degrees.push(degree);
    degree += Math.floor(firework.lowestDegree + Math.random() * (firework.highestDegree - firework.lowestDegree));
  }
  const steps = [];
  let step = 1.0;
  while (step > 0.0) {
    steps.push(step);
    step -= firework.lowestStep + Math.random() * (firework.highestStep - firework.lowestStep);
  }
  fireworks.push({
    x,
    y,
    color,
    alpha1: 1,
    alpha2: -1,
    alphaDecrease1: firework.lowestAlphaDecrease1 + Math.random() * (firework.highestAlphaDecrease1 - firework.lowestAlphaDecrease1),
    alphaDecrease2: firework.lowestAlphaDecrease2 + Math.random() * (firework.highestAlphaDecrease2 - firework.lowestAlphaDecrease2),
    degrees,
    length: 0,
    speed: firework.lowestSpeed + Math.random() * (firework.highestSpeed - firework.lowestSpeed),
    speedDecrease: firework.lowestSpeedDecrease + Math.random() * (firework.highestSpeedDecrease - firework.lowestSpeedDecrease),
    steps
  });
}

function createRocket (x, y) {
  x -= canvas.width / 2;
  y -= canvas.height;
  const norm = Math.sqrt(x ** 2 + y ** 2);
  const speed = rocket.lowestSpeed + Math.random() * (rocket.highestSpeed - rocket.lowestSpeed);
  const speedX = x / norm * speed;
  const speedY = y / norm * speed;
  let color;
  if (rocket.color === rocket.colors.length) {
    color = rocket.colors[Math.floor(Math.random() * (rocket.colors.length - 2))];
  } else {
    color = rocket.colors[rocket.color];
  }
  rockets.push({
    x: canvas.width / 2,
    y: canvas.height,
    color: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
    colorFirework: color,
    length: rocket.lowestLength + Math.random() * (rocket.highestLength - rocket.lowestLength),
    speedX,
    speedY,
    speedDecreaseX: speedX ** 2 / (2 * x),
    speedDecreaseY: speedY ** 2 / (2 * y)
  });
}

window.changeRandom = function () {
  random = !random;
  if (random) {
    document.getElementById('change-random').innerHTML = 'On';
  } else {
    document.getElementById('change-random').innerHTML = 'Off';
  }
};

function mouseDownHandler (e) {
  createRocket(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
}

function resizeHandler () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
