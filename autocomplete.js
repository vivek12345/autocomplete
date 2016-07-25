(function() {
	var _ = function() {
		return {
			isBlankString: function(str) {
				return !str || /^\s*$/.test(str);
			},
			isString: function(obj) {
				return typeof obj === "string";
			},
			isNumber: function(obj) {
				return typeof obj === "number";
			},
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
			},
			addMultipleEventSources: function(el, sources, handler) {
				var sources = sources.split(' ');
				for(var i=0;i<sources.length;i++) {
					el.addEventListener(sources[i], handler);
				}
			},
			customEvent: function(name, optionalData, el) {
				var event; // The custom event that will be created
				if (document.createEvent) {
					event = document.createEvent("HTMLEvents");
					event.response = optionalData;
					event.initEvent(name, true, true);
				} else {
					event = document.createEventObject();
					event.response = optionalData;
					event.eventType = "HTMLEvents";
				}
				event.eventName = name;
				if (document.createEvent) {
					el.dispatchEvent(event);
				} else {
					el.fireEvent("on" + event.eventType, event);
				}
			}
		};
	}();
	var LruCache = function(maxSize) {
		this.maxSize = _.isNumber(maxSize) ? maxSize : 100;
		this.reset();
		if (this.maxSize <= 0) {
			this.set = this.get = null;
		}
	};
	LruCache.prototype.set = function set(key, val) {
		var tailItem = this.list.tail, node;
		if (this.size >= this.maxSize) {
			this.list.remove(tailItem);
			delete this.hash[tailItem.key];
		}
		if (node = this.hash[key]) {
			node.val = val;
			this.list.moveToFront(node);
		} else {
			node = new Node(key, val);
			this.list.add(node);
			this.hash[key] = node;
			this.size++;
		}
	};
	LruCache.prototype.get =  function(key) {
		var node = this.hash[key];
		if (node) {
			this.list.moveToFront(node);
			return node.val;
		}
	};
	LruCache.prototype.reset = function() {
			this.size = 0;
			this.hash = {};
			this.list = new List();
	};
	var List = function() {
		this.head = this.tail = null;
	};
	List.prototype.add = function(node) {
		if (this.head) {
			node.next = this.head;
			this.head.prev = node;
		}
		this.head = node;
		this.tail = this.tail || node;
	};
	List.prototype.remove = function(node) {
		node.prev ? node.prev.next = node.next : this.head = node.next;
		node.next ? node.next.prev = node.prev : this.tail = node.prev;
	};
	List.prototype.moveToFront = function(node) {
		this.remove(node);
		this.add(node);
	};
	var Node = function(key, val) {
		this.key = key;
		this.val = val;
		this.prev = this.next = null;
	};
	var Autocomplete = function(options) {
		var defaults = {
			url: null,
			cache: true,
			waitTime: 0,
		};
		this.options = _.extend(defaults, options || {});
		this.options.cache?this.cache = new LruCache(10):this.cache = null;
		this.attachEventHandlers();
	}
	Autocomplete.prototype.attachEventHandlers = function() {
		var _this = this;
		var events = 'keydown keypress cut paste';
		var el = document.querySelector(this.options.el);
		_.addMultipleEventSources(el, events, function(event) {
			if(event.type === 'keydown' || event.type === 'keypress') {
				if(event.keyCode == 40 || event.keyCode == 38) {
					console.log('fired');
					_.customEvent('focus', null, document.querySelector('.tt-suggestion'));
					return;
				}
			}
			_this.handleInputChangeEvent();
		});
		el.addEventListener('blur', _this.removeDropDownMenu);
	}
	Autocomplete.prototype.sendXhrRequest = function(query) {
		var _this = this;
		var xhr = new XMLHttpRequest();
		xhr.withCredentials = false;
		xhr.open('GET', this.options.url+'?term=' + query);
		xhr.onreadystatechange = function () {
			if (this.status == 200 && this.readyState == 4) {
				_this.cache.set(query, this.responseText);
				_this.handleResponse(this.responseText);
			}
		}
		xhr.send();
	}
	Autocomplete.prototype.handleInputChangeEvent = _.debounce(function() {
		this.fetchAutocompleteData();
	}, 200);
	Autocomplete.prototype.fetchAutocompleteData = function() {
		var query = document.querySelector(this.options.el).value.trim();
		(query.length > this.options.minLength)?((this.cache && this.cache.get(query))?this.handleResponse(this.cache.get(query)):this.sendXhrRequest(query)):null;
	};
	Autocomplete.prototype.removeDropDownMenu = function() {
		document.querySelector('.tt-dataset-1').remove();
	}
	Autocomplete.prototype.handleResponse = function(response) {
		var parsedResponse;
		try {
			parsedResponse = JSON.parse(response);
		} catch(exception) {
			parsedResponse = null;
		}
		var dropdownHtml = '<div class="tt-dataset-1"><span class="tt-suggestions" style="display:block;"></span></div>';
		var dropDownMenu = document.querySelector('.tt-dropdown-menu');
		dropDownMenu.innerHTML = dropdownHtml;
		document.querySelector('body').addEventListener('autocomplete:suggestions_displayed', this.attachKeyAndHoverEvents);
		_.customEvent("autocomplete:completed", parsedResponse.data, document.querySelector('body'));
	};
	Autocomplete.prototype.attachKeyAndHoverEvents = function(event) {
		var _this = this;
		var suggestions = document.querySelectorAll('.tt-suggestion');
		suggestions.forEach(function(suggestion) {
			suggestion.addEventListener('focus', function(event) {
				var node = this.parentNode.firstChild;
				while( node && node.nodeType === 1 ) {
					if(node !== this) {
						node.className = 'tt-suggestion';
					}
					node = node.nextElementSibling || node.nextSibling;
				}
				this.className = 'tt-suggestion tt-cursor';
			});
			suggestion.addEventListener('keypress', function(event) {
				console.log('fired');
				_.customEvent('focus', null, (this.nextElementSibling || this.nextSibling));
			});
		});
	}
	window.Autocomplete = Autocomplete;
})();
