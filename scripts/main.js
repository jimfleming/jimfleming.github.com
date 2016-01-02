(function() {
  "use strict";

  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  var Vector = window.Vector;
  var Flock = window.Flock;
  var Particle = window.Particle;
  var Centroid = window.Centroid;

  var showCentroids = false;
  var maxDistance = 72;
  var pixelWidth = 1.5;
  var maxNeighbors = 5;

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
    boid.centroid = i % colors.length;

    boidRenderer = two.makeRectangle(position.x, position.y, pixelWidth * 3, pixelWidth * 3);
    boidRenderer.fill = colors[boid.centroid];
    boidRenderer.noStroke();
    boidGroup.add(boidRenderer);

    boids.push(boid);
    boidRenderers.push(boidRenderer);
  }

  var centroids = [];
  var centroid;
  if (showCentroids) {
    var centroidRenderer;
    var centroidGroup = two.makeGroup();
  }
  for (var i = 0; i < colors.length; i++) {
    centroid = new Centroid(width, height);
    centroids.push(centroid);

    if (showCentroids) {
      centroidRenderer = two.makeCircle(centroid.mean.x, centroid.mean.y, 10);
      centroidRenderer.fill = colors[i];
      centroidRenderer.noStroke();
      centroidGroup.add(centroidRenderer);
    }
  }

  var flock = new Flock(boids, centroids);
  var lines = [];

  two.bind('update', function(frameCount) {
    flock.update();

    var boidA, boidB;
    var boidRenderer;
    var opacity, distance;
    var line;
    var lineIndex = 0;
    var i, j;

    if (showCentroids) {
      var centroid, centroidRenderer;
      for (i = 0; i < centroids.length; i++) {
        centroidRenderer = centroidGroup.children[i];
        centroid = centroids[i];
        centroidRenderer.translation.set(centroid.mean.x, centroid.mean.y);
      }
    }

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
          line.linewidth = pixelWidth;
          lineGroup.add(line);
          lines.push(line);
        }

        lineIndex++;
        boidA.neighbors++;
      }

      if (boidA.neighbors > 0) {
        boidRenderer.fill = colors[boidA.centroid];
      } else {
        boidRenderer.noFill();
      }
    }
  });

  two.play();

})();
