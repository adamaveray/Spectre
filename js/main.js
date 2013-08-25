(function($, w, undefined){
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

		$e.css('color', '#'+color.getShade(75).getHex());
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
		});

	}).fail(function(){
	});
}(jQuery, window));

