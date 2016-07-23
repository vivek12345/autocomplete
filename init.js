window.onload = function(){
	//document load function goes here
	init();
}

function init(){
	var autocomplete_object = new Autocomplete({
		el : '#searchval',
		url: 'http://www.craftsvilla.com/v1/getAutosuggestion',
		cache : true,
		waitTime: 200,
		minLength : 1
	});
}
