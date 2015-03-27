(function() {
  "use strict";

  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  var Vector = window.Vector;
  // var Quad = window.Quad;
  var Flock = window.Flock;
  var Particle = window.Particle;

  var isWide = window.innerWidth > 768 || window.innerHeight > 768;

  window.drawBoids = false;
  window.maxDistance = 64;
  window.pixelWidth = 0.75;
  window.maxNeighbors = 6;
  window.avoidWalls = true;
  window.avoidance = 1.0;

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

  var particleCount = isWide ? 256 : 128;
  for (var i = 0; i < particleCount; i++) {
    position = new Vector(randomRange(0, width), randomRange(0, height));
    velocity = new Vector(Math.cos(randomRange(0, 2 * Math.PI)), Math.sin(randomRange(0, 2 * Math.PI)));
    boids.push(new Particle(position, velocity));
  }

  var rects = [];
  for (var i = 0; i < els.length; i++) {
    rects.push(els[i].getBoundingClientRect());
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
    var neighbors;

    if (drawBoids) {
      ctx.strokeStyle = "rgb(60, 60, 60)";
    }
    ctx.fillStyle = "rgb(60, 60, 60)";
    ctx.lineWidth = pixelWidth;

    for (var i = 0; i < boids.length; i++) {
      boidA = boids[i];

      if (drawBoids) {
        var r = 2;
        var theta = boidA.velocity.heading() + (Math.PI / 2);

        ctx.save();
        ctx.translate(boidA.position.x, boidA.position.y);
        ctx.rotate(theta);
        ctx.beginPath();
        ctx.moveTo(0, -r * 2);
        ctx.lineTo(-r, r * 2);
        ctx.lineTo(r, r * 2);
        ctx.lineTo(0, -r * 2);
        ctx.stroke();
        ctx.restore();
      } else {
        neighbors = 0;

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
          ctx.strokeStyle = "rgba(0, 0, 0, " + (alpha * 0.5) + ")";

          ctx.beginPath();
          ctx.moveTo(boidA.position.x, boidA.position.y);
          ctx.lineTo(boidB.position.x, boidB.position.y);
          ctx.stroke();

          neighbors++;

          // Only draw particles with < max neighbors
          if (neighbors > maxNeighbors) {
            neighbors = 0;
            break;
          }
        }

        if (neighbors > 0) {
          ctx.fillRect(boidA.position.x - (pixelWidth * 0.5), boidA.position.y - (pixelWidth * 0.5), pixelWidth, pixelWidth);
        }
      }
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
