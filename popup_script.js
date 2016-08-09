"use strict";

const container = document.getElementById("container");

const searchExtensionInput = document.getElementById("search-extension");
searchExtensionInput.focus();

chrome.management.getAll(extensions => {
	extensions.sort((a, b) => {
		if (a.shortName > b.shortName) return 1;
		if (a.shortName < b.shortName) return -1;
		return 0;
	});

	extensions.forEach(extension => {
		const elem = document.createElement("a");
		elem.innerText = extension.name;
		elem.href = "#";
		elem.style.display = "block";
		const openExtensionPage = () => {
			chrome.tabs.create({
				url: "chrome://extensions/?id=" + extension.id
			});
		};
		elem.onclick = openExtensionPage;
		elem.addEventListener("keydown", evt => {
			if (evt.key === " ") {
				// Spaceキーでも開く
				openExtensionPage();
			}
		});
		if (!extension.enabled) {
			elem.style.color = "gray";
			elem.style.textDecoration = "line-through";
			elem.title = "無効";
		}
		container.appendChild(elem);
		extension._elem = elem;
	});

	function showCandidate({
		word = searchExtensionInput.value.toLowerCase(),
		openIfNarrowOnlyOne = false
	} = {}) {
		const matchedExtensionIds = [];
		extensions.forEach(extension => {
			const target = extension.name + "\n" + extension.description;
			if (target.toLowerCase().indexOf(word) !== -1) {
				extension._elem.style.display = "block";
				matchedExtensionIds.push(extension.id);
			} else {
				extension._elem.style.display = "none";
			}
		});
		if (openIfNarrowOnlyOne && matchedExtensionIds.length === 1) {
			chrome.tabs.create({
				url: "chrome://extensions/?id=" + matchedExtensionIds[0]
			});
		}
	}

	searchExtensionInput.addEventListener("compositionupdate", () => {
		// 日本語変換中
		window.setTimeout(() => {
			showCandidate({
				openIfNarrowOnlyOne: false
			});
		}, 1);
	});
	searchExtensionInput.addEventListener("compositionend", () => {
		// 日本語変換完了・変換キャンセル
		window.setTimeout(() => {
			showCandidate({
				openIfNarrowOnlyOne: true
			});
		}, 1);
	});
	searchExtensionInput.addEventListener("keydown", evt => {
		// Tabキー
		if (evt.keyCode === 9) return;
		// 日本語入力中
		if (evt.keyCode === 229) return;
		window.setTimeout(() => {
			showCandidate({
				openIfNarrowOnlyOne: true
			});
		}, 1);
	});

	// 初回表示時
	showCandidate({
		word: ""
	});
});
