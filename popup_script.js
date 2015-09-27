var container = document.getElementById("container");

var searchExtensionInput = document.getElementById("search-extension");
searchExtensionInput.focus();

chrome.management.getAll(function(list) {
    list.sort(function(a, b) {
        if (a.shortName > b.shortName) return 1;
        if (a.shortName < b.shortName) return -1;
        return 0;
    });
    
    var matchedExtensions = [];
    function showCandidate(word) {
        matchedExtensions = [];
        list.forEach(function (extensionInfo){
            var name = extensionInfo.name;
            if ((name + "\n" + extensionInfo.description).toLowerCase().indexOf(word) !== -1) {
                var elem = document.createElement("a");
                elem.innerText = name;
                elem.href = "#";
                elem.style.display = "block";
                elem.onclick = function (){
                    chrome.tabs.create({
                        url: "chrome://extensions/?id=" + extensionInfo.id
                    });
                };
                container.appendChild(elem);
                matchedExtensions.push(extensionInfo.id);
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
    
    var checkTransformationDecided = {
    	clear: function (){
    		window.clearTimeout(this.id);
    	},
    	start: function (){
    		this.clear();
    		this.id = window.setTimeout(openIfNarrowOnlyOne, 150);
    	}
	};
    
    searchExtensionInput.onkeydown = function(evt) {
		// tabキーの場合
		if (evt.keyCode === 9) return;
    	// 日本語変換確定のEnterはkeydown(229)だけイベントが発生してkeyupは発生しない
    	window.setTimeout(function (){
	        var word = searchExtensionInput.value.toLowerCase();
	        container.innerText = "";
	    	// console.log("onkeydown", evt.keyCode, word);
	        showCandidate(word);
	        if (evt.keyCode === 229) checkTransformationDecided.start();
	        else openIfNarrowOnlyOne();
	    }, 1);
    };
    searchExtensionInput.onkeyup = function(evt) {
    	// console.log("onkeyup", evt.keyCode);
    	checkTransformationDecided.clear();
    };
    
    // 初回表示時
    showCandidate("");
});
