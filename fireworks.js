/* global performance FPSMeter */
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const getTime = typeof performance === 'function' ? performance.now : Date.now;
const FRAME_THRESHOLD = 300;
const FRAME_DURATION = 1000 / 58;
let then = getTime();
let acc = 0;
let animation;
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
  lineWidth: 3,
  highestAlphaDecrease: 0.02,
  highestLength: 20,
  highestRadius: 100,
  highestSpeed: 3,
  lowestAlphaDecrease: 0.01,
  lowestLength: 10,
  lowestRadius: 50,
  lowestSpeed: 2,
  speed: 2.5,
  speedThreshold: 0.1
};

const rocket = {
  color: 16,
  colors: [[255, 30, 40], [255, 150, 20], [255, 220, 0], [0, 255, 100], [100, 255, 20], [50, 200, 200], [120, 220, 255], [80, 180, 255], [220, 120, 255], [255, 100, 150], [240, 20, 200], [140, 140, 140], [170, 170, 170], [200, 200, 200], [255, 0, 0], [0, 0, 0]],
  lineCap: 'round',
  lineWidth: 4,
  shadowBlur: 20,
  highestLength: 30,
  highestSpeed: 10,
  lowestLength: 20,
  lowestSpeed: 6,
  probability: 0.05,
  speed: 8,
  speedThreshold: 0.5
};

const fireworks = [];
const rockets = [];

draw();
const dropdown = document.getElementById('change-color');
const custom = document.getElementById('custom');
const colors = ['Red', 'Orange', 'Yellow', 'Lime', 'Green', 'Teal', 'Aqua', 'Blue', 'Purple', 'Pink', 'Fuchsia', 'Dark Gray', 'Light Gray', 'Silver'];
for (const i in colors) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'dropdown-item';
  button.setAttribute('data-value', i);
  button.innerHTML = colors[i];
  dropdown.insertBefore(button, custom);
  if (i === '2' || i === '5' || i === '7' || i === '10' || i === '13') {
    const div = document.createElement('div');
    div.className = 'dropdown-divider';
    dropdown.insertBefore(div, custom);
  }
}
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
document.addEventListener('keyup', keyUpHandler);
document.addEventListener('mousedown', mouseDownHandler);
window.addEventListener('resize', resizeHandler);

function draw () {
  const now = getTime();
  let ms = now - then;
  let frames = 0;
  then = now;
  if (ms < FRAME_THRESHOLD) {
    acc += ms;
    while (acc >= FRAME_DURATION) {
      frames++;
      acc -= FRAME_DURATION;
    }
  }
  meter.tick();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineCap = rocket.lineCap;
  ctx.lineWidth = firework.lineWidth;
  for (const f of fireworks) {
    for (const m of f.moving) {
      drawFirework(m, f.color);
    }
    for (const s of f.fading) {
      drawFirework(s, f.color);
    }
  }
  ctx.lineWidth = rocket.lineWidth;
  ctx.save();
  ctx.shadowBlur = rocket.shadowBlur;
  for (const r of rockets) {
    drawRocket(r);
  }
  ctx.restore();
  if (random && Math.random() < rocket.probability) {
    createRocket(Math.random() * canvas.width, Math.random() * canvas.height);
  }
  removeFireworks(frames);
  removeRockets(frames);
  animation = window.requestAnimationFrame(draw);
}

function drawFirework (f, c) {
  const color = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${f.alpha})`;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(f.x, f.y);
  ctx.lineTo(f.x + f.speedX / firework.speed * f.length, f.y + f.speedY / firework.speed * f.length);
  ctx.stroke();
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
    for (let j = fireworks[i].moving.length - 1; j >= 0; j--) {
      const f = fireworks[i].moving[j];
      if (Math.abs(f.speedX) < firework.speedThreshold && Math.abs(f.speedY) < firework.speedThreshold) {
        fireworks[i].moving.splice(j, 1);
        fireworks[i].fading.push(f);
      } else {
        f.x += f.speedX * frames;
        f.y += f.speedY * frames;
        if (Math.sign(f.speedX) === Math.sign(f.speedX - f.speedDecreaseX * frames)) {
          f.speedX -= f.speedDecreaseX * frames;
        } else {
          f.speedX = 0;
        }
        if (Math.sign(f.speedY) === Math.sign(f.speedY - f.speedDecreaseY * frames)) {
          f.speedY -= f.speedDecreaseY * frames;
        } else {
          f.speedY = 0;
        }
      }
    }
    if (fireworks[i].moving.length === 0) {
      for (let j = fireworks[i].fading.length - 1; j >= 0; j--) {
        const f = fireworks[i].fading[j];
        if (f.alpha > f.alphaDecrease * frames) {
          f.alpha -= f.alphaDecrease * frames;
        } else {
          fireworks[i].fading.splice(j, 1);
        }
      }
      if (fireworks[i].fading.length === 0) {
        fireworks.splice(i, 1);
      }
    }
  }
}

function removeRockets (frames) {
  for (let i = rockets.length - 1; i >= 0; i--) {
    const r = rockets[i];
    if (Math.abs(r.speedX) < rocket.speedThreshold && Math.abs(r.speedY) < rocket.speedThreshold) {
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
  const moving = [];
  const R = firework.lowestRadius + Math.random() * (firework.highestRadius - firework.lowestRadius);
  for (let i = 0; i < R * 2; i++) {
    const r = R * Math.sqrt(Math.random());
    const theta = 2 * Math.PI * Math.random();
    const distX = r * Math.cos(theta);
    const distY = r * Math.sin(theta);
    const norm = Math.sqrt(distX ** 2 + distY ** 2);
    const speed = firework.lowestSpeed + Math.random() * (firework.highestSpeed - firework.lowestSpeed);
    const speedX = distX / norm * speed;
    const speedY = distY / norm * speed;
    moving.push({
      x,
      y,
      alpha: 1,
      alphaDecrease: firework.lowestAlphaDecrease + Math.random() * (firework.highestAlphaDecrease - firework.lowestAlphaDecrease),
      length: firework.lowestLength + Math.random() * (firework.highestLength - firework.lowestLength),
      speedX,
      speedY,
      speedDecreaseX: speedX ** 2 / (2 * distX),
      speedDecreaseY: speedY ** 2 / (2 * distY)
    });
  }
  fireworks.push({
    color,
    moving,
    fading: []
  });
}

function createRocket (x, y) {
  const distX = x - canvas.width / 2;
  const distY = y - canvas.height;
  const norm = Math.sqrt(distX ** 2 + distY ** 2);
  const speed = rocket.lowestSpeed + Math.random() * (rocket.highestSpeed - rocket.lowestSpeed);
  const speedX = distX / norm * speed;
  const speedY = distY / norm * speed;
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
    speedDecreaseX: speedX ** 2 / (2 * distX),
    speedDecreaseY: speedY ** 2 / (2 * distY)
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

function keyUpHandler (e) {
  if (e.keyCode === 80) {
    if (animation === undefined) {
      animation = window.requestAnimationFrame(draw);
    } else {
      window.cancelAnimationFrame(animation);
      animation = undefined;
    }
  }
}

function mouseDownHandler (e) {
  if (animation !== undefined) {
    createRocket(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
  }
}

function resizeHandler () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
