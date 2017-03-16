
chrome.browserAction.setBadgeText({
	text: "ext"
});


const KEY_ID_CONTEXT_MENU_OPEN_EXT_PAGE = "c";

chrome.contextMenus.create({
	title: "拡張ページを表示",
	contexts: ["browser_action"],
	id: KEY_ID_CONTEXT_MENU_OPEN_EXT_PAGE
});

chrome.contextMenus.onClicked.addListener(info => {
	if (info.menuItemId === KEY_ID_CONTEXT_MENU_OPEN_EXT_PAGE) {
		chrome.tabs.create({
			url: "chrome://extensions/"
		});
	}
});
