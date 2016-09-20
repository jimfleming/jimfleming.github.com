(function() {
  "use strict";

  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  let Vector = window.Vector;
  let Flock = window.Flock;
  let Particle = window.Particle;
  let Centroid = window.Centroid;

  let showCentroids = false;
  let maxDistance = 72;
  let pixelWidth = 1.5;
  let maxNeighbors = 5;

  let minWidth = 640;

  let width = window.innerWidth;
  let height = window.innerHeight;

  if (width > minWidth) {
    width /= 2;
  }

  let el = document.getElementById('draw');
  let params = {
    width: width,
    height: height,
    type: Two.Types.canvas
  };
  let two = new Two(params).appendTo(el);
  let colors = ['#66cc70', '#73c6e5', '#e573b6', '#e5e073', '#e5ac73'];

  let boids = [];
  let boidRenderers = [];
  let position, velocity;

  let particleCount = Math.floor(Math.sqrt(width * height) / 10);
  let boid, boidRenderer;
  let lineGroup = two.makeGroup();
  let boidGroup = two.makeGroup();

  for (let i = 0; i < particleCount; i++) {
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

  let centroids = [];
  let centroid;
  let centroidRenderer;

  let centroidGroup = two.makeGroup();
  centroidGroup.opacity = 0;

  for (let i = 0; i < colors.length; i++) {
    centroid = new Centroid(width, height);
    centroids.push(centroid);

    centroidRenderer = two.makeCircle(centroid.mean.x, centroid.mean.y, 10);
    centroidRenderer.fill = colors[i];
    centroidRenderer.noStroke();
    centroidGroup.add(centroidRenderer);
  }

  let toggle = document.getElementById('toggle-centroids');
  toggle.addEventListener('click', function(e) {
    e.preventDefault();
    showCentroids = !showCentroids;

    if (showCentroids) {
      centroidGroup.opacity = 1;
    } else {
      centroidGroup.opacity = 0;
    }
  });

  let flock = new Flock(boids, centroids);
  let lines = [];

  two.bind('update', function(frameCount) {
    flock.update();

    let boidA, boidB;
    let boidRenderer;
    let opacity, distance;
    let line;
    let lineIndex = 0;
    let i, j;

    if (showCentroids) {
      let centroid, centroidRenderer;
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
