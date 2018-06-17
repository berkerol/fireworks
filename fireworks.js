let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let random = true;

let mouse = {
  x: canvas.width / 2,
  y: canvas.height / 2
};

let firework = {
  alpha: 0.01,
  color: 15,
  colors: [[240, 60, 80], [255, 100, 0], [255, 160, 0], [255, 220, 0], [220, 255, 0], [160, 255, 0], [50, 255, 0], [0, 220, 120], [130, 230, 220], [0, 220, 240], [240, 120, 255], [210, 140, 170], [220, 180, 240], [160, 220, 220], [200, 200, 200]],
  lines: 20,
  lineCap: 'round',
  shadowBlur: 10,
  highestLineWidth: 2.5,
  highestRadius: 150,
  highestSpeed: 3,
  lowestLineWidth: 1.5,
  lowestRadius: 50,
  lowestSpeed: 1,
  probability: 0.1
};

let fireworks = [];

ctx.lineCap = firework.lineCap;
ctx.shadowBlur = firework.shadowBlur;
draw();
document.addEventListener('mousedown', mouseDownHandler);
document.addEventListener('mousemove', mouseMoveHandler);
window.addEventListener('resize', resizeHandler);

function draw () {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let f of fireworks) {
    drawFirework(f);
  }
  createFireworks();
  removeFireworks();
  window.requestAnimationFrame(draw);
}

function drawFirework (f) {
  let color = 'rgba(' + f.color[0] + ',' + f.color[1] + ',' + f.color[2] + ',' + f.alpha + ')';
  ctx.lineWidth = f.lineWidth;
  ctx.shadowColor = color;
  ctx.strokeStyle = color;
  for (let i = 0; i < firework.lines; i++) {
    ctx.beginPath();
    ctx.moveTo(f.x, f.y);
    ctx.lineTo(f.x + f.length * Math.cos(i * 2 * Math.PI / firework.lines), f.y + f.length * Math.sin(i * 2 * Math.PI / firework.lines));
    ctx.stroke();
    ctx.closePath();
  }
}

function createFireworks () {
  if (random && Math.random() < firework.probability) {
    createFirework(Math.random() * canvas.width, Math.random() * canvas.height);
  }
}

function removeFireworks () {
  for (let i = fireworks.length - 1; i >= 0; i--) {
    let f = fireworks[i];
    if (f.alpha < 0 || f.length >= f.radius) {
      fireworks.splice(i, 1);
    } else {
      f.length += f.speed;
      f.alpha -= firework.alpha;
    }
  }
}

function createFirework (x, y) {
  let color;
  if (firework.color === firework.colors.length) {
    color = firework.colors[Math.floor(Math.random() * firework.colors.length)];
  } else {
    color = firework.colors[firework.color];
  }
  fireworks.push({
    x,
    y,
    color,
    alpha: 1,
    length: 0,
    lineWidth: firework.lowestLineWidth + Math.random() * (firework.highestLineWidth - firework.lowestLineWidth),
    radius: firework.lowestRadius + Math.random() * (firework.highestRadius - firework.lowestRadius),
    speed: firework.lowestSpeed + Math.random() * (firework.highestSpeed - firework.lowestSpeed)
  });
}

function changeColor () {
  if (firework.color === firework.colors.length) {
    firework.color = 0;
  } else {
    firework.color++;
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
  createFirework(mouse.x, mouse.y);
}

function mouseMoveHandler (e) {
  mouse.x = e.clientX - canvas.offsetLeft;
  mouse.y = e.clientY - canvas.offsetTop;
}

function resizeHandler () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
