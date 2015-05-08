(function() {
  "use strict";

  window.Intercom('boot', { app_id: "g8unfepb" });
  window.Intercom('update');

  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  var Vector = window.Vector;
  // var Quad = window.Quad;
  var Flock = window.Flock;
  var Particle = window.Particle;

  var maxDistance = 72; // 64
  var pixelWidth = 2.0; // 0.5
  var maxNeighbors = 6;
  var avoidWalls = true;
  var avoidance = 1.0;

  var canvas = document.querySelector("canvas");
  var ctx = canvas.getContext("2d");

  var devicePixelRatio = window.devicePixelRatio || 1;
  var backingStoreRatio = ctx.backingStorePixelRatio || 1;
  var ratio = devicePixelRatio / backingStoreRatio;

  var width = window.innerWidth;
  var height = window.innerHeight;

  canvas.width = width * ratio;
  canvas.height = height * ratio;

  canvas.style.width = width + "px";
  canvas.style.height = height + "px";

  ctx.scale(ratio, ratio);

  var els = document.querySelectorAll(".avoid");

  // var quads = new Quad(
  //   new Vector(0, 0),
  //   new Vector(width, height)
  // );

  // quads.subdivide(4);

  function contains(rect, v) {
    return v.x > rect.left && v.x < rect.right && v.y > rect.top && v.y < rect.bottom;
  }

  function getCenter(rect) {
    return new Vector(rect.left + (rect.width / 2), rect.top + (rect.height / 2));
  }

  var boids = [];
  var position, velocity;

  var particleCount = Math.sqrt(width * height) / 10;
  for (var i = 0; i < particleCount; i++) {
    position = new Vector(randomRange(0, width), randomRange(0, height));
    velocity = new Vector(Math.cos(randomRange(0, 2 * Math.PI)), Math.sin(randomRange(0, 2 * Math.PI)));
    boids.push(new Particle(position, velocity));
  }

  var rects = [];
  var boundingRect;
  for (var i = 0; i < els.length; i++) {
    boundingRect = els[i].getBoundingClientRect();
    // cloning to avoid perf hit in bounding rect property access during draw
    rects.push({
      left: boundingRect.left,
      right: boundingRect.right,
      top: boundingRect.top,
      bottom: boundingRect.bottom
    });
  }

  var flock = new Flock(boids);

  function update() {
    flock.update();

    var boid, rect;
    for (var i = 0; i < boids.length; i++) {
      boid = boids[i];

      // quads.dirty(boid.position); // dirty previous position
      boid.update();
      // quads.dirty(boid.position); // dirty new position

      for (var j = 0; j < rects.length; j++) {
        rect = rects[j];
        if (contains(rect, boid.position)) {
          boid.acceleration.add(boid.position.clone().sub(getCenter(rect)).normalize().multiplyScalar(avoidance));
        }
      }

      if (avoidWalls) {
        if (boid.position.x < 0) {
          boid.acceleration.add(new Vector(1, 0).multiplyScalar(avoidance));
        }
        if (boid.position.y < 0) {
          boid.acceleration.add(new Vector(0, 1).multiplyScalar(avoidance));
        }
        if (boid.position.x > width) {
          boid.acceleration.add(new Vector(-1, 0).multiplyScalar(avoidance));
        }
        if (boid.position.y > height) {
          boid.acceleration.add(new Vector(0, -1).multiplyScalar(avoidance));
        }
      } else {
        if (boid.position.x < 0) {
          boid.position.x = width;
        }
        if (boid.position.y < 0) {
          boid.position.y = height;
        }
        if (boid.position.x > width) {
          boid.position.x = 0;
        }
        if (boid.position.y > height) {
          boid.position.y = 0;
        }
      }
    }
  }

  function draw() {
    var boidA, boidB;
    var distance, alpha;

    ctx.strokeStyle = "rgb(60, 60, 60)";
    ctx.fillStyle = "rgb(60, 60, 60)";
    ctx.lineWidth = pixelWidth;

    var strokes = {};

    for (var i = 0; i < boids.length; i++) {
      boidA = boids[i];
      boidA.neighbors = 0;

      for (var j = 0; j < boids.length; j++) {
        if (i === j) {
          continue;
        }

        boidB = boids[j];

        distance = Vector.distance(boidA.position, boidB.position);
        if (distance > maxDistance) {
          continue;
        }

        alpha = 1 - (distance / maxDistance);

        // batch strokes by their alpha value
        alpha = alpha.toFixed(1);
        if (!strokes[alpha]) {
          strokes[alpha] = [];
        }
        strokes[alpha].push([boidA.position, boidB.position]);

        // only draw particles with < max neighbors
        if (boidA.neighbors >= maxNeighbors) {
          break;
        }

        boidA.neighbors++;
      }

      if (boidA.neighbors > 0) {
        ctx.fillRect(
          boidA.position.x - (pixelWidth * 1.0),
          boidA.position.y - (pixelWidth * 1.0),
          pixelWidth * 2.0,
          pixelWidth * 2.0);
      }
    }

    var alphaStrokes;
    var line;
    var alphas = Object.keys(strokes);
    for (i = 0; i < alphas.length; i++) {
      alpha = alphas[i];
      alphaStrokes = strokes[alpha];

      ctx.globalAlpha = alpha * 0.6;

      ctx.beginPath();
      for (j = 0; j < alphaStrokes.length; j++) {
        line = alphaStrokes[j];
        ctx.moveTo(line[0].x, line[0].y);
        ctx.lineTo(line[1].x, line[1].y);
      }
      ctx.stroke();
    }
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // quads.reset();
    update();
    // quads.clear(ctx);
    draw();

    requestAnimationFrame(loop);
  }

  loop();

})();
