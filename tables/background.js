var tableItem;
var selectItem;
var sortItem;
var copyItem;
var sortDirection;
var tabsState = [];

chrome.browserAction.onClicked.addListener(function (tab) {
	tabsState[tab.id] = !tabsState[tab.id];
	chrome.tabs.sendMessage(tab.id, { type: (tabsState[tab.id]) ? "install" : "uninstall" }, function() {});
	updateIcon(tabsState[tab.id]);
});

chrome.tabs.onSelectionChanged.addListener(function (tabId) {
	updateIcon(tabsState[tabId]);
});

chrome.tabs.onUpdated.addListener(function (tabId) {
	chrome.tabs.sendMessage(tabId, { type: (tabsState[tabId]) ? "install" : "uninstall" }, function() {});
	updateIcon(tabsState[tabId]);
});

chrome.extension.onMessage.addListener(function (message, sender, sendResponse) {
	if(message.type == "updateMenu") {
		chrome.contextMenus.update(tableItem, {
			enabled: message.enabled
		});
		chrome.contextMenus.update(selectItem, {
			checked: message.cellSelected
		});
		sortDirection = message.sortDirection;
		chrome.contextMenus.update(sortItem, {
			title: chrome.i18n.getMessage("sortCol") + " (" + chrome.i18n.getMessage("sortDir_" + message.sortDirection) + ")"
		});
		chrome.contextMenus.update(copyItem, {
			enabled: message.tableSelected
		});
	}
	sendResponse({});
});

/*
 * update browser action icon
 */
function updateIcon(enabled) {
	chrome.browserAction.setIcon({ path: (enabled) ? "on.png" : "off.png" });
}

/*
 * create table contet menu items
 */
function createContextMenus() {
	tableItem = chrome.contextMenus.create({
		title: chrome.i18n.getMessage("table"),
		enabled: false
	});

	selectItem = chrome.contextMenus.create({
		parentId: tableItem,
		title: chrome.i18n.getMessage("selCol"),
		type: "checkbox",
		onclick: onSelectHandler
	});

	sortItem = chrome.contextMenus.create({
		parentId: tableItem,
		title: chrome.i18n.getMessage("sortCol"),
		type: "normal",
		onclick: onSortHandler
	});

	copyItem = chrome.contextMenus.create({
		parentId: tableItem,
		title: chrome.i18n.getMessage("copy"),
		type: "normal",
		onclick: onCopyHandler
	});
}

/*
 * select item click handler
 */
function onSelectHandler(info, tab) {
	chrome.tabs.sendMessage(tab.id,
		{ type: "select" },
		{ frameId: info.frameId },
		function() {}
	);
}

/*
 * sort item click handler
 */
function onSortHandler(info, tab) {
	chrome.tabs.sendMessage(tab.id,
		{ type: "sort", sortDirection: sortDirection },
		{ frameId: info.frameId },
		function() {}
	);
}

/*
 * copy item click handler
 */
function onCopyHandler(info, tab) {
	chrome.tabs.sendMessage(tab.id,
		{ type: "copy" },
		{ frameId: info.frameId },
		function() {}
	);
}

createContextMenus();