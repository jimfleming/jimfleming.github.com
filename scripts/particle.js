(function() {
  "use strict";

  window.maxSpeed = 4.0;

  var Vector = window.Vector;

  function wrap(x, min, max) {
    if (x < min) {
      x = max;
    } else if (x > max) {
      x = min;
    }
    return x;
  }

  function Particle(point, velocity, acceleration) {
    this.position = point || new Vector(0, 0);
    this.velocity = velocity || new Vector(0, 0);
    this.acceleration = acceleration || new Vector(0, 0);
  }

  Particle.prototype.update = function() {
    this.velocity.add(this.acceleration);
    this.velocity.clamp(maxSpeed);

    this.position.add(this.velocity);

    this.acceleration.multiplyScalar(0);
  };

  Particle.prototype.wrap = function(xMax, yMax) {
    this.position.x = wrap(this.position.x, 0, xMax);
    this.position.y = wrap(this.position.y, 0, yMax);
  };

  window.Particle = Particle;

})();
