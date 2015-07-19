


chrome.browserAction.onClicked.addListener(function (){
	chrome.tabs.create({
		url: "chrome://extensions/"
	});
});


var KEY_ID_CONTEXT_MENU_ALL = "a";
var KEY_ID_CONTEXT_MENU_NOT_HAS_OPTION_PAGE = "b";


createMenu();
chrome.management.onInstalled.addListener(createMenu);
chrome.management.onUninstalled.addListener(createMenu);
chrome.management.onEnabled.addListener(createMenu);
chrome.management.onDisabled.addListener(createMenu);

function createMenu (){
	chrome.contextMenus.removeAll();
	chrome.contextMenus.create({
		id: KEY_ID_CONTEXT_MENU_NOT_HAS_OPTION_PAGE,
		title: "一覧（オプション無し）",
		contexts: ["browser_action"]
	});
	chrome.contextMenus.create({
		id: KEY_ID_CONTEXT_MENU_ALL,
		title: "一覧（ALL）",
		contexts: ["browser_action"]
	});
	chrome.management.getAll(function (list){
		list.sort(function (a, b){
			if (a.shortName > b.shortName) return 1;
			if (a.shortName < b.shortName) return -1;
			return 0;
		});
		list.forEach(function (extensionInfo /*, index, all */){
			if (extensionInfo.enabled && extensionInfo.installType === "development") {
				chrome.contextMenus.create({
					parentId: KEY_ID_CONTEXT_MENU_ALL,
					title: extensionInfo.shortName,
					contexts: ["browser_action"],
					onclick: function (info, tab){
						chrome.tabs.create({
							url: "chrome://extensions/?id=" + extensionInfo.id
						});
					}
				});
				if (!extensionInfo.optionsUrl) {
					chrome.contextMenus.create({
						parentId: KEY_ID_CONTEXT_MENU_NOT_HAS_OPTION_PAGE,
						title: extensionInfo.shortName,
						contexts: ["browser_action"],
						onclick: function (info, tab){
							chrome.tabs.create({
								url: "chrome://extensions/?id=" + extensionInfo.id
							});
						}
					});
				}
			}
		});
	});
}