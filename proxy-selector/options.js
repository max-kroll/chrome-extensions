/**
 * load options from storage
 */
function loadOptions() {
	chrome.runtime.sendMessage("", {
		message: "getSettings",
		options: {
			trafficMode: "singleProxy",
			proxyList: null
		}
	}, null, function(items) {
		var list = JSON.parse(items.proxyList);

		document.getElementById("traffic-mode").value = items.trafficMode;

		for(var i in list) {
			list[i].index = i;
			appendTableRow(document.getElementById("proxy-list"), list[i]);
		}		
	});
}

/**
 * save options from GUI to storage
 */
function saveOptions() {
	var trafficMode = document.getElementById("traffic-mode").value;
	var proxyList = [];
	var rows = document.querySelectorAll(".proxy-item");

	if(rows.length > 0) {
		for(var i = 0; i < rows.length; i++) {
			proxyList.push({
				scheme: rows[i].children[0].innerText,
				host: rows[i].children[1].innerText,
				port: rows[i].children[2].innerText
			});
		}
	}
	else {
		// if list empty set to system default
		chrome.runtime.sendMessage("", { message: "setProxySettings", options: { value: { mode: "system" }, scope: "regular" } });
	}

	// save proxy list
	chrome.runtime.sendMessage("", {
		message: "setSettings",
		options: {
			trafficMode: trafficMode,
			proxyList: JSON.stringify(proxyList),
			selected: 0
		}
	}, null, function() {
		var saveBtn = document.getElementById("save");

		// show saved
		saveBtn.classList.add("saved");
		setTimeout(function() {
			saveBtn.classList.remove("saved");
		}, 1000);
	});
	chrome.runtime.sendMessage("", { message: "updateMode" });
}

/**
 * append new table row
 */
function appendTableRow(table, item) {
	var row = document.createElement("tr");

	row.classList.add("proxy-item");
	row.tabIndex = item.index;
	row.appendChild(document.createElement("td")).innerText = item.scheme;
	row.appendChild(document.createElement("td")).innerText = item.host;
	row.appendChild(document.createElement("td")).innerText = item.port;
	row.onclick = function(e) {
		this.classList.toggle("selected");
		document.getElementById("remove").disabled = !document.querySelector(".proxy-item.selected");
	};

	table.appendChild(row);
}

/**
 * update add button state on input changed
 */
function addInputOnChange() {
	var host = document.getElementById("host");
	var port = document.getElementById("port");
	var addBnt = document.getElementById("add");
	
	host.onkeyup = port.onkeyup =
	host.onchange = port.onchange =
	function(e) {
		console.log(e);
		addBnt.disabled = host.value.length <= 0 || port.value.length <= 0;
	};
}

document.addEventListener("DOMContentLoaded", function() {
	loadOptions();
	addInputOnChange();
});

document.getElementById("add").onclick = function () {
	appendTableRow(document.getElementById("proxy-list"), {
		scheme: document.getElementById("scheme").value,
		host: document.getElementById("host").value,
		port: document.getElementById("port").value,
		index: 0
	});
};

document.getElementById("remove").onclick = function () {
	var rows = document.querySelectorAll(".proxy-item.selected");
	
	for(var i = 0; i < rows.length; i++) {
		rows[i].remove();
	}
	this.disabled = true;
};

document.getElementById("clear").onclick = function () {
	var rows = document.querySelectorAll(".proxy-item");
	
	for(var i = 0; i < rows.length; i++) {
		rows[i].remove();
	}
	document.getElementById("remove").disabled = true;
};

document.getElementById("save").onclick = function () {
	saveOptions();
};