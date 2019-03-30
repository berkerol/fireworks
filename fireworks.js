/* global performance */
/* global FPSMeter */
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const getTime = typeof performance === 'function' ? performance.now : Date.now;
const FRAME_DURATION = 1000 / 58;
let then = getTime();
let acc = 0;
FPSMeter.theme.colorful.container.height = '40px';
let meter = new FPSMeter({
  left: canvas.width - 130 + 'px',
  top: 'auto',
  bottom: '12px',
  theme: 'colorful',
  heat: 1,
  graph: 1
});

let random = true;

let firework = {
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

let rocket = {
  color: 15,
  colors: [[255, 30, 40], [255, 150, 20], [255, 220, 0], [0, 255, 100], [100, 255, 20], [50, 200, 200], [120, 220, 255], [80, 180, 255], [220, 120, 255], [255, 100, 150], [240, 20, 200], [140, 140, 140], [170, 170, 170], [200, 200, 200], [0, 0, 0]],
  lineCap: 'round',
  lineWidth: 3,
  highestLength: 30,
  highestSpeed: 10,
  lowestLength: 20,
  lowestSpeed: 6,
  probability: 0.05,
  speed: 8
};

let fireworks = [];
let rockets = [];

draw();
document.addEventListener('mousedown', mouseDownHandler);
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
  meter.tick();
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
    ctx.lineWidth = firework.lineWidth;
    ctx.strokeStyle = 'rgba(' + f.color[0] + ',' + f.color[1] + ',' + f.color[2] + ',' + f.alpha1 + ')';
    for (let degree of f.degrees) {
      let angle = degree * Math.PI / 180;
      let x = f.length * Math.cos(angle);
      let y = f.length * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(f.x, f.y);
      ctx.lineTo(f.x + x, f.y + y);
      ctx.stroke();
      ctx.closePath();
    }
  }
  if (f.alpha2 > 0) {
    ctx.fillStyle = 'rgba(' + f.color[0] + ',' + f.color[1] + ',' + f.color[2] + ',' + f.alpha2 + ')';
    for (let step of f.steps) {
      for (let degree of f.degrees) {
        let angle = degree * Math.PI / 180;
        let x = f.length * Math.cos(angle) * step;
        let y = f.length * Math.sin(angle) * step;
        ctx.beginPath();
        ctx.arc(f.x, f.y, firework.radius, 0, 2 * Math.PI);
        ctx.arc(f.x + x, f.y + y, firework.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function drawRocket (r) {
  ctx.lineWidth = rocket.lineWidth;
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
  let degrees = [];
  let degree = 0;
  while (degree < 360) {
    degrees.push(degree);
    degree += Math.floor(firework.lowestDegree + Math.random() * (firework.highestDegree - firework.lowestDegree));
  }
  let steps = [];
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
  let norm = Math.sqrt(x ** 2 + y ** 2);
  let speed = rocket.lowestSpeed + Math.random() * (rocket.highestSpeed - rocket.lowestSpeed);
  let speedX = x / norm * speed;
  let speedY = y / norm * speed;
  let color;
  if (rocket.color === rocket.colors.length) {
    color = rocket.colors[Math.floor(Math.random() * (rocket.colors.length - 1))];
  } else {
    color = rocket.colors[rocket.color];
  }
  rockets.push({
    x: canvas.width / 2,
    y: canvas.height,
    color,
    length: rocket.lowestLength + Math.random() * (rocket.highestLength - rocket.lowestLength),
    speedX,
    speedY,
    speedDecreaseX: speedX * speedX / (2 * x),
    speedDecreaseY: speedY * speedY / (2 * y)
  });
}

function changeRandom () {
  random = !random;
  if (random) {
    document.getElementById('change-random').innerHTML = 'On';
  } else {
    document.getElementById('change-random').innerHTML = 'Off';
  }
}

$('.dropdown-menu li a').click(function () {
  $('#selected').text($(this).text());
  rocket.color = $(this).closest('li').data('value');
  if (rocket.color === rocket.colors.length - 1) {
    rocket.colors[rocket.colors.length - 1] = rocket.colors[Math.floor(Math.random() * rocket.colors.length)];
  }
});

function mouseDownHandler (e) {
  createRocket(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
}

function resizeHandler () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
