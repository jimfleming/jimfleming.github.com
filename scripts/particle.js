(function() {

  window.maxSpeed = 7.0;

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

  window.Particle = Particle;

}).call(this);
