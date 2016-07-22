(function() {
	var _ = function() {
		return {
			debounce: function(func, wait, immediate) {
				var timeout, result;
				return function() {
					var context = this, args = arguments, later, callNow;
					later = function() {
						timeout = null;
						if (!immediate) {
							result = func.apply(context, args);
						}
					};
					callNow = immediate && !timeout;
					clearTimeout(timeout);
					timeout = setTimeout(later, wait);
					if (callNow) {
						result = func.apply(context, args);
					}
					return result;
				};
			},
			extend: function(destination, source) {
				for(var key in source) {
					if(source.hasOwnProperty(key)) {
						destination[key] = source[key];
					}
				}
				return destination;
			}
		};
	}();
	var Typeahead = function(options) {
		var defaults = {
			url: null,
			cache: true,
			waitTime: 0,
		};
		this.options = _.extend(defaults, options || {});
		this.debouncedFunction = this.handleKeyUpEvent();
		this.attachEventHandlers();
	}
	Typeahead.prototype.attachEventHandlers = function() {
		var _this = this;
		$(this.options.el).on('keyup', _this.debouncedFunction(_this.fetchTypeaheadData));
	}
	Typeahead.prototype.sendXhrRequest = function(query) {
		var _this = this;
		var xhr = new XMLHttpRequest();
		xhr.withCredentials=true;
		xhr.open('GET', this.options.url+'?term=' + query);
		xhr.onreadystatechange = function () {
			if (this.status == 200 && this.readyState == 4) {
				console.log('response: ' + this.responseText);
			}
		}
		xhr.send();
	}
	Typeahead.prototype.handleKeyUpEvent = function() {
		return function(fn) {
			_.debounce(fn, 2000);
		}
	}

	Typeahead.prototype.fetchTypeaheadData = function(event) {
		var query = $(this.options.el).val();
		this.sendXhrRequest(query);
	}
	window.Typeahead = Typeahead;
})();
