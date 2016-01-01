(function() {
  "use strict";

  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  var Vector = window.Vector;
  var Flock = window.Flock;
  var Particle = window.Particle;

  var maxDistance = 72; // 64
  var pixelWidth = 2.0; // 0.5
  var maxNeighbors = 6;

  var width = window.innerWidth / 2;
  var height = window.innerHeight;

  var el = document.getElementById('draw');
  var params = {
    width: width,
    height: height,
    type: Two.Types.canvas
  };
  var two = new Two(params).appendTo(el);
  var colors = ['#66cc70', '#73c6e5', '#e573b6', '#e5e073', '#e5ac73'];

  var boids = [];
  var boidRenderers = [];
  var position, velocity;

  var particleCount = Math.floor(Math.sqrt(width * height) / 10);
  var boid, boidRenderer;
  var lineGroup = two.makeGroup();
  var boidGroup = two.makeGroup();

  for (var i = 0; i < particleCount; i++) {
    position = new Vector(randomRange(0, width), randomRange(0, height));
    velocity = new Vector(Math.cos(randomRange(0, 2 * Math.PI)), Math.sin(randomRange(0, 2 * Math.PI)));

    boid = new Particle(position, velocity);
    boidRenderer = two.makeRectangle(position.x, position.y, pixelWidth * 2, pixelWidth * 2);
    boidRenderer.fill = colors[i % colors.length];
    boidRenderer.noStroke();
    boidGroup.add(boidRenderer);

    boids.push(boid);
    boidRenderers.push(boidRenderer);
  }

  var flock = new Flock(boids /* , groups */);
  var lines = [];

  two.bind('update', function(frameCount) {
    flock.update();

    var boidA, boidB;
    var boidRenderer;
    var opacity, distance;
    var line;
    var lineIndex = 0;
    var i, j;

    for (i = 0; i < lines.length; i++) {
      lines[i].noStroke();
    }

    for (i = 0; i < boids.length; i++) {
      boidA = boids[i];
      boidA.neighbors = 0;
      boidA.update();
      boidA.wrap(width, height);

      boidRenderer = boidRenderers[i];
      boidRenderer.translation.set(boidA.position.x, boidA.position.y);

      for (j = 0; j < boids.length; j++) {
        if (i === j) {
          continue;
        }

        boidB = boids[j];

        distance = Vector.distance(boidA.position, boidB.position);
        if (distance > maxDistance) {
          continue;
        }

        // only draw particles with < max neighbors
        if (boidA.neighbors >= maxNeighbors) {
          continue;
        }

        opacity = (1 - (distance / maxDistance)) * 0.12;

        if (lineIndex < lines.length) {
          line = lines[lineIndex];
          line.translation.set(0, 0);
          line.vertices[line.beginning].set(boidA.position.x, boidA.position.y);
          line.vertices[line.ending].set(boidB.position.x, boidB.position.y);
          line.stroke = 'rgb(60, 60, 60)';
          line.opacity = opacity;
        } else {
          line = two.makeLine(boidA.position.x, boidA.position.y, boidB.position.x, boidB.position.y);
          line.stroke = 'rgb(60, 60, 60)';
          line.opacity = opacity;
          line.linewidth = pixelWidth / 2;
          lineGroup.add(line);
          lines.push(line);
        }

        lineIndex++;
        boidA.neighbors++;
      }

      if (boidA.neighbors > 0) {
        boidRenderer.fill = colors[i % colors.length];
      } else {
        boidRenderer.noFill();
      }
    }
  });

  two.play();

})();
