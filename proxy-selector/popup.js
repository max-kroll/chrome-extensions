/**
 * update action button image, title and popup item
 */
function updateMode() {
	chrome.runtime.sendMessage("", { message: "updateMode" }, null, function(mode) {
		document.querySelector("li.selected").classList.remove("selected");
		switch(mode) {
			case "system":
				document.getElementById("proxy-sys").classList.add("selected");
				break;
			case "direct":
				document.getElementById("proxy-off").classList.add("selected");
				break;
			default:
				document.getElementById("proxy-on").classList.add("selected");
		}
	});
}

/**
 * load proxy list from storage
 */
function loadProxyList() {
	chrome.runtime.sendMessage("", {
		message: "getSettings",
		options: { proxyList: null, selected: 0 }
	}, null, function(items) {
		var proxyList = JSON.parse(items.proxyList);
		if(proxyList && proxyList.length > 0) {
			for(var i in proxyList) {
				proxyList[i].index = i;
				if(items.selected == i) {
					proxyList[i].selected = true;
				}
				appendTableRow(document.getElementById("proxy-list"), proxyList[i]);
			}
		}
		else {
			document.getElementById("proxy-on").innerText = chrome.i18n.getMessage("useProxy") + chrome.i18n.getMessage("empty");
		}
	});
}


/**
 * append new table row
 */
function appendTableRow(table, item) {
	var row = document.createElement("tr");

	row.classList.add("proxy-item");
	row.tabIndex = item.index;
	if(item.selected) {
		row.classList.add("selected");
	}
	row.appendChild(document.createElement("td")).innerText = item.scheme;
	row.appendChild(document.createElement("td")).innerText = item.host;
	row.appendChild(document.createElement("td")).innerText = item.port;
	row.onclick = function(e) {
		var selected = document.querySelector(".proxy-item.selected");
		if(selected) {
			selected.classList.remove("selected");
		}
		this.classList.add("selected");
		chrome.runtime.sendMessage("", { message: "setFixedProxy", options: { index: item.index } });
	};

	table.appendChild(row);
}

/**
 * turn on proxy
 */
function turnOnProxy() {
	var selected = document.querySelector(".proxy-item.selected");

	if(selected) {
		chrome.runtime.sendMessage("", { message: "setFixedProxy", options: { index: selected.tabIndex } });
	}
}

document.addEventListener("DOMContentLoaded", function () {
	var items = document.querySelectorAll("#proxy-selector>li");

	for(var i = 0; i < items.length; i++) {
		items[i].onclick = function (e) {
			var item = e.target;

			if(!item.classList.contains("selected")) {
				switch(item.id) {
					case "proxy-sys":
						chrome.runtime.sendMessage("", {
							message: "setProxySettings",
							options: { value: { mode: "system" }, scope: "regular" } });
						setTimeout(window.close, 50);
						break;
					case "proxy-on":
						turnOnProxy();
						break;
					case "proxy-off":
						chrome.runtime.sendMessage("", {
							message: "setProxySettings",
							options: { value: { mode: "direct" }, scope: "regular" } });
						setTimeout(window.close, 50);
						break;
				}
				setTimeout(updateMode, 10);
			}
		};
	}
	loadProxyList();
	updateMode();
});