"use strict";

{
	const key = "enable_open_if_candidate_only_one";
	window.enableOpenIfCandidateOnlyOne = localStorage[key] !== "false";

	const checkBox = document.getElementById("enable_open_if_candidate_only_one");
	checkBox.checked = enableOpenIfCandidateOnlyOne;
	checkBox.addEventListener("change", evt => {
		enableOpenIfCandidateOnlyOne = evt.checked;
		localStorage[key] = enableOpenIfCandidateOnlyOne;
	});
}
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
		const li = document.createElement("li");
		const elem = document.createElement("a");
		elem.innerText = extension.name;
		elem.title = extension.description;
		elem.href = "#";
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
			} else if (evt.key === "r") {
				// rキーで拡張をリロード
				chrome.management.setEnabled(extension.id, false, () => {
					chrome.management.setEnabled(extension.id, true);
				});
			}
		});
		if (!extension.enabled) {
			elem.style.color = "gray";
			elem.style.textDecoration = "line-through";
			li.appendChild(document.createTextNode("（無効）"));
		}
		li.appendChild(elem);
		container.appendChild(li);
		extension._elem = li;
	});

	function showCandidate({
		word = searchExtensionInput.value.toLowerCase(),
		openIfCandidateOnlyOne = false
	} = {}) {
		const matchedExtensionIds = [];
		extensions.forEach(extension => {
			const target = extension.name + "\n" + extension.description;
			if (target.toLowerCase().indexOf(word) !== -1) {
				extension._elem.style.display = "";
				matchedExtensionIds.push(extension.id);
			} else {
				extension._elem.style.display = "none";
			}
		});
		if (!enableOpenIfCandidateOnlyOne) {
			openIfCandidateOnlyOne = false;
		}
		if (openIfCandidateOnlyOne && matchedExtensionIds.length === 1) {
			chrome.tabs.create({
				url: "chrome://extensions/?id=" + matchedExtensionIds[0]
			});
		}
	}

	searchExtensionInput.addEventListener("compositionupdate", () => {
		// 日本語変換中
		window.setTimeout(() => {
			showCandidate({
				openIfCandidateOnlyOne: false
			});
		}, 1);
	});
	searchExtensionInput.addEventListener("compositionend", () => {
		// 日本語変換完了・変換キャンセル
		window.setTimeout(() => {
			showCandidate({
				openIfCandidateOnlyOne: true
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
				openIfCandidateOnlyOne: true
			});
		}, 1);
	});
});
