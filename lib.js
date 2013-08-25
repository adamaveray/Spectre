// https://gist.github.com/mikelikespie/641528
var $c = {};
(
 function () {
 function Lab (l, a, b) {
    this.l = l;
    this.a = a;
    this.b = b;
  }
 
  function XYZ (x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
 
  function sRGBLinear (r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
 
  function sRGBPrime (r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  function sRGB8 (r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
 
  $c.sRGB8 = function (r,g,b) {
    return new sRGB8(r,g,b);
  };
 
  var D65 = new XYZ(0.9504, 1.0000, 1.0888);
 
  function _XYZf(t) {
    if (t > 0.008856) {
      return Math.pow(t, 1.0/3.0);
    } else {
      return 7.787 * t + 16.0/116.0;
    }
  }
 
  XYZ.prototype.Lab = function () {
    var x_xn = this.x / D65.x;
    var y_yn = this.y / D65.y;
    var z_zn = this.z / D65.z;
 
    var f_x_xn = _XYZf(x_xn);
    var f_y_yn = _XYZf(y_yn);
    var f_z_zn = _XYZf(z_zn);
 
 
    return new Lab (
          y_yn > 0.008856 ?
             116.8 * Math.pow(y_yn, 1.0/3.0) - 16 :
             903.3 * y_yn,
          500.0 * (f_x_xn - f_y_yn),
          200.0 * (f_y_yn - f_z_zn)
        );
  };

 
  var RGB_TO_XYZ = [
    [0.412453, 0.357580, 0.180423],
    [0.212671, 0.715160, 0.072169],
    [0.019334, 0.119193, 0.950227]
  ];
 
  sRGBLinear.prototype.XYZ = function () {
    return new XYZ (
        this.r * RGB_TO_XYZ[0][0] + this.g * RGB_TO_XYZ[0][1] + this.b * RGB_TO_XYZ[0][2],
        this.r * RGB_TO_XYZ[1][0] + this.g * RGB_TO_XYZ[1][1] + this.b * RGB_TO_XYZ[1][2],
        this.r * RGB_TO_XYZ[2][0] + this.g * RGB_TO_XYZ[2][1] + this.b * RGB_TO_XYZ[2][2]
        );
  };
 
  var ALPHA = 0.055;

 
  function _logToLinear(c) {
    if ( c <= 0.04045) {
      return c / 12.92;
    } else {
      return Math.pow((c + ALPHA) / (1 + ALPHA), 2.4);
    }
  }
 
 
  sRGBPrime.prototype.sRGBLinear = function () {
    return new sRGBLinear(
        _logToLinear(this.r),
        _logToLinear(this.g),
        _logToLinear(this.b)
        );
  };
 
  sRGB8.prototype.sRGBPrime = function () {
    return new sRGBPrime(
        this.r/255.0,
        this.g/255.0,
        this.b/255.0
        );
  };
 
  sRGB8.prototype.Lab = function () {
    return this.sRGBPrime().sRGBLinear().XYZ().Lab();
  };
})();

