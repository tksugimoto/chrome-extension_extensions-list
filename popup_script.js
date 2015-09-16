var container = document.getElementById("container");

var searchExtension = document.getElementById("search-extension");
searchExtension.focus();

chrome.management.getAll(function(list) {
    list.sort(function(a, b) {
        if (a.shortName > b.shortName) return 1;
        if (a.shortName < b.shortName) return -1;
        return 0;
    });
    
    function showCandidate(word) {
        var matchedExtensions = [];
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
        if (matchedExtensions.length === 1) {
            chrome.tabs.create({
                url: "chrome://extensions/?id=" + matchedExtensions[0]
            });
        }
    }
    
    searchExtension.onkeyup = function(evt) {
        var word = this.value.toLowerCase();
        container.innerText = "";
        showCandidate(word);
    };
    
    // 初回表示時
    showCandidate("");
});
