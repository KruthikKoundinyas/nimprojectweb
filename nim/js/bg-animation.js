(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var canvas = document.createElement('canvas');
  canvas.className = 'bg-animation';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(canvas, document.body.firstChild);

  var ctx = canvas.getContext('2d');
  var particles = [];
  var w, h, dpr;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function pick(arr) { return arr[Math.floor(rand(0, arr.length))]; }

  var palettes = [
    [0, 229, 255],   // cyan
    [126, 232, 250], // light cyan
    [255, 45, 85],   // pink
    [57, 255, 20],   // green
  ];

  function rgba(rgb, a) {
    return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + a + ')';
  }

  var shapeTypes = [
    'triangle', 'triangle', 'triangle',
    'hexagon', 'hexagon',
    'binary', 'binary', 'binary',
    'xor',
    'diamond', 'diamond',
    'nodes',
    'dot', 'dot'
  ];

  function createParticle(scattered) {
    var type = pick(shapeTypes);
    var size;
    if (type === 'binary' || type === 'xor') size = rand(14, 28);
    else if (type === 'dot') size = rand(2, 5);
    else if (type === 'nodes') size = rand(25, 50);
    else size = rand(18, 55);

    return {
      x: rand(-60, w + 60),
      y: scattered ? rand(-60, h + 60) : h + rand(40, 200),
      size: size,
      speed: rand(0.06, 0.22),
      drift: rand(-0.04, 0.04),
      rot: rand(0, 360),
      rotSpeed: rand(-0.12, 0.12),
      opacity: rand(0.025, 0.055),
      type: type,
      color: pick(palettes),
      char: Math.random() > 0.5 ? '1' : '0',
      wobblePhase: rand(0, Math.PI * 2),
      wobbleAmp: rand(0.3, 1.2),
      wobbleFreq: rand(0.003, 0.008)
    };
  }

  var count = 35;
  for (var i = 0; i < count; i++) {
    particles.push(createParticle(true));
  }

  function drawTriangle(p) {
    ctx.beginPath();
    ctx.moveTo(0, -p.size);
    ctx.lineTo(-p.size * 0.866, p.size * 0.5);
    ctx.lineTo(p.size * 0.866, p.size * 0.5);
    ctx.closePath();
    ctx.strokeStyle = rgba(p.color, p.opacity);
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  function drawHexagon(p) {
    ctx.beginPath();
    for (var j = 0; j < 6; j++) {
      var a = Math.PI / 3 * j - Math.PI / 2;
      var px = p.size * Math.cos(a);
      var py = p.size * Math.sin(a);
      if (j === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = rgba(p.color, p.opacity);
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  function drawBinary(p) {
    ctx.font = p.size + 'px "Courier New",monospace';
    ctx.fillStyle = rgba(p.color, p.opacity + 0.01);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.char, 0, 0);
  }

  function drawXor(p) {
    var r = p.size * 0.45;
    ctx.strokeStyle = rgba(p.color, p.opacity);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-r * 0.55, 0);
    ctx.lineTo(r * 0.55, 0);
    ctx.moveTo(0, -r * 0.55);
    ctx.lineTo(0, r * 0.55);
    ctx.stroke();
  }

  function drawDiamond(p) {
    ctx.beginPath();
    ctx.moveTo(0, -p.size);
    ctx.lineTo(p.size * 0.55, 0);
    ctx.lineTo(0, p.size);
    ctx.lineTo(-p.size * 0.55, 0);
    ctx.closePath();
    ctx.strokeStyle = rgba(p.color, p.opacity);
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  function drawNodes(p) {
    var s = p.size;
    var pts = [
      [-s * 0.45, -s * 0.35],
      [s * 0.5, -s * 0.15],
      [s * 0.1, s * 0.45],
      [-s * 0.35, s * 0.2]
    ];
    ctx.strokeStyle = rgba(p.color, p.opacity * 0.7);
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (var j = 0; j < pts.length; j++) {
      for (var k = j + 1; k < pts.length; k++) {
        ctx.moveTo(pts[j][0], pts[j][1]);
        ctx.lineTo(pts[k][0], pts[k][1]);
      }
    }
    ctx.stroke();
    ctx.fillStyle = rgba(p.color, p.opacity + 0.01);
    for (var j = 0; j < pts.length; j++) {
      ctx.beginPath();
      ctx.arc(pts[j][0], pts[j][1], 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawDot(p) {
    ctx.beginPath();
    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
    ctx.fillStyle = rgba(p.color, p.opacity + 0.02);
    ctx.fill();
  }

  var drawFns = {
    triangle: drawTriangle,
    hexagon: drawHexagon,
    binary: drawBinary,
    xor: drawXor,
    diamond: drawDiamond,
    nodes: drawNodes,
    dot: drawDot
  };

  var tick = 0;

  function animate() {
    ctx.clearRect(0, 0, w, h);
    tick++;

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];

      p.y -= p.speed;
      p.x += p.drift + Math.sin(tick * p.wobbleFreq + p.wobblePhase) * p.wobbleAmp * 0.05;
      p.rot += p.rotSpeed;

      if (p.y + p.size < -80) {
        particles[i] = createParticle(false);
        continue;
      }
      if (p.x < -120) p.x = w + 80;
      if (p.x > w + 120) p.x = -80;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      drawFns[p.type](p);
      ctx.restore();
    }

    requestAnimationFrame(animate);
  }

  animate();
})();
