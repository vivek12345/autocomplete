window.onload = function(){
	//document load function goes here
	init();
}

function init(){
	var typeahead_object = new Typeahead({
		el : '#typeahead',
		url: 'http://www.craftsvilla.com/v1/getAutosuggestion',
		cache : true,
		waitTime: 200,
		minLength : 1
	});
}
