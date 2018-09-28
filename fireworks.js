/* global performance */
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const getTime = typeof performance === 'function' ? performance.now : Date.now;
const FRAME_DURATION = 1000 / 58;
let then = getTime();
let acc = 0;

let random = true;

let mouse = {
  x: canvas.width / 2,
  y: canvas.height / 2
};

let firework = {
  lines: [20, 24, 30, 36, 40],
  lineCap: 'round',
  explosionAlpha: 0.4,
  highestAlphaDecrease1: 0.015,
  highestAlphaDecrease2: 0.02,
  highestLineWidth: 2.5,
  highestRadius: 2.5,
  highestSpeed: 2.0,
  highestSpeedDecrease: 0.02,
  highestStep: 0.3,
  lowestAlphaDecrease1: 0.005,
  lowestAlphaDecrease2: 0.01,
  lowestLineWidth: 1.5,
  lowestRadius: 1.5,
  lowestSpeed: 1.0,
  lowestSpeedDecrease: 0.01,
  lowestStep: 0.1
};

let rocket = {
  color: 15,
  colors: [[240, 60, 80], [255, 100, 0], [255, 160, 0], [255, 220, 0], [220, 255, 0], [160, 255, 0], [50, 255, 0], [0, 220, 120], [130, 230, 220], [0, 220, 240], [240, 120, 255], [210, 140, 170], [220, 180, 240], [160, 220, 220], [200, 200, 200]],
  lineCap: 'round',
  highestLength: 30,
  highestLineWidth: 3,
  highestSpeed: 10,
  lowestLength: 20,
  lowestLineWidth: 2,
  lowestSpeed: 6,
  probability: 0.05,
  speed: 8
};

let fireworks = [];
let rockets = [];

draw();
document.addEventListener('mousedown', mouseDownHandler);
document.addEventListener('mousemove', mouseMoveHandler);
window.addEventListener('resize', resizeHandler);

function draw () {
  let now = getTime();
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
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineCap = firework.lineCap;
  for (let f of fireworks) {
    drawFirework(f);
  }
  ctx.lineCap = rocket.lineCap;
  for (let r of rockets) {
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
    ctx.lineWidth = f.lineWidth;
    ctx.strokeStyle = 'rgba(' + f.color[0] + ',' + f.color[1] + ',' + f.color[2] + ',' + f.alpha1 + ')';
    for (let i = 0; i < f.lines / 2; i++) {
      let angle = i * 2 * Math.PI / f.lines;
      let x = f.length * Math.cos(angle);
      let y = f.length * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(f.x - x, f.y - y);
      ctx.lineTo(f.x + x, f.y + y);
      ctx.stroke();
      ctx.closePath();
    }
  }
  if (f.alpha2 > 0) {
    ctx.fillStyle = 'rgba(' + f.color[0] + ',' + f.color[1] + ',' + f.color[2] + ',' + f.alpha2 + ')';
    for (let i = 1.0; i > f.step; i -= f.step) {
      for (let j = 0; j < f.lines / 2; j++) {
        let angle = j * 2 * Math.PI / f.lines;
        let x = f.length * Math.cos(angle) * i;
        let y = f.length * Math.sin(angle) * i;
        ctx.beginPath();
        ctx.arc(f.x - x, f.y - y, f.radius, 0, 2 * Math.PI);
        ctx.arc(f.x + x, f.y + y, f.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function drawRocket (r) {
  ctx.lineWidth = r.lineWidth;
  ctx.strokeStyle = 'rgba(' + r.color[0] + ',' + r.color[1] + ',' + r.color[2] + ',' + 1.0 + ')';
  ctx.beginPath();
  ctx.moveTo(r.x, r.y);
  ctx.lineTo(r.x + r.speedX / rocket.speed * r.length, r.y + r.speedY / rocket.speed * r.length);
  ctx.stroke();
  ctx.closePath();
}

function removeFireworks (frames) {
  for (let i = fireworks.length - 1; i >= 0; i--) {
    let f = fireworks[i];
    f.alpha1 -= f.alphaDecrease1 * frames;
    if (f.alpha1 > firework.explosionAlpha) {
      f.length += f.speed * frames;
      if (f.speed > firework.highestSpeedDecrease) {
        f.speed -= f.speedDecrease * frames;
      } else {
        f.speed = 0;
      }
    } else {
      if (f.alpha2 === -1) {
        f.alpha2 = 1;
      } else if (f.alpha2 < 0) {
        fireworks.splice(i, 1);
      } else {
        f.alpha2 -= f.alphaDecrease2 * frames;
      }
    }
  }
}

function removeRockets (frames) {
  for (let i = rockets.length - 1; i >= 0; i--) {
    let r = rockets[i];
    if (Math.abs(r.speedX) < 0.5 && Math.abs(r.speedY) < 0.5) {
      rockets.splice(i, 1);
      createFirework(r.x, r.y, r.color);
    } else {
      r.x += r.speedX * frames;
      r.y += r.speedY * frames;
      r.speedX -= r.speedDecreaseX * frames;
      r.speedY -= r.speedDecreaseY * frames;
    }
  }
}

function createFirework (x, y, color) {
  fireworks.push({
    x,
    y,
    color,
    alpha1: 1,
    alpha2: -1,
    alphaDecrease1: firework.lowestAlphaDecrease1 + Math.random() * (firework.highestAlphaDecrease1 - firework.lowestAlphaDecrease1),
    alphaDecrease2: firework.lowestAlphaDecrease2 + Math.random() * (firework.highestAlphaDecrease2 - firework.lowestAlphaDecrease2),
    length: 0,
    lines: firework.lines[Math.floor(Math.random() * firework.lines.length)],
    lineWidth: firework.lowestLineWidth + Math.random() * (firework.highestLineWidth - firework.lowestLineWidth),
    radius: firework.lowestRadius + Math.random() * (firework.highestRadius - firework.lowestRadius),
    speed: firework.lowestSpeed + Math.random() * (firework.highestSpeed - firework.lowestSpeed),
    speedDecrease: firework.lowestSpeedDecrease + Math.random() * (firework.highestSpeedDecrease - firework.lowestSpeedDecrease),
    step: firework.lowestStep + Math.random() * (firework.highestStep - firework.lowestStep)
  });
}

function createRocket (x, y) {
  x -= canvas.width / 2;
  y -= canvas.height;
  let norm = Math.sqrt(x ** 2 + y ** 2);
  let speed = rocket.lowestSpeed + Math.random() * (rocket.highestSpeed - rocket.lowestSpeed);
  let speedX = x / norm * speed;
  let speedY = y / norm * speed;
  let color;
  if (rocket.color === rocket.colors.length) {
    color = rocket.colors[Math.floor(Math.random() * rocket.colors.length)];
  } else {
    color = rocket.colors[rocket.color];
  }
  rockets.push({
    x: canvas.width / 2,
    y: canvas.height,
    color,
    length: rocket.lowestLength + Math.random() * (rocket.highestLength - rocket.lowestLength),
    lineWidth: rocket.lowestLineWidth + Math.random() * (rocket.highestLineWidth - rocket.lowestLineWidth),
    speedX,
    speedY,
    speedDecreaseX: speedX * speedX / (2 * x),
    speedDecreaseY: speedY * speedY / (2 * y)
  });
}

function changeColor () {
  if (rocket.color === rocket.colors.length) {
    rocket.color = 0;
  } else {
    rocket.color++;
  }
}

function changeRandom () {
  random = !random;
  if (random) {
    document.getElementById('change-random').innerHTML = 'On';
  } else {
    document.getElementById('change-random').innerHTML = 'Off';
  }
}

function mouseDownHandler (e) {
  createRocket(mouse.x, mouse.y);
}

function mouseMoveHandler (e) {
  mouse.x = e.clientX - canvas.offsetLeft;
  mouse.y = e.clientY - canvas.offsetTop;
}

function resizeHandler () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
