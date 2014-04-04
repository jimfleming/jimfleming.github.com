(function() {

  window.distanceSeparation = 64;
  window.distanceAlignment = 128;
  window.distanceCohesion = 128;

  window.maxSeparation = 0.2;
  window.maxAlignment = 0.01;
  window.maxCohesion = 0.2;
  window.maxJitter = 0.2;

  window.maxFlocking = 0.8;

  function Flock(boids) {
    this.boids = boids;
  }

  Flock.prototype.update = function() {
    this.maxFlockSize = this.boids.length * maxFlocking;

    var boid;
    for (var i = 0; i < this.boids.length; i++) {
      boid = this.boids[i];
      boid.acceleration.add(this.separation(boid));
      boid.acceleration.add(this.alignment(boid));
      boid.acceleration.add(this.cohesion(boid));
      boid.acceleration.add(this.jitter());
    }
  }

  Flock.prototype.jitter = function() {
    var x = Math.cos(randomRange(0, 2 * Math.PI));
    var y = Math.sin(randomRange(0, 2 * Math.PI));
    return new Vector(x, y).multiplyScalar(maxJitter);
  }

  // cohesion - steer to move toward the average position (center of mass) of local flockmates
  Flock.prototype.cohesion = function(boid) {
    var cohesion = new Vector();
    var count = 0;
    var other;
    var distance;

    for (var i = 0; i < this.boids.length; i++) {
      other = this.boids[i];

      if (boid == other) {
        // Ignore self
        continue;
      }

      distance = Vector.distance(boid.position, other.position);
      if (distance > distanceCohesion) {
        // Max distance
        continue;
      }

      if (count > this.maxFlockSize) {
        break;
      }

      cohesion.add(other.position);
      count++;
    }

    if (count > 0) {
      // Average
      cohesion.divideScalar(count);
      cohesion.sub(boid.position);
    }

    return cohesion.clamp(maxCohesion);
  }

  // alignment - steer towards the average heading of local flockmates
  Flock.prototype.alignment = function(boid) {
    var alignment = new Vector();
    var count = 0;
    var other;
    var distance;

    for (var i = 0; i < this.boids.length; i++) {
      other = this.boids[i];

      if (boid == other) {
        // Ignore self
        continue;
      }

      distance = Vector.distance(boid.position, other.position);
      if (distance > distanceAlignment) {
        // Max distance
        continue;
      }

      if (count > this.maxFlockSize) {
        break;
      }

      alignment.add(other.velocity.clone().normalize());
      count++;
    }

    if (count > 0) {
      // Average
      alignment.divideScalar(count);
    }

    return alignment.clamp(maxAlignment);
  }

  // separation - steer to avoid crowding local flockmates
  Flock.prototype.separation = function(boid) {
    var separation = new Vector();
    var other;
    var distance;
    var count = 0;

    for (var i = 0; i < this.boids.length; i++) {
      other = this.boids[i];

      if (boid == other) {
        // Ignore self
        continue;
      }

      distance = Vector.distance(boid.position, other.position);
      if (distance > distanceSeparation) {
        // Max distance
        continue;
      }

      if (count > this.maxFlockSize) {
        break;
      }

      var diff = Vector.sub(boid.position, other.position);
      // diff.add(other.velocity.clone().normalize());
      diff.multiplyScalar(1 / distance);

      separation.add(diff);
      count++;
    }

    return separation.clamp(maxSeparation);
  }

  window.Flock = Flock;

}).call(this);
