(function($, w, undefined){
	var $body	= $('body'),
		outputs	= {
			source:	$('#color-source'),
			spec:	$('#color-spec')
		},
		$styleTemplate,
		styleTemplate;



	var updateTheme	= function(color){
		if(!$styleTemplate){
			styleTemplate || (styleTemplate = $('#template-recolor').html());
			$styleTemplate	= $('<style/>').appendTo($('head'));
		}

		var renderTemplate	= function(template, values){
			var output	= template;
			for(var name in values){
				output	= output.replace(new RegExp('\{\{ '+name+' \}\}', 'g'), values[name])
			}
			return output;
		};

		var rgb	= color.getRGB(),
			lightDiff	= color.distanceFrom(new Color('#fff', Color.types.hex)),
			isLight	= lightDiff < 15;

		$styleTemplate.html(renderTemplate(styleTemplate, {
			color:	'#'+color.getHex(),
			colorLight:		'#'+color.getShade(45).getHex(),
			colorLighter:	'#'+color.getShade(55).getHex()
		}));

		if(isLight){
			$body.addClass('darkened');
		} else {
			$body.removeClass('darkened');
		}
	};


	var showColor	= function(color, type, name){
		updateTheme(color);

		var isSingle	= false;
		if(type === 'single'){
			isSingle	= true;
			type	= 'source';
		}

		var $e	= outputs[type],
			$name	= $e.children('.name'),
			values	= {
				hex:	$e.find('.value-hex').children(),
				rgb:	$e.find('.value-rgb').children()
			};

		if(name){
			$name.text(name)
				 .show();
		} else {
			$name.hide();
		}

		var hex	= '#'+color.getHex(),
			rgb	= color.getRGB();
		values.hex.text(hex);
		values.rgb.text('rgb('+rgb.r+','+rgb.g+','+rgb.b+')');

		// Update colours
		$e.css('background-color', hex);
		$e.css('color', '#'+color.getShade(75).getHex());

		if(isSingle){
			$e.parent().addClass('single');
		} else {
			$e.parent().removeClass('single');
		}
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

			if(color.getHex() === closest.color.getHex()){
				// Exact match
				showColor(color, 'single', closest.name);
			} else {
				// Closest match
				showColor(color, 'source');
				showColor(closest.color, 'spec', closest.name);
			}
		};

		function randomHex(){
			var output	= '';
			for(var i = 0; i < 3; i++){
				var item	= Math.floor(Math.random() * 255).toString(16);
				output	+= (item.length === 1 ? '0' : '')+item;
			}
			return output;
		}

		update(new Color('#'+randomHex(), Color.types.hex));


		var $input	= $('#color-value');
		$input.inputFocus()
			  .keydown(function(e){
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
					var matches	= /^(?:rgba?)?\(?(\d{1,3}), ?(\d{1,3}), ?(\d{1,3})(?:, ?\d{1,3})?\)?$/i.exec(val);
					if(matches){
						// Valid rgb
						color	= new Color([matches[1], matches[2], matches[3]], Color.types.rgb);
					} else {
						val	= val.toLowerCase();
						if(typeof colors[val] !== 'undefined'){
							// Valid named color
							color	= colors[val];
						}
					}
				}


				if(!color){
					// No color found in input
					return;
				}

				update(color);
			}, 0);
		}).change(function(){
			$input.trigger('keydown');
		});

	}).fail(function(){
	});
}(jQuery, window));

