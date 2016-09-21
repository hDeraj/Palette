var img = document.getElementById("img");
var canvas = document.getElementById('canvas');

function setImage(s){
  img.src = s;
  canvas.width = img.width;
  canvas.height = img.height;
  canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
}

function updateCanvas(){
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
}

function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h, s, l];
}
function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [r * 255, g * 255, b * 255];
}

function rgbToHsv(r, g, b){
    r = r/255, g = g/255, b = b/255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if(max == min){
        h = 0; // achromatic
    }else{
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, v];
}

function hsvToRgb(h, s, v){
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch(i % 6){
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [r * 255, g * 255, b * 255];
}

function fileSelected(){
  var file = document.getElementById("fileToUpload").files[0];
  if(file){
    var reader = new FileReader();
    reader.onload = function(e){
      setImage(e.target.result);
    }
    reader.readAsDataURL(file);
  }
}

function calcCentroids(n){
  var unfiltered = [];
  var ctx = canvas.getContext('2d');
  if(canvas.width !== img.width){
    canvas.width = img.width;
    canvas.height = img.height;
  }
  ctx.drawImage(img, 0, 0, img.width, img.height);
  var raw = ctx.getImageData(0,0,img.width,img.height).data;

  kmeans = new KMeans();
  kmeans.setPoints(raw);
  kmeans.k = n;
  kmeans.maxIterations = 20;
  kmeans.chooseRandomCentroids();
  kmeans.cluster();

  return kmeans;
}

function runQuantized(n){
    var kmeans = calcCentroids(n)
    drawQuantized(kmeans);
}

function runSpeckled(n){
    var kmeans = calcCentroids(n)
    drawSpeckled(kmeans);
}

function drawQuantized(kmeans){
  var context = canvas.getContext('2d');
  var imageData = context.createImageData(canvas.width,canvas.height);
  for(var i=0; i<kmeans.points.length/5; i++){
    var cent = kmeans.points[i*5+3];
    imageData.data[i*4] = kmeans.centroids[cent*4];
    imageData.data[i*4+1] = kmeans.centroids[cent*4+1];
    imageData.data[i*4+2] = kmeans.centroids[cent*4+2];
    imageData.data[i*4+3] = 255;
  }
  context.putImageData(imageData,0,0);
}

function drawSpeckled(kmeans){
    var context = canvas.getContext('2d');
    var imageData = context.createImageData(canvas.width,canvas.height);
    for(var i=0; i<kmeans.points.length/5; i++){
      var cent1 = kmeans.points[i*5+3];
      var cent2 = kmeans.points[i*5+4];
      var choice = Math.random() > 0.1 ? cent1 : cent2;
      imageData.data[i*4] = kmeans.centroids[choice*4];
      imageData.data[i*4+1] = kmeans.centroids[choice*4+1];
      imageData.data[i*4+2] = kmeans.centroids[choice*4+2];
      imageData.data[i*4+3] = 255;
    }
    context.putImageData(imageData,0,0);
}
