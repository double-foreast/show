

chrome.extension.sendMessage({cmd: 'watchdog'});

setTimeout(function () {
    chrome.extension.sendMessage({cmd: 'adsl'});
},3000);

