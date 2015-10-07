var KMeans = (function () {

  var ERR_K_IS_ZERO = 'k cannot be zero';

  /** Constructor */

  var kmeans = function () {
    this.kmpp = true;
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
    return Math.abs(this.centroids[a]   - this.points[b]) +
           Math.abs(this.centroids[a+1] - this.points[b+1]) +
           Math.abs(this.centroids[a+2] - this.points[b+2]);
  };

  /** Resets k-means and sets initial points*/

  kmeans.prototype.setPoints = function (points) {
    this.reset();
    this.points = Array(points.length/4 * 5);
    for(var i=0; i<points.length/4; i++){
        this.points[i*5] = points[i*4];
        this.points[i*5+1] = points[i*4+1];
        this.points[i*5+2] = points[i*4+2];
        this.points[i*5+3] = -1;
        this.points[i*5+4] = 0;
    }
  };

  /** Chooses random centroids */

  kmeans.prototype.chooseRandomCentroids = function () {
    this.centroids = Array(this.k*4);
    for (var i = 0; i < this.k; i++) {
        var randomIndex = Math.floor(Math.random()*this.points.length/5);
        this.centroids[i*4+0] = this.points[randomIndex*5];
        this.centroids[i*4+1] = this.points[randomIndex*5+1];
        this.centroids[i*4+2] = this.points[randomIndex*5+2];
        this.centroids[i*4+3] = 0;
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

  /** Iterates over the provided points one time */

  kmeans.prototype.iterate = function () {
    var i;
    /** When the result doesn't change anymore, the final result has been found. */
    if (this.converged === true) {
      return;
    }

    this.converged = true;

    this.iterations++;

    /** Prepares the array of the sums */

    // items in form [x,y,z,items]
    var sums = new Array(this.k);

    for (i = 0; i < this.k; i++) {
      sums[i] = [0,0,0,0];
    }

    /** Find the closest centroid for each point */
    for (i = 0, l = this.points.length/5; i < l; i++) {

      var centroid = 0;
      var minDist = this.distance(0, i*5);
      var centroid2 = 1;
      var minDist2 = this.distance(1*4,i*5);
      if(minDist2 < minDist){
          var temp = minDist2;
          minDist2 = minDist;
          minDist = temp;
          temp = centroid2;
          centroid2 = centroid;
          centroid = temp;
      }

      for(var j=2; j<this.centroids.length/4; j++){
        var dist = this.distance(j*4,i*5);
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
       * When the point was attached to some other centroid before,
       * the result differs from the previous iteration.
       */

      if (this.points[i*5+3] !== centroid) {
        this.converged = false;
      }

      /** Attach the point to the centroid */

      this.points[i*5+3] = centroid;
      this.points[i*5+4] = centroid2;


      /** Add the points' coordinates to the sum of its centroid */

      sums[centroid][0] += this.points[i*5];
      sums[centroid][1] += this.points[i*5+1];
      sums[centroid][2] += this.points[i*5+2];

      sums[centroid][3]++;
    }

    /** Re-calculate the center of the centroid. */

    for (i = 0; i < this.k; i++) {
      if (sums[i][3] > 0) {
        this.centroids[i*4]   = sums[i][0] / sums[i][3];
        this.centroids[i*4+1] = sums[i][1] / sums[i][3];
        this.centroids[i*4+2] = sums[i][2] / sums[i][3];
      }
      this.centroids[i*4+3] = sums[i][3];
    }

  };

  return kmeans;
})();

if (typeof module === 'object') {
  module.exports = KMeans;
}
