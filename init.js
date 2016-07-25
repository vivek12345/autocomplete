window.onload = function(){
	//document load function goes here
	init();
}
var event; // The custom event that will be created
function createEvent(name, optionalData) {
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
		document.body.dispatchEvent(event);
	} else {
		document.body.fireEvent("on" + event.eventType, event);
	}
}

function init(){
	var autocomplete_object = new Autocomplete({
		el : '#searchval',
		url: 'http://www.craftsvilla.com/v1/getAutosuggestion',
		cache : true,
		waitTime: 200,
		minLength : 1
	});
	document.querySelector('body').addEventListener('autocomplete:completed', function() {
		var finalOutput = '';
		var response = event.response;
		if(response) {
			response.forEach(function(data) {
				if(data.type=='product') {
					var text = [
						'<div class="tt-suggestion">',
							'<div class="custom_results_image custom_results">',
								'<div class="result_image hidden-xs hidden-sm" style="background-image:url(http://img1.craftsvilla.com/thumb/166x166/' + data.image + ')"></div>',
								'<div class="result_text">' + data.content.text  + '</div>'
					].join('\n');
					if(data.vendor_name.trim().length) {
						text = text.concat(['<div class="result_text hidden-xs hidden-sm">by ' + data.vendor_name  + '</div>']);
					}
					var other_text = [
						'<div class="result_text hidden-xs hidden-sm"><span class="discount_price">Rs. ' + parseInt(data.discounted_price)  + '</span></div>',
						'<div class="result_type visible-xs visible-sm" id="product_type">  Product </div>',
					'</div></div>'
					].join('\n');
					text = text.concat(other_text);
					finalOutput = finalOutput.concat(text);
				} else {
					var text = [
						'<div class="tt-suggestion">',
							'<div class="custom_results_text custom_results">',
								'<div class="result_text">' + data.content.text + '</div>',
								'<div class="result_type"> ' + data.type + '</div>',
							'</div>',
						'</div>'
					].join('\n');
					finalOutput = finalOutput.concat(text);
				}
			});
		}
		var suggestionsMenu = document.querySelector('.tt-suggestions');
		suggestionsMenu.innerHTML = finalOutput;
		suggestionsMenu.firstChild.className = 'tt-suggestion tt-cursor';
		createEvent('autocomplete:suggestions_displayed');
	});
}
