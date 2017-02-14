
chrome.browserAction.setBadgeText({
	text: "ext"
});


const KEY_ID_CONTEXT_MENU_ALL = "a";
const KEY_ID_CONTEXT_MENU_NOT_HAS_OPTION_PAGE = "b";
const KEY_ID_CONTEXT_MENU_OPEN_EXT_PAGE = "c";


chrome.runtime.onInstalled.addListener(readyToCreate);
chrome.runtime.onStartup.addListener(readyToCreate);

chrome.management.onInstalled.addListener(extensionInfo => {
	console.log("onInstalled: " + extensionInfo.name);
	readyToCreate();
});
chrome.management.onUninstalled.addListener(extensionInfo => {
	console.log("onUninstalled: " + extensionInfo.name);
	readyToCreate();
});
chrome.management.onEnabled.addListener(extensionInfo => {
	console.log("onEnabled: " + extensionInfo.name);
	readyToCreate();
});
chrome.management.onDisabled.addListener(extensionInfo => {
	console.log("onDisabled: " + extensionInfo.name);
	readyToCreate();
});

let timeoutId = null;
function readyToCreate(){
	if (timeoutId !== null) {
		window.clearTimeout(timeoutId);
	}
	timeoutId = window.setTimeout(createMenu, 100);
}
function createMenu (){
	const count = (() => {
		let i = 0;
		return () => {
			return i++;
		}
	})();
	chrome.contextMenus.removeAll(() => {
		chrome.management.getAll(list => {
			list.sort((a, b) => {
				if (a.shortName > b.shortName) return 1;
				if (a.shortName < b.shortName) return -1;
				return 0;
			});
			
			chrome.contextMenus.create({
				title: "拡張ページを表示",
				contexts: ["browser_action"],
				id: KEY_ID_CONTEXT_MENU_OPEN_EXT_PAGE
			});
			
			chrome.contextMenus.create({
				id: KEY_ID_CONTEXT_MENU_NOT_HAS_OPTION_PAGE,
				title: "一覧（オプション無し）",
				contexts: ["browser_action"]
			}, () => {
				list.forEach(extensionInfo => {
					if (extensionInfo.enabled && extensionInfo.installType === "development") {
						if (!extensionInfo.optionsUrl) {
							chrome.contextMenus.create({
								parentId: KEY_ID_CONTEXT_MENU_NOT_HAS_OPTION_PAGE,
								title: extensionInfo.shortName,
								contexts: ["browser_action"],
								id: "EXT_" + extensionInfo.id + "_" + count()
							});
						}
					}
				});
			});
			chrome.contextMenus.create({
				id: KEY_ID_CONTEXT_MENU_ALL,
				title: "一覧（ALL）",
				contexts: ["browser_action"]
			}, () => {
				list.forEach(extensionInfo => {
					if (extensionInfo.enabled && extensionInfo.installType === "development") {
						chrome.contextMenus.create({
							parentId: KEY_ID_CONTEXT_MENU_ALL,
							title: extensionInfo.shortName,
							contexts: ["browser_action"],
							id: "EXT_" + extensionInfo.id + "_" + count()
						});
					}
				});
			});
		});
	});
}

chrome.contextMenus.onClicked.addListener(info => {
	if (info.menuItemId === KEY_ID_CONTEXT_MENU_OPEN_EXT_PAGE) {
		chrome.tabs.create({
			url: "chrome://extensions/"
		});
	} else if (info.menuItemId.match(/^EXT_([a-z]+)_/)) {
		const extensionId = RegExp.$1;
		chrome.tabs.create({
			url: "chrome://extensions/?id=" + extensionId
		});
	}
});
