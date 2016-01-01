(function() {
  "use strict";

  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  var Vector = window.Vector;

  window.distanceSeparation = 64;
  window.distanceAlignment = 128;
  window.distanceCohesion = 128;

  window.maxSeparation = 0.2;
  window.maxAlignment = 0.01;
  window.maxCohesion = 0.2;
  window.maxJitter = 0.2;

  function Flock(boids) {
    this.boids = boids;
  }

  Flock.prototype.update = function() {
    var boidA, boidB;
    var distance;
    var i, j;
    var separation, cohesion, alignment;
    var cohesionCount, alignmentCount;
    var diff;

    for (i = 0; i < this.boids.length; i++) {
      boidA = this.boids[i];

      separation = new Vector();

      cohesion = new Vector();
      cohesionCount = 0;

      alignment = new Vector();
      alignmentCount = 0;

      for (j = 0; j < this.boids.length; j++) {
        if (i === j) {
          // Ignore self
          continue;
        }

        boidB = this.boids[j];

        distance = Vector.distance(boidA.position, boidB.position);

        // cohesion - steer to move toward the average position (center of mass) of local flockmates
        if (distance <= distanceCohesion) {
          cohesion.add(boidB.position);
          cohesionCount++;
        }

        if (distance <= distanceSeparation) {
          separation.add(Vector.sub(boidA.position, boidB.position).multiplyScalar(1 / distance));
        }

        // alignment - steer towards the average heading of local flockmates
        if (distance <= distanceAlignment) {
          alignment.add(boidB.velocity.clone().normalize());
          alignmentCount++;
        }
      }

      if (cohesionCount > 0) { // average
        cohesion.divideScalar(cohesionCount);
        cohesion.sub(boidA.position);
      }

      if (alignmentCount > 0) { // average
        alignment.divideScalar(alignmentCount);
      }

      boidA.acceleration.add(separation.clamp(maxSeparation));
      boidA.acceleration.add(alignment.clamp(maxAlignment));
      boidA.acceleration.add(cohesion.clamp(maxCohesion));
      boidA.acceleration.add(this.jitter());
    }
  };

  Flock.prototype.jitter = function() {
    var x = Math.cos(randomRange(0, 2 * Math.PI));
    var y = Math.sin(randomRange(0, 2 * Math.PI));
    return new Vector(x, y).multiplyScalar(maxJitter);
  };

  window.Flock = Flock;

})();
