(function () {
  "use strict";

  function Vector(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }

  Vector.prototype.toString = function () {
    return "(" + this.x + "," + this.y + ")";
  };

  Vector.prototype.add = function (vector) {
    this.x += vector.x;
    this.y += vector.y;
    return this;
  };

  Vector.prototype.sub = function (vector) {
    this.x -= vector.x;
    this.y -= vector.y;
    return this;
  };

  Vector.prototype.heading = function () {
    return -1 * Math.atan2(-this.y, this.x);
  };

  Vector.prototype.multiplyScalar = function (val) {
    this.x *= val;
    this.y *= val;
    return this;
  };

  Vector.prototype.divideScalar = function (val) {
    if (val > 0) {
      this.x /= val;
      this.y /= val;
    }
    return this;
  };

  Vector.prototype.magnitude = function () {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  };

  Vector.prototype.normalize = function () {
    var magnitude = this.magnitude();
    if (magnitude > 0) {
      this.x /= magnitude;
      this.y /= magnitude;
    }
    return this;
  };

  Vector.prototype.clamp = function (max) {
    if (this.magnitude() > max) {
      this.normalize();
      this.multiplyScalar(max);
    }
    return this;
  };

  Vector.prototype.clone = function () {
    return new Vector(this.x, this.y);
  };

  Vector.dot = function (a, b) {
    return a.x * b.x + a.y * b.y;
  };

  Vector.add = function (a, b) {
    return a.clone().add(b);
  };

  Vector.sub = function (a, b) {
    return a.clone().sub(b);
  };

  Vector.distance = function (a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  };

  window.Vector = Vector;
})();
