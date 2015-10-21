//账户风险验证
var task = null;
var running = null;
var api = null;
chrome.extension.sendMessage({cmd: 'watchdog'});
chrome.storage.local.get(null, function(data) {
  task = data.task;
  console.log("local_data:");
  console.log(data);  
  running = data.running;
  if (running && data.settings) {
    api = new RemoteApi(data.settings)
    init();
  }
});


function init() {
	var message = $('.tip-box').html();
	//因您的账户存在风险，需进一步校验您的信息以提升您的安全等级
	message=message?message:"登录需要手机短信验证";
	chrome.extension.sendMessage({cmd: 'disable',message: message});
}

var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    console.log(mutation.type);
    console.log(mutation);
    if (running) {

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
	console.log("默认为收货失败");
	if(task.order_receipts_client_status == 3){
		if(task.order_comments_client_status == 3 ){
			console.log("任务中评价成功下一条");
			type = "";
		}else{
			console.log("任务中收货成功，报评价失败");
			var type = "comment_error";
		}
	}
	if(type == ""){
		setTimeout(function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			chrome.extension.sendMessage({cmd: 'task_done'});
		},4000);
	}else{
		chrome.extension.sendMessage({cmd: 'watchdog'});
		api.reportTask(type, order_id, delay, message, function(){
			//report success 执行下一条
			setTimeout(function(){
				chrome.extension.sendMessage({cmd: 'watchdog'});
				chrome.extension.sendMessage({cmd: 'task_done'});
			},4000);
	
		}, function(){
			//report fail 
			setTimeout(function(){
				chrome.extension.sendMessage({cmd: 'watchdog'});
				reportError(msg);
			},5000);
		});
	}

}