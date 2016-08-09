"use strict";

const container = document.getElementById("container");

const searchExtensionInput = document.getElementById("search-extension");
searchExtensionInput.focus();

chrome.management.getAll(list => {
	list.sort((a, b) => {
		if (a.shortName > b.shortName) return 1;
		if (a.shortName < b.shortName) return -1;
		return 0;
	});

	list.forEach(extensionInfo => {
		const elem = document.createElement("a");
		elem.innerText = extensionInfo.name;
		elem.href = "#";
		elem.style.display = "block";
		const openExtensionPage = () => {
			chrome.tabs.create({
				url: "chrome://extensions/?id=" + extensionInfo.id
			});
		};
		elem.onclick = openExtensionPage;
		elem.addEventListener("keydown", evt => {
			if (evt.key === " ") {
				// Spaceキーでも開く
				openExtensionPage();
			}
		});
		if (!extensionInfo.enabled) {
			elem.style.color = "gray";
			elem.style.textDecoration = "line-through";
			elem.title = "無効";
		}
		container.appendChild(elem);
		extensionInfo._elem = elem;
	});

	let matchedExtensions = [];
	function showCandidate(word) {
		matchedExtensions = [];
		list.forEach(extensionInfo => {
			const target = extensionInfo.name + "\n" + extensionInfo.description;
			if (target.toLowerCase().indexOf(word) !== -1) {
				extensionInfo._elem.style.display = "block";
				matchedExtensions.push(extensionInfo.id);
			} else {
				extensionInfo._elem.style.display = "none";
			}
		});
	}

	function openIfNarrowOnlyOne() {
		if (matchedExtensions.length === 1) {
			chrome.tabs.create({
				url: "chrome://extensions/?id=" + matchedExtensions[0]
			});
		}
	}

	const checkTransformationDecided = {
		clear: function (){
			window.clearTimeout(this.id);
		},
		start: function (){
			this.clear();
			this.id = window.setTimeout(openIfNarrowOnlyOne, 150);
		}
	};

	searchExtensionInput.onkeydown = evt => {
		// tabキーの場合
		if (evt.keyCode === 9) return;
		// 日本語変換確定のEnterはkeydown(229)だけイベントが発生してkeyupは発生しない
		window.setTimeout(() => {
			const word = searchExtensionInput.value.toLowerCase();
			// console.log("onkeydown", evt.keyCode, word);
			showCandidate(word);
			if (evt.keyCode === 229) checkTransformationDecided.start();
			else openIfNarrowOnlyOne();
		}, 1);
	};
	searchExtensionInput.onkeyup = evt => {
		// console.log("onkeyup", evt.keyCode);
		checkTransformationDecided.clear();
	};

	// 初回表示時
	showCandidate("");
});
