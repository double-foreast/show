
messageListener();

setTimeout(function(){
	chrome.extension.sendMessage({cmd: 'watchdog'});
	init();
},3000);



function init() {
	var ranks = $('.rank').find('a:contains("会员")');
	if(ranks.length > 0){
		var rank = ranks[0];
		if(rank.href.indexOf('usergrade.jd.com')!=-1){
			var level = rank.innerText.replace('会员','');
			chrome.extension.sendMessage({cmd: 'level', level:level});
		}
	}
}

function messageListener(){
	chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){

		if(message.cmd == 'level'){

		}
	});


}
