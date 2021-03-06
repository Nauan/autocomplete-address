;(function ( $, window, document, undefined ) {
	var pluginName = "autocompleteAddress",
			defaults = {
			publicAPI: "http://cep.correiocontrol.com.br/{{cep}}.json",
			address: "",
			neighborhood: "",
			city: "",
			state: ""
	};

	// The actual plugin constructor
	function Plugin ( element, options ) {
			this.element = element;
			this.settings = $.extend( {}, defaults, options );
			this._defaults = defaults;
			this._name = pluginName;
			this.init();
	}

	$.extend(Plugin.prototype, {
			init: function () {
				self = this;
				$cep = $(this.element);
				$address = this.getData("autocomplete-address");
				$neighborhood = this.getData("autocomplete-neighborhood");
				$city = this.getData("autocomplete-city");
				$state = this.getData("autocomplete-state");
				currentCep = $cep.val();
				if($cep.mask){
					$cep.mask("99999-999");
				}
				$cep.blur(function(){
					if(currentCep !== $cep.val()){
						currentCep = $cep.val();
						self.sendRequest();
					}

				});
			},
			getData: function(data){
				// fallback system to get the fields

				// first checks if parameter was passed
				var result = $(this.settings[data.replace("autocomplete-","")]);
				if(result.length === 0){
					// verifies that was specified by class
					result = $("."+data);
					if(result.length === 0){
						// verifies that was specified by data-attribute
						result = $("[data-" + data + "]");
					}
				}
				return result;
			},
			// send the ajax request to public api
			sendRequest: function () {
				 $.ajax({
					url: this.settings.publicAPI.replace("{{cep}}",currentCep),
					type:"GET",
					dataType: "json",
					success: function(response){
						self.bindValues(response);
					}
				});
			},
			// sends the response data to the respective fields
			bindValues: function(values){
				$address.val(values.logradouro);
				$neighborhood.val(values.bairro);
				$city.val(values.localidade);
				$state.val(values.uf);
				$state.children("option:contains('"+values.uf+"')").attr("selected", "selected");
				this.checkStatusField([$address,$neighborhood,$city,$state]);
			},
			checkStatusField: function(fields){
				var i = fields.length;
				while(i--){
					if(fields[i].length > 0 && $(fields[i]).val().match(/[a-z]/i)){
						$(fields[i]).addClass("disabled").attr("readonly","readonly");
					} else {
						$(fields[i]).removeClass("disabled").removeAttr("readonly","readonly");
					}
				}
			}
	});

	$.fn[ pluginName ] = function ( options ) {
			this.each(function() {
					if ( !$.data( this, "plugin_" + pluginName ) ) {
							$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
					}
			});
			return this;
	};
})( jQuery, window, document );