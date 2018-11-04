'use strict';

{
	const key = 'enable_open_if_candidate_only_one';
	window.enableOpenIfCandidateOnlyOne = localStorage[key] !== 'false';

	const checkBox = document.getElementById('enable_open_if_candidate_only_one');
	checkBox.checked = enableOpenIfCandidateOnlyOne;
	checkBox.addEventListener('change', evt => {
		enableOpenIfCandidateOnlyOne = evt.checked;
		localStorage[key] = enableOpenIfCandidateOnlyOne;
	});
}
const container = document.getElementById('container');

const searchExtensionInput = document.getElementById('search-extension');
searchExtensionInput.focus();

chrome.management.getAll(extensions => {
	extensions.forEach(extension => {
		extension._lowerCasedShortName = extension.shortName.toLowerCase();
	});
	extensions.sort((a, b) => {
		if (a._lowerCasedShortName > b._lowerCasedShortName) return 1;
		if (a._lowerCasedShortName < b._lowerCasedShortName) return -1;
		return 0;
	});

	extensions.forEach(extension => {
		const li = document.createElement('li');
		const elem = document.createElement('a');
		elem.innerText = extension.name;
		elem.title = extension.description;
		elem.href = '#';
		const openExtensionPage = () => {
			chrome.tabs.create({
				url: 'chrome://extensions/?id=' + extension.id,
			});
		};
		elem.onclick = openExtensionPage;
		elem.addEventListener('keydown', evt => {
			const key = evt.key.toLowerCase();
			if (key === ' ') {
				// Spaceキーでも開く
				openExtensionPage();
			} else if (key === 'o') {
				// oキーでオプションページを開く
				if (!extension.enabled) return;
				if (!extension.optionsUrl) return;
				chrome.tabs.create({
					url: extension.optionsUrl,
				});
			} else if (key === 'd') {
				// dキーで拡張を無効化
				if (!extension.mayDisable) return;
				chrome.management.setEnabled(extension.id, false);
			} else if (key === 'r') {
				// rキーで拡張をリロード
				if (!extension.mayDisable) return;
				if (extension.id === chrome.runtime.id) {
					chrome.runtime.reload();
				} else {
					chrome.management.setEnabled(extension.id, false, () => {
						chrome.management.setEnabled(extension.id, true, notifyReload);
					});
				}
			}
		});
		const notifyReload = () => {
			const duration = 2;
			const notification = document.createElement('span');
			notification.innerText = '更新完了！';
			notification.classList.add('reloaded-notification');
			notification.classList.add(`fadeout-${duration}s`);
			li.appendChild(notification);
			setTimeout(() => {
				li.removeChild(notification);
			}, duration * 1000);
		};
		if (extension.optionsUrl) {
			li.classList.add('has-options_page');
		}
		if (!extension.enabled) {
			li.classList.add('disabled');
		}
		if (!extension.mayDisable) {
			li.classList.add('controlled');
		}
		li.appendChild(elem);
		container.appendChild(li);
		extension._elem = li;
	});

	chrome.management.onEnabled.addListener(enabledExtension => {
		const extension = extensions.find(({id}) => id === enabledExtension.id);
		if (extension) {
			extension.enabled = true;
			extension._elem.classList.remove('disabled');
		}
	});
	chrome.management.onDisabled.addListener(disabledExtension => {
		const extension = extensions.find(({id}) => id === disabledExtension.id);
		if (extension) {
			extension.enabled = false;
			extension._elem.classList.add('disabled');
		}
	});

	const showCandidate = ({
		word = searchExtensionInput.value.toLowerCase(),
		openIfCandidateOnlyOne = false,
	} = {}) => {
		const matchedExtensionIds = [];
		// 半角スペースか全角スペース区切りでAND検索
		const words = word.split(/ |　/g);
		const isMatch = text => {
			return words.every(w => text.includes(w));
		};
		extensions.forEach(extension => {
			const target = extension.name + '\n' + extension.description;
			if (isMatch(target.toLowerCase())) {
				extension._elem.style.display = '';
				matchedExtensionIds.push(extension.id);
			} else {
				extension._elem.style.display = 'none';
			}
		});
		if (!enableOpenIfCandidateOnlyOne) {
			openIfCandidateOnlyOne = false;
		}
		if (openIfCandidateOnlyOne && matchedExtensionIds.length === 1) {
			chrome.tabs.create({
				url: 'chrome://extensions/?id=' + matchedExtensionIds[0],
			});
		}
	};

	searchExtensionInput.addEventListener('compositionupdate', () => {
		// 日本語変換中
		window.setTimeout(() => {
			showCandidate({
				openIfCandidateOnlyOne: false,
			});
		}, 1);
	});
	searchExtensionInput.addEventListener('compositionend', () => {
		// 日本語変換完了・変換キャンセル
		window.setTimeout(() => {
			showCandidate({
				openIfCandidateOnlyOne: true,
			});
		}, 1);
	});
	searchExtensionInput.addEventListener('keydown', evt => {
		// Tabキー
		if (evt.keyCode === 9) return;
		// 日本語入力中
		if (evt.keyCode === 229) return;
		window.setTimeout(() => {
			showCandidate({
				openIfCandidateOnlyOne: true,
			});
		}, 1);
	});
});
