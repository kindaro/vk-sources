var default_duration = 0.1, default_fps = 50;

function decHeight(element, on_done) { 
	return function() {
		var newHeight = element.clientHeight - Math.round(element.step);
		if (newHeight - (element.height_fix ? element.height_fix : 0) <= 0) {
			element.style.height = "";
			element.style.display = "none";
			element.style.overflow = element._overflow;
			clearInterval(element.timer);
			element.blinding = false;
			if (on_done)
				on_done();
	//console.timeEnd("total");
		} else {
			setHeight(element, newHeight);
		}
	}
}

function incHeight(element, on_done) { 
	return function() {
		var newHeight = element.clientHeight + Math.round(element.step);
		if (newHeight - (element.height_fix ? element.height_fix : 0) >= element.origHeight) {
			element.style.height = "";
			element.style.overflow = element._overflow;
			clearInterval(element.timer);
			element.blinding = false;
			if (on_done)
				on_done();
	//console.timeEnd("total");
		} else {
			setHeight(element, newHeight);
		}
	}
}

function setHeight(element, newHeight) {
	element.style.height = newHeight - (element.height_fix ? element.height_fix : 0) + "px";
	if (element.clientHeight != newHeight) {
		element.height_fix = element.clientHeight - newHeight;
		element.style.height = newHeight - (element.height_fix ? element.height_fix : 0) + "px";
	}
}


function blindsUp(elem, duration, fps, on_done) {
	if (elem.blinding && elem.blinding == true)
		return;
	elem.blinding = true;

	if (!duration)
		duration = default_duration;
	if (!fps)
		fps = default_fps;

	elem._overflow = elem.style.overflow;
	elem.style.overflow = "hidden";
	if (elem.clientHeight == 0)
		elem.style.height = elem.offsetHeight + "px";
	elem.step = Math.round(elem.clientHeight / (fps * duration)); //
	elem.step = Math.max(1, elem.step);
	//console.time("total");
	elem.timer = setInterval(decHeight(elem, on_done), Math.round(1000 * duration / (elem.clientHeight / elem.step))); //
	decHeight(elem, on_done);
}

function blindsDown(elem, duration, fps, on_done) {
	if (elem.style.display != 'none')
		return;

	if (elem.blinding && elem.blinding == true)
		return;
	elem.blinding = true;
		
	if (!duration)
		duration = default_duration;
	if (!fps)
		fps = default_fps;

	elem._overflow = elem.style.overflow;
	elem.style.overflow = "hidden";
    var els = elem.style;
    var origVis = els.visibility;
    var origPos = els.position;
    els.visibility = 'hidden';
    els.position = 'absolute';
    els.display = '';
	elem.origHeight = elem.clientHeight;
    els.position = origPos;
    els.visibility = origVis;
    els.height = "0px";
	elem.step = Math.round(elem.origHeight / (fps * duration)); //
	elem.step = Math.max(1, elem.step);
	//console.time("total");
	elem.timer = setInterval(incHeight(elem, on_done), Math.round(1000 * duration / (elem.origHeight / elem.step))); //
	incHeight(elem, on_done);
}