(function () {
  "use strict";

  var Vector = window.Vector;

  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  function Centroid(xMax, yMax) {
    this.xMax = xMax;
    this.yMax = yMax;
    this.mean = new Vector(randomRange(0, xMax), randomRange(0, yMax));
    this.observations = [];
  }

  Centroid.prototype.update = function () {
    if (this.observations.length === 0) {
      this.mean = new Vector(
        randomRange(0, this.xMax),
        randomRange(0, this.yMax)
      );
      return;
    }

    this.mean = new Vector();
    for (var i = 0; i < this.observations.length; i++) {
      this.mean.add(this.observations[i]);
    }
    this.mean = this.mean.divideScalar(this.observations.length);
  };

  Centroid.prototype.clear = function () {
    this.observations.length = 0;
  };

  window.Centroid = Centroid;
})();
