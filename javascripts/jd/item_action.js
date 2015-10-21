//订单详情  评价

var task = null;
var running = null;
var api = null;

chrome.extension.sendMessage({cmd: 'watchdog'});

chrome.storage.local.get(null, function(data) {
	task = data.task;
	console.log("local_data:");
	console.log(data);
	running = data.running;
	clue('订单号:'+task.business_oid);
	if (running && data.settings) {
		api = new RemoteApi(data.settings);
		init();
	}
});


function init() {
	goComment();
}

function goComment(){
	console.log("goComment");
	if(task.order_comments_body){
		var go_comment = $("#orderstate").find('a:contains("发表评价")');
		console.log("发表评价");
		if(go_comment.length>0){
			clue('发表评价');
			setTimeout(function(){
				chrome.extension.sendMessage({cmd: 'watchdog'});
				go_comment[0].click();
			},3000);

			console.log("发表评价");
		}else{
			//无发表评价，不可评价
			console.log("无发表评价，不可评价");
			var message = $("#orderstate").find("span.ftx14");
			if(message.length > 0){
				message = message[0].innerHTML;
				if(message == "正在出库"){
					reportError({type:"receipt_error",delay:3600*24,message:message});
				}
			}
		}
	}else{
		console.log("无评价内容 report_error");
		reportError({type:"comment_fail",message:"无评价内容"});
	}
}

var observer = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {
		console.log(mutation.type);
		console.log(mutation.target);
		if (running) {
			if(mutation.type === 'childList'){

			}
		}
	})
});

var config = { attributes: true, childList: true, characterData: true, subtree: true, attributeOldValue: true }
observer.observe(document.body, config);

function reportError(msg){
	chrome.extension.sendMessage({cmd: 'watchdog'});
	var order_id=task.order_id;
	var delay=msg.delay?msg.delay:0;
	var message=msg.message?msg.message:"";
	api.reportTask(msg.type, order_id, delay, message, function(){
		chrome.extension.sendMessage({cmd: 'watchdog'});
		console.log("report success 执行下一条");
		chrome.extension.sendMessage({cmd: 'task_done'});
	}, function(){
		chrome.extension.sendMessage({cmd: 'watchdog'});
		setTimeout(function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			reportError(msg);
		},3000);
	});
}