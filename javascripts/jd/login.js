
var task = null;
var running = null;
var api = null;
messageListener();
chrome.extension.sendMessage({cmd: 'watchdog'});
chrome.extension.sendMessage({cmd: 'account'});

function messageListener(){
	chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
		if(message.cmd === 'account'){
			getTask();
		}
	});
}

function getAccount(){
	chrome.extension.sendMessage({cmd: 'account'});
	setTimeout(function(){
		if( !task ) {
			chrome.extension.sendMessage({cmd: 'watchdog'});
			getAccount();
		}
	}, 30000);
}

function getTask(){
	chrome.storage.local.get(null, function(data) {
		task = data.task;
		console.log("local_data:");
		console.log(data);
		running = data.running;
		if (running && data.settings) {
			api = new RemoteApi(data.settings);
			init();
		}
	});
}

function init() {
	var $loginname = $('#loginname');
	var $loginpwd = $('#nloginpwd');
	var $loginsubmit = $('#loginsubmit');
	var $authcode = $('#autocode');
	if($loginname.length > 0 && $loginpwd.length > 0 && $loginsubmit.length > 0){
		$loginname.val(task.username);
		setTimeout(function(){
			$loginpwd.val(task.password);
			setTimeout(function() {
				chrome.extension.sendMessage({cmd: 'watchdog'});
				if($('#loginname').val() == task.username && $('#nloginpwd').val() == task.password){
					$loginsubmit[0].click();
				}else{
					window.location.reload(true);
				}
			}, 3000);
		},3000);
	}else{
		console.log("页面无 登陆 用户框 密码框 //刷新页面");
		setTimeout(function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			window.location.reload(true);
		},3000);
	}
}

var observer = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {
		//console.log(mutation);
		//console.log(mutation.type);
		//console.log(mutation.target);
		if (running) {
			if(mutation.type === 'childList'){
				if(mutation.target.className == 'msg-wrap'){
					if(mutation.addedNodes.length > 0) {
						console.log(mutation);
						var message = mutation.target.innerText;

						if(!message){
							message = 'msg-wrap';
						}else{
							clue(message);
						}

						if($('div.msg-warn:visible')) {
							if( message.indexOf('自动登录')){

							}else{
								reportError({delay:24*3600,message:message,log:"msg-wrap"});
							}
						}

						if($('div.msg-error:visible').length > 0){
							if(message.indexOf('封锁') >= 0){
								//你的账号因安全原因被暂时封锁，请将账号和联系方式发送到shensu@jd.com，等待处理
								chrome.extension.sendMessage({cmd: 'disable',message: message});
							}else if(message.indexOf('账户名与密码不匹配') >= 0){
								//账户名与密码不匹配，请重新输入
								chrome.extension.sendMessage({cmd: 'disable',message: message});
							}else{
								reportError({delay:24*3600,message:message,log:"msg-wrap"});
							}
						}
					}
				}
				if(mutation.target.id === 'loginpwd_error'){
					console.log("loginpwd_error");
					console.log("用户名密码错误提示");
					var message = $('#loginpwd_error').html();
					if(!message){
						message = "loginpwd_error";
					}
					reportError({delay:0,message:message,log:"loginpwd_error"});
				}
				if(mutation.target.id === 'authcode_error'){
					chrome.extension.sendMessage({cmd: 'watchdog'});
					console.log("authcode_error");
					console.log("验证码错误提示");
					var message = $('#authcode_error').html();
					if(!message){
						message = "authcode_error";
					}
					reportError({delay:24*3600,message:message,log:"authcode_error"});
				}
				if(mutation.target.id === 'loginname_error'){
					chrome.extension.sendMessage({cmd: 'watchdog'});
					console.log("loginname_error");
					var message = $('#loginname_error').html();
					console.log("用户名错误提示");
					if(!message){
						message = "loginname_error";
					}
					reportError({delay:24*3600,message:message,log:"loginname_error"});
				}
			}
		}
	})
});

var config = { attributes: true, childList: true, characterData: true, subtree: true, attributeOldValue: true }
observer.observe(document.body, config);

function accountDisable(message){

}


function reportError(msg){
	var order_id=task.order_id;
	var delay=msg.delay ? msg.delay : 0;
	var message=msg.message ? msg.message : "";
	console.log(msg.log);
	if(message == "网络超时，请稍后再试"){
		setTimeout(function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			window.location.reload(true);
		},3000);
	}else if(message == "loginname_error"){
		console.log("reportError loginname_error");
	}else{
		var type = "receipt_error";
		if(task.order_receipts_client_status == 3){
			if(task.order_comments_client_status == 3 ){
				type = "";
			}else{
				type = "comment_error";
			}
		}
		if(type == ""){
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
				var log={code:"login_error",order_id:order_id,delay:delay,message:message,log:msg.log};
				console.log(log);
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
}