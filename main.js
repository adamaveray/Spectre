(function($, w){
	// Based off https://gist.github.com/mikelikespie/641528
	var rgbToLab	= (function(rgb){
		var D65	= {
				x:	0.9504,
				y:	1.0000,
				z:	1.0888
			},
			rgbToXYZ = [
				[0.412453, 0.357580, 0.180423],
				[0.212671, 0.715160, 0.072169],
				[0.019334, 0.119193, 0.950227]
			],
			alpha	= 0.055;

		function _XYZf(t){
			if(t > 0.008856){
				return Math.pow(t, 1.0/3.0);
			} else {
				return 7.787 * t + 16.0/116.0;
			}
		}


		function _logToLinear(c){
			if(c <= 0.04045){
				return c / 12.92;
			} else {
				return Math.pow((c + alpha) / (1 + alpha), 2.4);
			}
		}

		return function(rgb){
			// To sRGBLinear
			rgb	= {
				r:	_logToLinear(rgb.r/255.0),
				g:	_logToLinear(rgb.g/255.0),
				b:	_logToLinear(rgb.b/255.0)
			};

			// To XYZ
			var xyz	= {
				x:	rgb.r * rgbToXYZ[0][0] + rgb.g * rgbToXYZ[0][1] + rgb.b * rgbToXYZ[0][2],
				y:	rgb.r * rgbToXYZ[1][0] + rgb.g * rgbToXYZ[1][1] + rgb.b * rgbToXYZ[1][2],
				z:	rgb.r * rgbToXYZ[2][0] + rgb.g * rgbToXYZ[2][1] + rgb.b * rgbToXYZ[2][2]
			};

			// To Lab
			var n	= {
					x:	xyz.x / D65.x,
					y:	xyz.y / D65.y,
					z:	xyz.z / D65.z
				},
				f	= {
					x:	_XYZf(n.x),
					y:	_XYZf(n.y),
					z:	_XYZf(n.z)
				};

			return {
				l:	n.y > 0.008856
					? 116.8 * Math.pow(n.y, 1.0/3.0) - 16
					: 903.3 * n.y,
				a:	500.0 * (f.x - f.y),
				b:	200.0 * (f.y - f.z)
			};
		};
	}());

	var Color	= (function(){
		var fn	= (function(value, type){
			var self	= {
				data:	{},


				init:	function(){
					switch(type){
						case Color.types.hex:
							if(value.substr(0, 1) === '#'){
								value	= value.substr(1);
							}

							if(value.length === 3){
								// Short version
								value	= value.replace(/([a-f\d])([a-f\d])([a-f\d])/i, '$1$1$2$2$3$3');
							}

							self.data.color	= self.hexToDec(value);
							break;

						case Color.types.rgb:
							if(value instanceof Array){
								// Indexed values
								value	= {
									r:	value[0],
									g:	value[1],
									b:	value[2]
								};
							}

							// Named values
							self.data.color	= {
								r:	parseInt(value.r, 10),
								g:	parseInt(value.g, 10),
								b:	parseInt(value.b, 10)
							};
							break;
					}
				},


				toString:	function(){
					return '('+self.data.color.r+','+self.data.color.g+','+self.data.color.b+')';
				},


				hexToDec:	function(hex){
					var result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
					return result ? {
						r: parseInt(result[1], 16),
						g: parseInt(result[2], 16),
						b: parseInt(result[3], 16)
					} : null;
				},
				decToHex:	function(dec){
				    var hex	= dec.toString(16);
				    return (hex.length == 1 ? '0'+hex : hex);
				},

				getHex:	function(){
					return self.decToHex(self.data.color.r) + self.decToHex(self.data.color.g) + self.decToHex(self.data.color.b);
				},
				getRGB:	function(){
					return self.data.color;
				},

				getLab:	function(){
					var lab	= rgbToLab(self.getRGB());
					return {
						l:	lab.l,
						a:	lab.a,
						b:	lab.b
					};
				},


				blackIsContrast:	function(){
					var rgb	= self.getRGB(),
						yiq	= ((rgb.r*299)+(rgb.g*587)+(rgb.b*114))/1000;

					return (yiq >= 128 ? true : false);
				},

				// Based off https://github.com/iuliux/CIE94.js/blob/master/cie94.js
				distanceFrom:	function(color){
					var lab1	= self.getLab(),
						lab2	= color.getLab();

					var kl = 2.0, k1 = 0.048, k2 = 0.014;

					// Fix for 0-brightness values
					(lab1.b > 0 || (lab1.b = 0.0000000001));
					(lab2.b > 0 || (lab2.b = 0.0000000001));

					var dL = lab1.l - lab2.l,
						C1 = Math.sqrt(lab1.a*lab1.a + lab1.b*lab1.b),
						C2 = Math.sqrt(lab2.a*lab2.a + lab2.b*lab2.b),
						dCab = C1 - C2,
						da = lab1.a - lab2.a,
						db = lab1.b - lab2.b,
						dHab = Math.sqrt(da*da + db*db - dCab*dCab),
						E = Math.sqrt(Math.pow(dL / kl, 2) +
								Math.pow(dCab / (1 + k1 * C1), 2) +
								Math.pow(dHab / (1 + k2 * C1), 2));
					return E;
				}
			};

			self.init();

			// Public API
			return {
				toString:	self.toString,

				getHex:	self.getHex,
				getRGB:	self.getRGB,
				getLab:	self.getLab,

				blackIsContrast:	self.blackIsContrast,

				distanceFrom:	self.distanceFrom
			};
		});

		fn.types	= {
			hex:	'hex',
			rgb:	'rgb'
		};

		return fn;
	}());


	var outputs	= {
		source:	$('#color-source'),
		spec:	$('#color-spec')
	};

	var showColor	= function(color, type, name){
		var $e	= outputs[type],
			$name	= $e.children('.name'),
			$value	= $e.children('.value');
		if(name){
			$name.text(name);
		} else {
			$name.hide();
		}

		var hex	= '#'+color.getHex();
		$value.text(hex);
		$e.css('background-color', hex);

		$e.addClass(color.blackIsContrast() ? 'is-light' : 'is-dark');
		$e.removeClass(color.blackIsContrast() ? 'is-dark' : 'is-light');
	};

	// Load colors
	$.getJSON('color-spec.json', function(data){
		// Load color values
		var colors	= {};
		for(var name in data){
			var hex	= data[name];

			colors[name]	= new Color(hex, Color.types.hex);
		}



		var update	= function(color){
			// Compare
			var closest	= {
				distance:	null
			};
			for(var name in colors){
				var distance	= color.distanceFrom(colors[name]);
				if(closest.distance === null || closest.distance > distance){
					// New closest color
					closest	= {
						name:		name,
						color:		colors[name],
						distance:	distance
					};
				}
			}

			showColor(color, 'source');
			showColor(closest.color, 'spec', closest.name);
		};

		update(new Color('#000000', Color.types.hex));


		var $input	= $('#color');
		$input.keydown(function(e){
			if(e.keyCode === 13){
				// Enter key
				e.preventDefault();
			}

			w.setTimeout(function(){
				var val		= $input.val(),
					color;
				if(val.match(/^#?([a-f\d]{3}(?:[a-f\d]{3})?)$/i)){
					// Valid hex
					color	= new Color(val, Color.types.hex);

				} else {
					var matches	= /^(?:rgb)?\(?(\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?$/i.exec(val);
					if(!matches){
						// Unknown
						return
					}

					// Valid rgb
					color	= new Color([matches[1], matches[2], matches[3]], Color.types.rgb);
				}

				update(color);
			}, 0);
		});

	}).fail(function(){
	});
}(jQuery, window));

