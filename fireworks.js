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
  color: 15,
  colors: [[240, 60, 80], [255, 100, 0], [255, 160, 0], [255, 220, 0], [220, 255, 0], [160, 255, 0], [50, 255, 0], [0, 220, 120], [130, 230, 220], [0, 220, 240], [240, 120, 255], [210, 140, 170], [220, 180, 240], [160, 220, 220], [200, 200, 200]],
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
  highestVariance: 0.04,
  lowestAlphaDecrease1: 0.005,
  lowestAlphaDecrease2: 0.01,
  lowestLineWidth: 1.5,
  lowestRadius: 1.5,
  lowestSpeed: 1.0,
  lowestSpeedDecrease: 0.01,
  lowestStep: 0.1,
  lowestVariance: -0.04,
  probability: 0.1
};

let fireworks = [];

ctx.lineCap = firework.lineCap;
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
  if (f.alpha1 > 0) {
    ctx.lineWidth = f.lineWidth;
    ctx.strokeStyle = 'rgba(' + f.color[0] + ',' + f.color[1] + ',' + f.color[2] + ',' + f.alpha1 + ')';
    for (let i = 0; i < f.lines / 2; i++) {
      let angle = i * 2 * Math.PI / f.lines;
      let x = f.length * Math.cos(angle);
      let y = f.length * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(f.x - x - x * f.variances[i], f.y - y - y * f.variances[i]);
      ctx.lineTo(f.x + x + x * f.variances[i], f.y + y + y * f.variances[i]);
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
        ctx.arc(f.x - x - x * f.variances[j], f.y - y - y * f.variances[j], f.radius, 0, 2 * Math.PI);
        ctx.arc(f.x + x + x * f.variances[j], f.y + y + y * f.variances[j], f.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
      }
    }
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
    f.alpha1 -= f.alphaDecrease1;
    if (f.alpha1 > firework.explosionAlpha) {
      f.length += f.speed;
      if (f.speed > firework.highestSpeedDecrease) {
        f.speed -= f.speedDecrease;
      } else {
        f.speed = 0;
      }
    } else {
      if (f.alpha2 === -1) {
        f.alpha2 = 1;
      } else if (f.alpha2 < 0) {
        fireworks.splice(i, 1);
      } else {
        f.alpha2 -= f.alphaDecrease2;
      }
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
  let lines = firework.lines[Math.floor(Math.random() * firework.lines.length)];
  let variances = [];
  for (let i = 0; i < lines / 2; i++) {
    variances.push(firework.lowestVariance + Math.random() * (firework.highestVariance - firework.lowestVariance));
  }
  fireworks.push({
    x,
    y,
    color,
    alpha1: 1,
    alpha2: -1,
    alphaDecrease1: firework.lowestAlphaDecrease1 + Math.random() * (firework.highestAlphaDecrease1 - firework.lowestAlphaDecrease1),
    alphaDecrease2: firework.lowestAlphaDecrease2 + Math.random() * (firework.highestAlphaDecrease2 - firework.lowestAlphaDecrease2),
    length: 0,
    lines,
    lineWidth: firework.lowestLineWidth + Math.random() * (firework.highestLineWidth - firework.lowestLineWidth),
    radius: firework.lowestRadius + Math.random() * (firework.highestRadius - firework.lowestRadius),
    speed: firework.lowestSpeed + Math.random() * (firework.highestSpeed - firework.lowestSpeed),
    speedDecrease: firework.lowestSpeedDecrease + Math.random() * (firework.highestSpeedDecrease - firework.lowestSpeedDecrease),
    step: firework.lowestStep + Math.random() * (firework.highestStep - firework.lowestStep),
    variances
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
