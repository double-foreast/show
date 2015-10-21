//登陆
var task = null;
var running = null;
var api = null;

chrome.extension.sendMessage({cmd: 'watchdog'});

chrome.storage.local.get(null, function(data) {
  task = data.task;
  console.log("local_data:");
  console.log(data);  
  running = data.running;
	running = true;
  if (running && data.settings) {
    api = new RemoteApi(data.settings)
    init();
  }
});


function init() {
	reportError({message:"客官，你的账号可能有被盗风险 修改密码，抵御风险！改改更安全哦~~"});
}

var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (running) {
			console.log(mutation.type);
			console.log(mutation);
    }
  })
});

var config = { attributes: true, childList: true, characterData: true, subtree: true, attributeOldValue: true }
observer.observe(document.body, config);

function reportError(msg){
	var order_id=task.order_id;
	var delay=msg.delay ? msg.delay : 0;
	var message=msg.message ? msg.message : "";
	console.log(msg.log);

	var type = "receipt_error";
	console.log("默认错误类型为收货错误，");
	if(task.order_receipts_client_status == 3){
		if(task.order_comments_client_status == 3 ){
			console.log("默认错误类型为收货错误,任务中收货成功，评价成功，不报错误，下一条任务");
			type = "";
		}else{
			console.log("默认错误类型为收货错误,任务中收货成功，评价未成功设置错误类型为评价错误");
			type = "comment_error";
		}
	}
	
	if(type == ""){
		console.log("任务中收货成功，评价成功，不报错误，下一条任务");
		setTimeout(function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			chrome.extension.sendMessage({cmd: 'task_done'});
		},3000);		
	}else{
		chrome.extension.sendMessage({cmd: 'watchdog'});
		api.reportTask(type, order_id, delay, message, function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			console.log("report_error success 执行下一条");
			setTimeout(function(){
				chrome.extension.sendMessage({cmd: 'watchdog'});
				chrome.extension.sendMessage({cmd: 'task_done'});
			},3000);
		}, function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			console.log("report_error fail");
			setTimeout(function(){
				chrome.extension.sendMessage({cmd: 'watchdog'});
				reportError(msg);
			},3000);
		});		
	}
}