var Chrome= {

    urls : {
        restart: 'chrome://restart/',
        quit: 'chrome://quit/',
        plugin: 'chrome://plugins/',
        setting: 'chrome://settings-frame/',
        extension: 'chrome://extensions-frame/'
    },

    restart: function(){
        console.log('restart the chrome');
        Chrome.extension(function () {
            Chrome.newTab(Chrome.urls.restart, function () {

            });
        });
    },

    quit: function(){
        console.log('quit the chrome');
        Chrome.newTab(Chrome.urls.quit, function () {

        });
    },

    closeOtherTab: function(callback){
        console.log('close tabs unactive');
        chrome.tabs.query({selected:false}, function(tabs) {
            if(tabs){
                for(var i=0;i<tabs.length;i++){
                    var remove_tab = tabs[i];
                    chrome.tabs.remove(remove_tab.id, function () {

                    });
                }
            }
        });
        callback && callback();
    },

    newTab: function(url,callback){
        console.log('create an new tab by url');
        chrome.tabs.create({url:url,selected:true}, function(){
            setTimeout(function () {
                callback && callback();
            },3000);
        });
    },

    setting: function(callback){
        console.log('create setting tab');
        Chrome.newTab(Chrome.urls.setting,function(){
            Chrome.closeOtherTab(function(){
                callback && callback();
            });
        });
    },

    plugin: function(callback){
        console.log('create plugin tab');
        Chrome.newTab(Chrome.urls.plugin,function(){
            Chrome.closeOtherTab(function(){
                callback && callback();
            });
        });
    },

    extension: function(callback){
        console.log('create extension tab');
        Chrome.newTab(Chrome.urls.extension,function(){
            Chrome.closeOtherTab(function(){
                callback && callback();
            });
        });
    }
};