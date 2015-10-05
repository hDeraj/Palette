var KMeans = (function () {

  var ERR_K_IS_ZERO = 'k cannot be zero';

  /** Constructor */

  var kmeans = function () {
    this.kmpp = true;
    this.maxWidth = 640;
    this.maxHeight = 480;
    this.iterations = 0;
    this.converged = false;
    this.maxIterations = -1;
    this.k = 0;
  };

  /** Resets k-means. */

  kmeans.prototype.reset = function () {
    this.iterations = 0;
    this.converged = false;
    this.points = [];
    this.centroids = [];
  };

  /** Measures the Manhattan distance between two points. */

  kmeans.prototype.distance =  function(a, b) {
    return Math.abs(a.x - b.x) +  Math.abs(a.y - b.y) + Math.abs(a.z - b.z);
  };

  /** Resets k-means and sets initial points*/

  kmeans.prototype.setPoints = function (points) {
    this.reset();
    this.points = points;
  };

  /** Chooses random centroids */

  kmeans.prototype.chooseRandomCentroids = function () {
    for (var i = 0; i < this.k; ++i) {
      var centroid = {
        centroid : i,
        x : Math.floor(Math.random()*this.maxWidth),
        y : Math.floor(Math.random()*this.maxHeight),
        z : Math.floor(Math.random()*this.maxHeight),
        items : 0
      };
      this.centroids[i] = centroid;
    }
  };

  /** Clusters the provided set of points. */

  kmeans.prototype.cluster = function (callback) {

    if (this.k === 0) {
      if (typeof callback === 'function') {
        callback(new Error(ERR_K_IS_ZERO));
      } else {
        throw new Error(ERR_K_IS_ZERO);
      }
      return;
    }

    /** Iterate until converged or the maximum amount of iterations is reached. */

    while (!this.converged && (this.maxIterations > 0 && this.iterations <= this.maxIterations)) {
      this.iterate();
    }

    if (typeof callback === 'function') callback(null, this.centroids);
  };

  /** Measure the distance to a point, specified by its index. */

  kmeans.prototype.measureDistance =   function (i) {
    var self = this;
    return function ( centroid ) {
      return self.distance(centroid, self.points[i]);
    };
  };

  /** Iterates over the provided points one time */

  kmeans.prototype.iterate = function () {
    var i;
    console.log("iterating: "+this.iterations + " , " + new Date());

    /** When the result doesn't change anymore, the final result has been found. */
    if (this.converged === true) {
      return;
    }

    this.converged = true;

    ++this.iterations;

    /** Prepares the array of the  */

    var sums = new Array(this.k);

    for (i = 0; i < this.k; ++i) {
      sums[i] = { x : 0, y : 0, z : 0, items : 0 };
    }

    /** Find the closest centroid for each point */
    for (i = 0, l = this.points.length; i < l; ++i) {

      var centroid = 0;
      var minDist = this.distance(this.centroids[0],this.points[i]);
      var centroid2 = 1;
      var minDist2 = this.distance(this.centroids[1],this.points[i]);
      if(minDist2 < minDist){
          var temp = minDist2;
          minDist2 = minDist;
          minDist = temp;
          temp = centroid2;
          centroid2 = centroid;
          centroid = temp;
      }
      for(var j=2; j<this.centroids.length; j++){
        var dist = this.distance(this.centroids[j],this.points[i]);
        if(dist < minDist){
          centroid2 = centroid;
          minDist2 = minDist;
          centroid = j;
          minDist = dist;
        }else if(dist < minDist2){
          minDist2 = dist;
          centroid2 = j;
        }
      }

      /**
       * When the point is not attached to a centroid or the point was
       * attached to some other centroid before, the result differs from the
       * previous iteration.
       */

      if (typeof this.points[i].centroid  !== 'number' || this.points[i].centroid !== centroid) {
        this.converged = false;
      }

      /** Attach the point to the centroid */

      this.points[i].centroid = centroid;
      this.points[i].centroid2 = centroid2;


      /** Add the points' coordinates to the sum of its centroid */

      sums[centroid].x += this.points[i].x;
      sums[centroid].y += this.points[i].y;
      sums[centroid].z += this.points[i].z;

      ++sums[centroid].items;
    }

    /** Re-calculate the center of the centroid. */

    for (i = 0; i < this.k; ++i) {
      if (sums[i].items > 0) {
        this.centroids[i].x = sums[i].x / sums[i].items;
        this.centroids[i].y = sums[i].y / sums[i].items;
        this.centroids[i].z = sums[i].z / sums[i].items;
      }
      this.centroids[i].items = sums[i].items;
    }

  };

  return kmeans;
})();

if (typeof module === 'object') {
  module.exports = KMeans;
}
