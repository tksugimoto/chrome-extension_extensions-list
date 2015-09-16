


var KEY_ID_CONTEXT_MENU_ALL = "a";
var KEY_ID_CONTEXT_MENU_NOT_HAS_OPTION_PAGE = "b";


createMenu();
chrome.management.onInstalled.addListener(function (extensionInfo){
	console.log("onInstalled: " + extensionInfo.name);
	readyToCreate();
});
chrome.management.onUninstalled.addListener(function (extensionInfo){
	console.log("onUninstalled: " + extensionInfo.name);
	readyToCreate();
});
chrome.management.onEnabled.addListener(function (extensionInfo){
	console.log("onEnabled: " + extensionInfo.name);
	readyToCreate();
});
chrome.management.onDisabled.addListener(function (extensionInfo){
	console.log("onDisabled: " + extensionInfo.name);
	readyToCreate();
});

var timeoutId = null;
function readyToCreate(){
	if (timeoutId !== null) {
		window.clearTimeout(timeoutId);
	}
	timeoutId = window.setTimeout(createMenu, 100);
}
function createMenu (){
	chrome.contextMenus.removeAll(function (){
		chrome.management.getAll(function (list){
			list.sort(function (a, b){
				if (a.shortName > b.shortName) return 1;
				if (a.shortName < b.shortName) return -1;
				return 0;
			});
			
			chrome.contextMenus.create({
				title: "拡張ページを表示",
				contexts: ["browser_action"],
				onclick: function (){
					chrome.tabs.create({
						url: "chrome://extensions/"
					});
				}
			});
			
			chrome.contextMenus.create({
				id: KEY_ID_CONTEXT_MENU_NOT_HAS_OPTION_PAGE,
				title: "一覧（オプション無し）",
				contexts: ["browser_action"]
			}, function (){
				list.forEach(function (extensionInfo /*, index, all */){
					if (extensionInfo.enabled && extensionInfo.installType === "development") {
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
			chrome.contextMenus.create({
				id: KEY_ID_CONTEXT_MENU_ALL,
				title: "一覧（ALL）",
				contexts: ["browser_action"]
			}, function (){
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
					}
				});
			});
		});
	});
}