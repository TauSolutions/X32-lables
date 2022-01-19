window.labels = {};

function uid8() {
	if (!window.hasOwnProperty("uidList")) window.uidList = [];
	for(;;) {
		var uid = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 4)+'-'+Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 4);
		if (window.uidList.indexOf(uid) == -1) break;
		else console.log(uid+" collision at "+window.uidList.indexOf(uid));
	}
	window.uidList.push(uid);
	return uid;
};

window.addEventListener("DOMContentLoaded", function (e) {
	menuAttachEvents();
	loadFromLocalStorage();
});

function menuAttachEvents () {
	var dx, dy;
	var body = document.body;
	document.getElementById("help").classList.toggle("disabled", true);
	var menu = document.getElementById("menu");
	menu.addEventListener("click", function (e){e.stopPropagation();});
	var title = document.getElementById("toolboxTitle");
	title.addEventListener("mousedown", function (e) {
		dx = e.offsetX;
		dy = e.offsetY + e.target.offsetTop;
		window.addEventListener("mousemove", move);
		window.addEventListener("mouseup", stopMove);
	});
	title.addEventListener("touchstart", function (e) {
		var touch = e.targetTouches[0];
		var targetRect = e.targetTouches[0].target.getClientRects()[0];
		dx = touch.pageX - targetRect.left;
		dy = touch.pageY - targetRect.top;
		window.addEventListener("touchmove", touchMove);
		window.addEventListener("touchstop", stop);
	});
		
	function move (e) {
		var left = e.pageX - dx;
		var top = e.pageY - dy;
		
		if (left <= 0) left = 0;
		else if (left >= body.offsetWidth - menu.offsetWidth) left = body.offsetWidth - menu.offsetWidth;
		
		if (top <= 0) top = 0;
		else if (top >= body.offsetHeight - 50) top = body.offsetHeight - 50;
		
		menu.style.left = left;
		menu.style.top = top;
	}
	
	function touchMove (e) {
		e.preventDefault();
		var touch = e.targetTouches[0];
		var left = touch.pageX - dx;
		var top = touch.pageY - dy;
		
		if (left <= 0) left = 0;
		else if (left >= body.offsetWidth - menu.offsetWidth) left = body.offsetWidth - menu.offsetWidth;
		
		if (top <= 0) top = 0;
		else if (top >= body.offsetHeight - 50) top = body.offsetHeight - 50;
		
		menu.style.left = left;
		menu.style.top = top;
	}
	
	function stopMove (e) {
		window.removeEventListener("mousemove", move);
		window.removeEventListener("mouseup", stopMove);
		window.removeEventListener("touchmove", touchMove);
		window.removeEventListener("touchstop", stopMove);
	}
	
	window.addEventListener("click", function (e) {
		selectedName.change();
	});
	document.getElementById("help").addEventListener("click", function (e) {
		this.classList.toggle("disabled", true);
	});
	document.getElementById("menuHelp").addEventListener("click", function (e) {
		document.getElementById("help").classList.toggle("disabled");
	});
	document.getElementById("menuPrint").addEventListener("click", function (e) {
		window.print();
	});
	document.getElementById("fileInput").addEventListener("change", function (e) {
		if (!this.files || !this.files[0]) {
			alert("No File Detected...");
			return;
		}
		var fr = new FileReader();
		fr.onload = function (e) {
			loadFromJSON(e.target.result);
			save2localStorage();
		}
		fr.readAsText(this.files[0]);
	});
	document.getElementById("menuLoad").addEventListener("click", function (e) {
		if (typeof window.FileReader !== 'function') {
			alert("The file API isn't supported on this browser yet.");
			return;
		}
		
		document.getElementById("fileInput").click();
	});
	document.getElementById("menuSave").addEventListener("click", function (e) {
		var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(window.labels));
		var a = document.createElement("a");
		a.style.display = "none";
		a.setAttribute("href", dataStr);
		a.setAttribute("download", "X32Lables.json");
		menu.appendChild(a);
		a.click();
		a.remove();
		
	});
	document.getElementById("menuCreateGroup").addEventListener("click", function (e) {
		var label = new Group();
		window.labels[label.uid] = label;
		document.body.appendChild(label.create());
		save2localStorage();
	});
	document.getElementById("menuDeleteGroup").addEventListener("click", function (e) {
		if (selectedName.selected == null) return;
		var uid = selectedName.selected.uid;
		document.getElementById(uid).remove();
		delete window.labels[uid];
		selectedName.change();
		save2localStorage();
	});
	
	
	menu.style.left = body.offsetWidth - (menu.offsetWidth + 20);
	menu.style.maxHeight = body.offsetHeight - 50;
	
	var selectedName = document.getElementById("selectedName");
	selectedName.selected = null;
	var groupWidth = document.getElementById("groupWidth");
	var groupHeight = document.getElementById("groupHeight");
	var buttonRows = document.getElementById("buttonRows");
	var buttonWidth = document.getElementById("buttonWidth");
	var buttonHeight = document.getElementById("buttonHeight");
	var hSpace = document.getElementById("hSpace");
	var vSpace = document.getElementById("vSpace");
	var trimWidth = document.getElementById("trimWidth");
	var trimColor = document.getElementById("trimColor");
	var viewButton = document.getElementById("viewButton");
	var viewButtonWidth = document.getElementById("viewButtonWidth");
	var viewButtonHeight = document.getElementById("viewButtonHeight");

	selectedName.change = function (group) {
		this.selected = group;
		if (group) {
			this.innerHTML = group.title;
			
			var test = group.width.match(/(\d*\.?\d+)/g);
			groupWidth.value = (test ? +(test[0]) : 0);
			var test = group.height.match(/(\d*\.?\d+)/g);
			groupHeight.value = (test ? +(test[0]) : 0);
			
			var test = group.button.length/2;
			buttonRows.value = test;
			var test = group.style["--button-width"].match(/(\d*\.?\d+)/g);
			buttonWidth.value = (test ? +(test[0]) : 0);
			var test = group.style["--button-height"].match(/(\d*\.?\d+)/g);
			buttonHeight.value = (test ? +(test[0]) : 0);
			var test = group.style["--button-h-space"].match(/(\d*\.?\d+)/g);
			hSpace.value = (test ? +(test[0]) : 0);
			var test = group.style["--button-v-space"].match(/(\d*\.?\d+)/g);
			vSpace.value = (test ? +(test[0]) : 0);
			var test = group.style["--button-trim"].match(/(\d*\.?\d+)/g);
			trimWidth.value = (test ? +(test[0]) : 0);
			var test = group.style["--button-trim-color"];
			trimColor.value = test;	
			var test = group.style["--button-view"];
			viewButton.checked = test;
			var test = group.style["--button-view-width"].match(/(\d*\.?\d+)/g);
			viewButtonWidth.value = (test ? +(test[0]) : 0);
			var test = group.style["--button-view-height"].match(/(\d*\.?\d+)/g);
			viewButtonHeight.value = (test ? +(test[0]) : 0);
			
		} else {
			this.innerHTML = "SelectedName";
			groupWidth.value = null;
			groupHeight.value = null;
			
			buttonRows.value = null;
			buttonWidth.value = null;
			buttonHeight.value = null;
			hSpace.value = null;
			vSpace.value = null;
			trimWidth.value = null;
			trimColor.value = null;
			viewButton.checked = false;
			viewButtonWidth.value = null;
			viewButtonHeight.value = null;
		}
	};
	groupWidth.addEventListener("change", function (e) {
		if (selectedName.selected == null) { this.value = null; return;}
		if (this.value == null) return;
		selectedName.selected.width = this.value+"mm";
		selectedName.selected.create();
		save2localStorage();
	});
	groupHeight.addEventListener("change", function (e) {
		if (selectedName.selected == null) { this.value = null; return;}
		if (this.value == null) return;
		selectedName.selected.height = this.value+"mm";
		selectedName.selected.create();
		save2localStorage();
	});
	buttonRows.addEventListener("change", function (e) {
		if (selectedName.selected == null) { this.value = null; return;}
		if (this.value == null) return;
		
		if (this.value * 2 > selectedName.selected.button.length) {
			var num2add = (this.value*2)-selectedName.selected.button.length;
			for (var i = 0; i < num2add; i++) {
				selectedName.selected.button.push("");
			}
		} else if (this.value * 2 < selectedName.selected.button.length) {
			var num2remove = selectedName.selected.button.length-(this.value*2);
			for (var i = 0; i < num2remove; i++) {
				selectedName.selected.button.pop();
			}
		}
		selectedName.selected.create();
		save2localStorage();
	});
	buttonWidth.addEventListener("change", function (e) {
		if (selectedName.selected == null) { this.value = null; return;}
		if (this.value == null) return;
		selectedName.selected.style["--button-width"] = this.value+"mm";
		selectedName.selected.create();
		save2localStorage();
	});
	buttonHeight.addEventListener("change", function (e) {
		if (selectedName.selected == null) { this.value = null; return;}
		if (this.value == null) return;
		selectedName.selected.style["--button-height"] = this.value+"mm";
		selectedName.selected.create();
		save2localStorage();
	});
	hSpace.addEventListener("change", function (e) {
		if (selectedName.selected == null) { this.value = null; return;}
		if (this.value == null) return;
		selectedName.selected.style["--button-h-space"] = this.value+"mm";
		selectedName.selected.create();
		save2localStorage();
	});
	vSpace.addEventListener("change", function (e) {
		if (selectedName.selected == null) { this.value = null; return;}
		if (this.value == null) return;
		selectedName.selected.style["--button-v-space"] = this.value+"mm";
		selectedName.selected.create();
		save2localStorage();
	});
	trimWidth.addEventListener("change", function (e) {
		if (selectedName.selected == null) { this.value = null; return;}
		if (this.value == null) return;
		selectedName.selected.style["--button-trim"] = this.value+"mm";
		selectedName.selected.create();
		save2localStorage();
	});
	trimColor.addEventListener("change", function (e) {
		if (selectedName.selected == null) { this.value = null; return;}
		if (this.value == null) return;
		selectedName.selected.style["--button-trim-color"] = this.value;
		selectedName.selected.create();
		save2localStorage();
	});
	viewButton.addEventListener("change", function (e) {
		if (selectedName.selected == null) { this.checked = false; return;}
		selectedName.selected.style["--button-view"] = this.checked;
		selectedName.selected.create();
		save2localStorage();
	});
	viewButtonWidth.addEventListener("change", function (e) {
		if (selectedName.selected == null) { this.value = null; return;}
		if (this.value == null) return;
		selectedName.selected.style["--button-view-width"] = this.value+"mm";
		selectedName.selected.create();
		save2localStorage();
	});
	viewButtonHeight.addEventListener("change", function (e) {
		if (selectedName.selected == null) { this.value = null; return;}
		if (this.value == null) return;
		selectedName.selected.style["--button-view-height"] = this.value+"mm";
		selectedName.selected.create();
		save2localStorage();
	});
}

function save2localStorage() {
	localStorage.X32_Labels = JSON.stringify(window.labels);
}

function loadFromLocalStorage() {
	if (localStorage.hasOwnProperty("X32_Labels")) {
		loadFromJSON(localStorage.X32_Labels);
	}
}

function loadFromJSON (json) {
	try {
		var obj = JSON.parse(json);
	} catch (e) {
		var obj = {};
	}
	for (var l in obj) {
		var label = new Group(obj[l]);
		window.labels[label.uid] = label;
		document.body.appendChild(label.create());
	}
}

function Group (detail) {
	if (detail === undefined || detail === null || !(detail instanceof Object)) detail = {};
	this.uid = (detail.hasOwnProperty("uid") ? detail.uid : uid8());
	this.title = (detail.hasOwnProperty("title") ? detail.title : "Title");
	this.width = (detail.hasOwnProperty("width") ? detail.width : "54mm");
	this.height = (detail.hasOwnProperty("height") ? detail.height : "");
	this.button = (detail.hasOwnProperty("button") ? detail.button : []);
	this.style = (detail.hasOwnProperty("style") ? detail.style : {
		"--button-width": "12mm",
		"--button-height": "9mm",
		"--button-h-space": "23mm",
		"--button-v-space": "20.5mm",
		"--button-trim": "0.5mm",
		"--button-trim-color": "white",
		"--button-view": false,
		"--button-view-width": "8mm",
		"--button-view-height": "6mm"
	});
}

Group.prototype.create = function () {
	var group = this;
	var groupDiv = document.getElementById(this.uid);
	if (groupDiv == null) {
		groupDiv = document.createElement("div");
		groupDiv.addEventListener("click", function (e){e.stopPropagation();});
	} else {
		while (groupDiv.firstChild) {
			groupDiv.removeChild(groupDiv.firstChild);
		}
	}
	groupDiv.id = this.uid;
	groupDiv.addEventListener("click", function (e) {
		document.getElementById("selectedName").change(group);
	});
	groupDiv.classList.add("group");
	
	var style = "";
	for (var s in this.style) {
		style += s+": "+this.style[s]+"; ";
	}
	style += "width: "+this.width+";";
	style += "height: "+this.height+";";
	groupDiv.setAttribute("style", style);

	var title = document.createElement("div");
	title.classList.add("group-title");
	title.innerHTML = this.title;
	title.addEventListener("click", titleClick);
	title.addEventListener("blur", titleBlur);
	title.addEventListener("keydown", function (e) {
		var key = e.charCode || e.keyCode || 0;
		if (key == 13) {
			e.preventDefault();
			this.blur();
		}
	});
	groupDiv.appendChild(title);
	
	function titleClick (e) {
		this.setAttribute("contenteditable", true);
		this.focus();
	}
	
	function titleBlur (e) {
		group.title = this.innerHTML;
		this.setAttribute("contenteditable", false);
		document.getElementById("selectedName").change(group);
		save2localStorage();
	}
	
	for (var b = 0; b < this.button.length; b+=2) {
		var buttonTextRow = document.createElement("div");
		buttonTextRow.classList.add("button-text-row");
		
		var buttonRow = document.createElement("div");
		buttonRow.classList.add("button-row");
		var textRow = document.createElement("div");
		textRow.classList.add("text-row");
		
		var button = document.createElement("div");
		button.classList.add("button-left");
		button.setAttribute("data-button", b);
		button.addEventListener("click", buttonClick);
		var text = document.createElement("div");
		text.classList.add("text-left");
		text.setAttribute("data-button", b);
		text.id = groupDiv.id+"-button-"+b;
		text.innerHTML = this.button[b];
		text.addEventListener("click", buttonClick);
		text.addEventListener("blur", textBlur);
		text.addEventListener("keydown", keydown);
		buttonRow.appendChild(button);
		textRow.appendChild(text);

		var button = document.createElement("div");
		button.classList.add("button-right");
		button.setAttribute("data-button", b+1);
		button.addEventListener("click", buttonClick);
		var text = document.createElement("div");
		text.classList.add("text-right");
		text.setAttribute("data-button", b+1);
		text.id = groupDiv.id+"-button-"+(b+1);
		text.innerHTML = this.button[b+1];
		text.addEventListener("click", buttonClick);
		text.addEventListener("blur", textBlur);
		text.addEventListener("keydown", keydown);
		buttonRow.appendChild(button);
		textRow.appendChild(text);
		
		function keydown(e) {
			var key = e.charCode || e.keyCode || 0;
			if (key == 13) {
				e.preventDefault();
				this.blur();
			}
		}
		function buttonClick (e) {
			var buttonNumber = this.getAttribute("data-button");
			var editable = document.getElementById(groupDiv.id+"-button-"+buttonNumber);
			editable.setAttribute("contenteditable", true);
			editable.focus();
		}
		
		function textBlur (e) {
			var buttonNumber = this.getAttribute("data-button");
			var editable = document.getElementById(groupDiv.id+"-button-"+buttonNumber);
			editable.setAttribute("contenteditable", false);
			group.button[buttonNumber] = editable.innerHTML;
			save2localStorage();
		}

		buttonTextRow.appendChild(buttonRow);
		buttonTextRow.appendChild(textRow);
		groupDiv.appendChild(buttonTextRow);
	}
	
	var viewButton = document.createElement("div");
	viewButton.classList.add("button-view");
	if (this.style["--button-view"]) {
		viewButton.style.setProperty("display", "unset");
	} else {
		viewButton.style.setProperty("display", "none");
	}
	groupDiv.appendChild(viewButton);
	
	return groupDiv;
}