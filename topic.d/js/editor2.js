core.require("js/lib/dom.js");
core.require("js/notes.js");
core.require("js/box2.js");
core.require("js/simpleajax.js");

var linkBoxContent = "<table cellpadding=0>"+
	"<tr><td valign=top style='padding-top: 5px'>������</td><td valign=top><input type='text' class='inputText' style='width: 236px' onKeyPress='if (event.keyCode==13) {return callBoxFunc(buttonFunc[0]);}' id='linkUrl' value=''></td></tr>"+
	"<tr><td valign=top style='padding-top: 10px; width:70px'>��������</td><td valign=top style='padding-top: 5px'><input class='inputText' type='text' style='width: 236px' id='linkDesc' onKeyPress='if (event.keyCode==13) {return callBoxFunc(buttonFunc[0]);}' value=''></td></tr>"+
	"</table>";

var EditBox = {
	objIndex:0,
	buttons: {
		'bold':{cmd:"bold", key:"b"},
		'italic':{cmd:"italic", key:"i"}, 
		'numbers':{cmd:"insertorderedlist",tag:"ol",sep:true},
		'bullets':{cmd:"insertunorderedlist",tag:"ul"},
		'link':{cmd:"createlink",tag:"a",sep:true},
		'undo':{cmd:"undo", right:true},
		'audio':{cmd:"audio", tag:"vk-audio"}
	},
	txt:"",
	doc:document,
	win:window,
	body:null,
	input:null,
	noCSS:false,
	btnRowLocked:false,
	init:function(){
		createBox();
		var areaEl = document.getElementsByTagName("textarea")[0];
		var area = {
			w:areaEl.offsetWidth-2,
			h:areaEl.offsetHeight-2,
			name:areaEl.name,
			id:areaEl.id};
		var form = areaEl.parentNode;
		var editContainer = dom.create("div", {id:"editContainer"});
		var editor = dom.append(editContainer, "div", {id:"edit", className:"editBox"}); 
		if(!core.isIE){
			var frame = dom.append(editor, "iframe", {id:"editFrame"}, {width:area.w+"px", height:area.h+"px",marginBottom:"-2px"});
		}else{
			editor.className += " editBody";
			dom.setStyle(editor,{padding:"4px",width:(area.w-8)+"px", height:(area.h-8)+"px",overflow:"auto"});
		}
		var btnRow = dom.append(editContainer, "div", {id:"editButtonRow"});
		dom.append(btnRow, "div", {id:"editButtonRowRight", className:"editButtonRowRight"}/*, {styleFloat:"right"}*/);//.setAttribute("style", "float:right");
		form.replaceChild(editContainer, areaEl);
		this.input = dom.append(form, "input", {type:"hidden",name:area.name, id:area.id});
		if(core.isIE){
			this.body = $("edit");
			this.body.contentEditable = true;
//			dom.setStyle(this.body, {overflow:"auto"});
		}else{
			var doc = $("editFrame").contentDocument;
			this.win = $("editFrame").contentWindow;
			doc.open();
			doc.write("<html><head></head><body></body></html>");
			doc.close();
			this.body = doc.body;
			dom.append(this.body.previousSibling, "link", {type:"text/css",href:"css/editor.css",rel:"stylesheet"});
			this.body.className = "editBody";
			dom.setStyle(this.body,{padding:"4px"});
			this.doc = doc;
		}
		if(progImg)progImg.parentNode.removeChild(progImg);
		this.body.innerHTML = this.txt;//$("wysiwygPost").innerHTML;
		if(!core.isIE){doc.designMode="on";}
		this.initButtons();
		this.updateInput();
	},
	initButtons:function(){
		var _t = this;
		for(name in this.buttons){
			var btn = this.buttons[name];
			var row = (btn.right) ? "editButtonRowRight" : "editButtonRow";
			var btnClass = (btn.right) ? "editButtonRight" : "editButton";
			var img = dom.append(ge(row), "img", {id:name+"Btn", src:"images/"+name+".gif",className:btnClass+" editButtonOff"});
			if(btn.sep){dom.setStyle(img, {marginLeft:"4px"});}
			btn.img = img;
			events.addEvent(img, "click", function(cmd, _img){return function(){_t.btnClick(cmd, _img)}}(btn.cmd, img));
		}
		var keyObj = core.isIE?this.body:this.win;
		var evs = {'keydown':keyObj, 'keypress':keyObj, 
								'mousedown':this.body, 'mouseup':this.body, 'drag':this.body};
		for(ev in evs){
			events.addEvent(evs[ev], ev, function(event){return function(){_t.editorEvent(event, arguments)}}(ev));
		}
	},
	queryState:function(cmd){
		res = false;
		try{res = this.doc.queryCommandState(cmd);}
		catch(e){log(e);}
		return res;
	},
	deleteObj:function(tag, type){
		var obj = this.doc.getElementById(tag);
		obj.parentNode.removeChild(obj);
	},
	editorEvent:function(event, args){
		if(event=="mouseup"){
			var p = {x:core.getMouseX(args[0]),y:core.getMouseY(args[0])};
			var links = this.body.getElementsByTagName("td");
			for(var i=0;i<links.length;i++){
				if(links[i].className=="delObj"){
					var p1 = {x:p.x-core.getX(links[i]),y:p.y-core.getY(links[i])};
					if(p1.x > 0 && p1.y > 0 && p1.x < links[i].offsetWidth && p1.x < links[i].offsetHeight){
						this.deleteObj(links[i].getAttribute("tag"),links[i].getAttribute("type"));
					}
				}
			}
		}
		if(event==(core.isIE?"keydown":"keypress")){
			var code = (core.isIE)?args[0].keyCode:args[0].charCode;
			var key = String.fromCharCode(code).toLowerCase();
			if(args[0].ctrlKey){
				for(btn in this.buttons){
					if(this.buttons[btn].key == key){
						this.doCmd(this.buttons[btn].cmd);
						this.stopEvent(args[0]);
						return;
					}
				}
				//debug
				//if(key=="y"){alert(this.body.innerHTML);this.stopEvent(args[0]);}
			}
			if(this.findParent("table", this.getRng().startContainer) && code!=8 && code!=46){this.stopEvent(args[0]);}
		}
		var _t = this;
		setTimeout(function(){_t.refreshToolbar();}, 30);
	},
	stopEvent:function(ev) {
    if (core.isIE) {
        ev.cancelBubble = true;
        ev.returnValue = false;
    } else {
        ev.preventDefault();
        ev.stopPropagation();
    }
	},
	updateInput:function(){
		var text = this.body.innerHTML.replace(/[\r\n]/g,"").replace(/<br(\/?)>/ig,"\n").replace(/\n<([\/]?li)>/ig,"<$1>");
		text = text.replace(/<table[^>]*?val=['"]?([^'"]+)['"]?[^>]*?>.*?<\/table>/ig, "$1");
		this.input.setAttribute("value", text);
//		if(!ge("debug"))dom.append(document.body, "div", {id:"debug"});
//		ge("debug").innerHTML = escape(this.body.innerHTML);
		chkLen();
	},
	refreshToolbar:function(){
		var rng = this.getRng();
		for(btn in this.buttons){
			var val = this.getBtnState(btn, rng);
			var btnClass = (this.buttons[btn].right) ? "editButtonRight" : "editButton";
			this.buttons[btn].img.className = btnClass + ((val)?" editButtonOn":" editButtonOff");
		}
		this.updateInput();
	},
	getBtnState:function(btn, rng){
			if(!rng || rng.control)return false;
			switch(btn){
				case "link":
					var p = rng.common;
					if(this.collapsed(rng)){
						return this.findParent("a", p);
					}else{
						var c = (core.isIE) ? dom.create("div", {innerHTML:rng.htmlText}) : p;
						return this.findParent("a", p) || this.findChild("a", c);
					}
					break;
				case "undo":
					return false;
					break;
				default:
					var b = this.buttons[btn];
					return (b.tag) ? this.findParent(b.tag, rng.common) : this.queryState(b.cmd);
					break;
			}
	},
	collapsed:function(rng){
		return core.isIE ? (rng.text.length == 0) : rng.collapsed;
	},
	trimSelection:function(){
//		var sel = this.getRng().duplicate();
//		sel.moveStart ('character', -ge("edit").innerHTML.length);
//		alert(sel.text);
//		if(core.isIE)return ;
		var inf = this.checkCollapse();
		if(!inf)return;
		var start, end;
		var matchS = function(text, start){
			var pattern = (start)? /^\s*[^\s]/:/[^\s]\s*$/;
			var match = text.match(pattern);
			return (match) ? (match[0].length - 1) : 0;
		}
		if(!inf.col){
			if(core.isIE){
				inf.rng.moveEnd('character',-matchS(inf.rng.text, false));
				inf.rng.moveStart('character',matchS(inf.rng.text, true));
			}else{
				if(inf.eo==0){
					while(!inf.ec.previousSibling){inf.ec = inf.ec.parentNode;}
					inf.ec = inf.ec.previousSibling;
					while(inf.ec.nodeType!=3){inf.ec = inf.ec.lastChild;}
					inf.eo = inf.ec.textContent.length;
				}
				start = inf.so + matchS(inf.sc.textContent.substr(inf.so), true);
				end = inf.eo - matchS(inf.ec.textContent.substr(0,inf.eo), false);
				inf.rng.setStart(inf.sc, start);
				inf.rng.setEnd(inf.ec, end);
				this.select(inf.rng, {so:start, eo:end, sc:inf.sc, ec:inf.ec});
			}
		}
		return {text:core.isIE ? inf.rng.text : inf.rng.toString(), rng:inf.rng};
	},
	checkCollapse:function(tag){
		var rng = this.getRng();
		if(!rng || rng.control)return;
		var start, end, len = 0;
		var inf = {rng:rng,
		sc:rng.startContainer,
		ec:rng.endContainer,
		so:rng.startOffset,
		eo:rng.endOffset,
		col:this.collapsed(rng)};
		if(inf.col){
			if(core.isIE){
				rng.expand('word');
				//rng.moveStart('word',-1);
				//rng.moveEnd('word',1);
				while(rng.text.match(/\s$/)){rng.moveEnd('character',-1);}
				rng.select();
			}else{
				if(inf.sc.childNodes.length>0)return inf;
				var words = inf.sc.textContent.split(/\s/);
				for(i=0;i<words.length;i++){
					if(len + words[i].length >= inf.so){
						start = len; 
						end = len + words[i].length;
						break;
					}
					len += words[i].length + 1;
				}
				this.select(rng, {so:start, eo:end, sc:inf.sc, ec:inf.ec});
			}
		}
		return inf;
	},
	insertObjHTML:function(rng, content, id, value){
		tableContent = "<tr><td>"+content+"</td><td class='delObj' tag='"+ id +"'>X</td></tr>";
		if(core.isIE){
			rng.pasteHTML("<table id='"+id+"' class='objTable' val='" + value + "'>"+tableContent+"</table>");
		}else{
			this.insertNode(rng, "table",{id:id, className:"objTable",innerHTML:tableContent});
			this.doc.getElementById(id).setAttribute("val", value);
		}
		rng.collapse(false);
		this.insertNode(rng, "br");
		this.select(rng);
	},
	doCmd:function(cmd){
		if(core.isIE)this.body.focus();
		var rng = this.getRng();
		if(!rng || rng.control)return;
		//if(core.isIE && rng.text==""){
		//}
		if(!this.noCSS){
			if(core.isFF){
				this.execCmd("styleWithCSS", false);
				this.execCmd( 'enableObjectResizing', false) ;
				this.execCmd( 'enableInlineTableEditing', false) ;
			}else{
				this.execCmd("formatBlock", "span");
			}
			this.noCSS =true;
		}
		var _t = this;
		switch(cmd){
			case "audio":
				this.showBox({
					title:"���������� �����������", 
					body:"<div id='selectAudio'></div>",
					btn1:{
						text:"�������� �����������",
						func:function(){
							var id = "obj"+_t.objIndex++;
							var selAudio = window.selectedAudio;
							var content = "<span class='audioContent'>" + selAudio.text + "</span>";
							_t.insertObjHTML(rng, content, id, "[[audio"+selAudio.id+"]]");
							_t.refreshToolbar();
							_t.hideBox();
						}
					},
					btn2:{
						text:"������",
						func:function(){
							_t.hideBox(rng);
						}
					}
				});
				showMore("/notes.php?act=audiolist", "selectAudio");
				break;
			case "createlink":
				if(!this.getBtnState("link", rng)){
					var sel = this.trimSelection();
					if(!sel)break;
					this.showBox({
						title:"���������� ������", 
						body:linkBoxContent,
						btn1:{
							text:"�������� ������",
							func:function(){
								var desc = ge("linkDesc").value;
								if(sel.text != desc){
									_t.insertText(sel.rng, desc);
								}
								_t.execCmd(cmd, ge("linkUrl").value);
								
								_t.refreshToolbar();
								_t.hideBox(sel.rng);
							}
						},
						btn2:{
							text:"������",
							func:function(){
								_t.hideBox(sel.rng);
							}
						}
					});
					ge("linkDesc").value = sel.text;
					var islink = sel.text.match(/^(http[s]?:\/\/)?([\w\-\.]+\.[a-zA-Z]{1,4}(:[\d]{1,5})?(\/[\w\-\.\/]*)?)$/);
					ge("linkUrl").value =  "http://"+((islink) ? islink[2] : "");
				}else{
					this.checkCollapse("a");
					this.execCmd("unlink", null);
				}
				break;
			default:
				this.execCmd(cmd, null);
				break;
		}
		this.refreshToolbar();
		this.focus();
	},
	focus:function(){
		var focusObj = (core.isOpera)?$("editFrame"):this.body;
		focusObj.blur();
		focusObj.focus();
	},
	select:function(rng, inf){
		if(!rng || rng.control)return;
		if(inf){
			try{
				rng.setStart(inf.sc, inf.so);
				rng.setEnd(inf.ec, inf.eo);
			}catch(e){}
		}
		if(core.isIE){rng.select();}
		else{
			var sel = this.getSel();
			sel.removeAllRanges();
			sel.addRange(rng);
		}
	},
	insertText:function(rng, text){
		if(core.isIE){
			rng.pasteHTML(text);
		}else{
			rng.deleteContents();
			var c = this.doc.createTextNode(text);
			rng.insertNode(c);
			rng.selectNode(c);
		}
	},
	insertNode:function(rng, name, props, styles){
		if(core.isIE){
			var node = dom.create(name, props, styles);
			rng.pasteHTML(node.outerHTML);
		}else{
			dom.doc = this.doc;
			var node = dom.create(name, props, styles);
			rng.deleteContents();
			rng.insertNode(node);
			rng.selectNode(node);
			dom.doc = document;
		}
	},
	hideBox:function(rng){
		hideBoxOld();
		this.select(rng);
		this.btnRowLocked = false;
	},
	showBox:function(box){
		this.btnRowLocked = true;
		ge('boxTitle').innerHTML = box.title;
		ge('boxMessage').innerHTML = box.body;
		ge('button1').innerHTML = box.btn1.text;
		ge('button2').innerHTML = box.btn2.text;
		showBoxOld(box.btn1.func, box.btn2.func);
	},
	execCmd:function(cmd,val){
		try{
			this.doc.execCommand(cmd, false, val);
		}catch(e){
			log(e);
		}
	},
	btnClick:function(btn, img){
		if(this.btnRowLocked || this.findParent("table", this.getRng().startContainer))return;
		this.doCmd(btn);
	},
	getSel: function() {
			return (this.win.getSelection) ? this.win.getSelection() : this.doc.selection;
	},
	getRng: function() {
			var sel = this.getSel();
			if (!sel) {return null;}
			var rng = (sel.rangeCount > 0) ? sel.getRangeAt(0) : sel.createRange();
			
			if(core.isIE){
				rng.common = sel.type=="Control" ? rng(0) : rng.parentElement();
				if(sel.type!="Control"){
					rng1 = rng.duplicate();
					rng2 = rng.duplicate();
					rng1.collapse(true);
					rng2.collapse(false);
					rng.startContainer = rng1.parentElement();
					rng.endContainer = rng2.parentElement();
				}else{
					rng.startContainer = rng.common;
					rng.endContainer = rng.common;
					rng.control = true;
				}
			}else{
				rng.common = rng.commonAncestorContainer;
			}
			return rng;
	},
	findParent:function(tag, el){
		while(tag && el && el.id != "edit"){
			if(el.tagName && el.tagName.toLowerCase()==tag){return el;}
			el = el.parentNode;
		}
		return null;
	},
	findChild:function(tag, el){
		if(!tag || !el)return null;
		
		for(var i=0; i<el.childNodes.length;i++){
			var c = el.childNodes[i];
			if(c.tagName && c.tagName.toLowerCase()==tag){return c;}
			var ch = this.findChild(tag, c);
			if(ch)return ch;
		}
		return null;
	}
};

var progImg;
var initInterval = 0;
var checkLoad = function(){
	if(initInterval<0)return;
	var tags = document.getElementsByTagName("textarea");
	if(tags && tags[0]){
		var ta = tags[0];
		EditBox.txt = (ta.value || ta.textContent || "").replace(/\r\n/g,"<br/>").replace(/\n/g,"<br/>");
		ta.value = "";
		// image size - 150x8
		progImg = dom.append(document.body, "img", {src:"images/progress7.gif"}, 
			{position:"absolute", left:findX(ta)+(ta.offsetWidth - 150)/2+"px", top:findY(tags[0])+(ta.offsetHeight - 8)/2+"px"});
		clearInterval(initInterval);
		initInterval = -1;
	}
};

function log(message){
	m = message;
}

initInterval = setInterval(checkLoad, 50);

events.addEvent(window, "load", function(){
	checkLoad();
	EditBox.init();
});
