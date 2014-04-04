(function() {

  window.randomRange = function(min, max) {
    return Math.random() * (max - min) + min;
  }

  var canvas = document.querySelector('canvas');
  var ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  var els = document.querySelectorAll('.avoid');

  function contains(rect, v) {
    return v.x > rect.left && v.x < rect.right && v.y > rect.top && v.y < rect.bottom;
  }

  function getCenter(rect) {
    return new Vector(rect.left + (rect.width / 2), rect.top + (rect.height / 2));
  }

  window.drawBoids = false;

  window.maxDistance = 64;
  window.pixelWidth = 0.5;
  window.maxNeighbors = 9;

  var boids = [];
  var position, velocity;
  var particle;

  for (var i = 0; i < 256; i++) {
    position = new Vector(randomRange(0, canvas.width), randomRange(0, canvas.height));
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
      boid.update();

      for (var j = 0; j < rects.length; j++) {
        rect = rects[j];
        if (contains(rect, boid.position)) {
          boid.acceleration.add(boid.position.clone().sub(getCenter(rect)).normalize());
        }
      }

      if (boid.position.x < 0) boid.acceleration.add(new Vector(1, 0));
      if (boid.position.y < 0) boid.acceleration.add(new Vector(0, 1));
      if (boid.position.x > canvas.width) boid.acceleration.add(new Vector(-1, 0));
      if (boid.position.y > canvas.height) boid.acceleration.add(new Vector(0, -1));
    }
  }

  function draw() {
    var boidA, boidB;
    var distance, alpha;
    var neighbors;

    for (var i = 0; i < boids.length; i++) {
      boidA = boids[i];

      if (drawBoids) {
        var r = 2;
        var theta = boidA.velocity.heading() + (Math.PI / 2);

        ctx.save();
        ctx.translate(boidA.position.x,boidA.position.y);
        ctx.rotate(theta);
        ctx.beginPath();
        ctx.moveTo(0, -r*2);
        ctx.lineTo(-r, r*2);
        ctx.lineTo(r, r*2);
        ctx.lineTo(0, -r*2);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = pixelWidth;
        ctx.stroke();
        ctx.restore();
      } else {
        neighbors = 0;

        for (var j = 0; j < boids.length; j++) {
          if (i == j) {
            continue;
          }

          boidB = boids[j];

          distance = Vector.distance(boidA.position, boidB.position);
          if (distance > maxDistance) {
            continue;
          }

          alpha = 1 - (distance / maxDistance);

          ctx.beginPath();
          ctx.moveTo(boidA.position.x, boidA.position.y);
          ctx.lineTo(boidB.position.x, boidB.position.y);
          ctx.strokeStyle = 'rgba(0, 0, 0, ' + (alpha * 0.5) + ')';
          ctx.lineWidth = pixelWidth;
          ctx.stroke();

          neighbors++;

          // Only draw particles with < max neighbors
          if (neighbors > maxNeighbors) {
            neighbors = 0;
            break;
          }
        }

        if (neighbors > 0) {
          ctx.fillStyle = 'black';
          ctx.fillRect(boidA.position.x - (pixelWidth * 0.5), boidA.position.y - (pixelWidth * 0.5), pixelWidth, pixelWidth);
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    update();
    draw();

    // setTimeout(loop, 100);
    requestAnimationFrame(loop);
  }

  loop();
 
}).call(this);
