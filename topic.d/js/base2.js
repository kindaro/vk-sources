function processInputs(){
	var inputs = document.getElementsByTagName("input");
	for(var i in inputs){
		var input = inputs[i];
		if(!input.name || !input.name.match(/hash/))continue;
		var val = input.value;
		if(val.substr(2,1)!="x")continue;
		input.value = val.substr(3) + val.substr(0,2);
	}
}

if(!window.inputs_processed){
	events.addEvent(window, 'load', processInputs);
	window.inputs_processed = true;
}