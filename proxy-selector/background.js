/**
 * load settings from storage
 */
function getSettings(options, callback) {
	chrome.storage.sync.get(options, function(items) {
		if(callback) {
			callback(items);
		}
	});
}

/**
 * save settings to storage
 */
function setSettings(options, callback) {
	chrome.storage.sync.set(options, function(items) {
		if(callback) {
			callback(items);
		}
	});
}

/**
 * get proxy settings
 */
function getProxySettings(options, callback) {
	chrome.proxy.settings.get(options, function(items) {
		if(callback) {
			callback(items);
		}
	});
}

/**
 * set proxy settings
 */
function setProxySettings(options, callback) {
	chrome.proxy.settings.set(options, function(items) {
		if(callback) {
			callback(items);
		}
	});
}

/**
 * update action button icon, title
 */
function updateMode(callback) {
	getProxySettings({
			'incognito': false
		}, function(config) {
			var opt = {};
			var mode = config["value"]["mode"];
			switch(mode) {
				case "system":
					opt = { icon: "sys.png", title: chrome.i18n.getMessage("useSys") };
					break;
				case "direct":
					opt = { icon: "off.png", title: chrome.i18n.getMessage("useDirect") };
					break;
				default:
					opt = { icon: "on.png", title: chrome.i18n.getMessage("useProxy") };
			}
			chrome.browserAction.setIcon({ path: opt.icon });
			chrome.browserAction.setTitle({ title: opt.title });
			if(callback) {
				callback(mode);
			}
		}
	);
}

chrome.runtime.onMessage.addListener(function(params, sender, sendResponse) {
	switch(params.message) {
		case "updateMode":
			updateMode(sendResponse);
			return true;
		case "getSettings":
			getSettings(params.options, sendResponse);
			return true;
		case "setSettings":
			setSettings(params.options, sendResponse);
			return true;
		case "setProxySettings":
			setProxySettings(params.options, sendResponse);
			return true;
		case "setFixedProxy":
			getSettings({
				trafficMode: "singleProxy",
				proxyList: null,
				selected: 0
			}, function(items) {
				var rulesOpt = {};
				var trafficMode = items.trafficMode;
				var item = JSON.parse(items.proxyList)[params.options.index];
				rulesOpt[trafficMode] = {
					scheme: item.scheme,
					host: item.host,
					port: parseInt(item.port)
				};
				setProxySettings({ value: { mode: "fixed_servers", rules: rulesOpt }, scope: "regular" }, function() {
					setSettings({ selected: params.options.index }, function() {
						sendResponse();
					});
				});
			});
			return true;
	}
});

updateMode();