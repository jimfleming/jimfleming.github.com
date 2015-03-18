(function() {
  "use strict";

  var Vector = window.Vector;

  function Quad(topLeft, bottomRight) {
    this.topLeft = topLeft;
    this.bottomRight = bottomRight;
    this.children = [];
  }

  Quad.prototype.getCenter = function() {
    var halfW = (this.bottomRight.x - this.topLeft.x) / 2;
    var halfH = (this.bottomRight.y - this.topLeft.y) / 2;
    return new Vector(this.topLeft.x + halfW, this.topLeft.y + halfH);
  };

  Quad.prototype.contains = function(v) {
    return v.x > this.topLeft.x && v.x < this.bottomRight.x && v.y > this.topLeft.y && v.y < this.bottomRight.y;
  };

  Quad.prototype.reset = function() {
    this.isDirty = false;
    var child;
    for (var i = 0; i < this.children.length; i++) {
      child = this.children[i];
      child.reset();
    }
  };

  Quad.prototype.dirty = function(v) {
    var child;
    for (var i = 0; i < this.children.length; i++) {
      child = this.children[i];
      child.dirty(v);
    }
    this.isDirty = this.isDirty || this.contains(v);
  };

  Quad.prototype.clear = function(ctx) {
    if (this.isDirty) {
      if (this.children.length > 0) {
        var child;
        for (var i = 0; i < this.children.length; i++) {
          child = this.children[i];
          child.clear(ctx);
        }
      } else {
        var w = this.bottomRight.x - this.topLeft.x;
        var h = this.bottomRight.y - this.topLeft.y;
        ctx.clearRect(this.topLeft.x, this.topLeft.y, w, h);
      }
    }
  };

  Quad.prototype.subdivide = function(subdivisions) {
    if (!subdivisions) {
      this.children = [];
      return;
    }

    var extentX = this.bottomRight.x - this.topLeft.x;
    var extentY = this.bottomRight.y - this.topLeft.y;

    this.children = [
      new Quad(
        Vector.add(this.topLeft, new Vector(0, 0)),
        Vector.add(this.topLeft, new Vector(extentX / 2, extentY / 2))
      ),
      new Quad(
        Vector.add(this.topLeft, new Vector(extentX / 2, 0)),
        Vector.add(this.topLeft, new Vector(extentX, extentY / 2))
      ),
      new Quad(
        Vector.add(this.topLeft, new Vector(0, extentY / 2)),
        Vector.add(this.topLeft, new Vector(extentX / 2, extentY))
      ),
      new Quad(
        Vector.add(this.topLeft, new Vector(extentX / 2, extentY / 2)),
        Vector.add(this.topLeft, new Vector(extentX, extentY))
      )
    ];

    for (var i = 0; i < this.children.length; i++) {
      this.children[i].subdivide(subdivisions - 1);
    }
  };

  window.Quad = Quad;

})();
