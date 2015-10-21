//订单列表  收货
var task = null;
var running = null;
var api = null;

setTimeout(function(){
	chrome.extension.sendMessage({cmd: 'watchdog'});
	chrome.extension.sendMessage({cmd: 'get_cookies'});
},3000);

messageListener();

function init() {
	chrome.storage.local.get(null, function(data) {
		task = data.task;
		console.log("local_data:");
		console.log(data);
		running = data.running;

		clue('订单号:'+task.business_oid);
		if (running && data.settings) {
			api = new RemoteApi(data.settings);
			orderCheck();
		}
	});
}

function messageListener(){
	chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){

		if(message.cmd === 'reloaded'){
			if(message.retry > 3) {
				setTimeout(function () {
					chrome.extension.sendMessage({cmd: 'watchdog'});
					//reportError({message: message.message, delay: 24 * 3600});
				}, 2000);
			}else{
				setTimeout(function () {
					chrome.extension.sendMessage({cmd: 'watchdog'});
					window.location.reload(true);
				}, 2000);
			}
		}else if(message.cmd === 'cookies'){
			init();
		}
	});


}

function orderCheck(){
	console.log("判断是否有订单在此页面");
	var $order_tr = $('#track' + task.business_oid);
	if($order_tr.length > 0){
		clue("找到订单");
		chrome.extension.sendMessage({cmd: 'watchdog'});
		if($order_tr.find('span').filter(':contains("已取消")').length > 0){
			console.log("订单已取消");
			clue("订单已取消");
			//reportError({type:"receipt_error",message:"订单已取消"});
		}else if($order_tr.find(".td-01 .order-statu").filter(':contains("正在出库")').length > 0){
			console.log("未发现确认收货，订单正在出库");
			clue("订单正在出库");
			//reportError({type:"receipt_error",message:"订单正在出库",delay:3600*24});
		}else{
			//正常可进行下一步
			console.log("订单状态正常");
			setTimeout(function(){
				chrome.extension.sendMessage({cmd: 'watchdog'});
				orderReceived();
			},4000);
		}
	}else{
		console.log("本页没有找到订单，去搜索页");
		clue("没有找到订单，去搜索页");
		findOrder();
	}
}

function findOrder(){
	var search_input = $('#ip_keyword');
	if(search_input.length > 0){
		clue("搜索框搜索订单");
		if(search_input.val() == task.business_oid){
			var search_btn = $('a.btn-13');
			if(search_btn.length > 0){
				search_btn[0].click();
			}else{
				window.open('http://order.jd.com/center/search.action?keyword=' + task.business_oid);
			}
		}else{
			search_input.val(task.business_oid);
			setTimeout(function(){
				chrome.extension.sendMessage({cmd: 'watchdog'});
				findOrder();
			},2000);
		}
	}else{

	}
}



function orderReceived(){
	console.log("订单收货");
	var $btn_received = $('#track' + task.business_oid).find('a').filter(':contains("确认收货")');
	if($btn_received.length > 0){
		console.log("确认收货");
		clue("确认收货");
		var $onclick_str =  $btn_received.attr('onclick');
		var class_str =  $btn_received.attr('class');
		console.log("判断是否为弹出的收货确认");
		if($onclick_str!=undefined && $onclick_str.indexOf('showConfirmGoods') != -1){
			$btn_received[0].click();
			console.log("页面有收货弹出框，页面变化");
		}else if(class_str.indexOf('order-confirm') != -1){
			$btn_received[0].click();
			console.log("721新版,页面有收货弹出框，页面变化");
		}else{
			console.log("无确认收货，往下进行评价操作");
			setTimeout(function(){
				chrome.extension.sendMessage({cmd: 'watchdog'});
				goComment($("#idUrl"+task.business_oid));
			},3000);
		}
	}else{
		var order_status = $('#track' + task.business_oid).find('span:contains("正在出库")');
		if(order_status.length > 0){
			clue("正在出库");
			console.log("未发现确认收货，订单正在出库");
			//reportError({type:"receipt_error",message:"订单正在出库",delay:3600*24});
		}else{
			clue("已收货");
			console.log("未发现确认收货，往下进行评价操作");
			setTimeout(function(){
				chrome.extension.sendMessage({cmd: 'watchdog'});
				goComment($("#idUrl"+task.business_oid));
			},3000);
		}
	}
}

function goComment($comment_link){
	console.log("收货成功报告");

	setTimeout(function(){
		//reportSuccess({type:"receipt_success"});
		setTimeout(function(){
			if(task.order_comments_body){
				console.log("goComment");
				if($comment_link.length>0){
					clue("去订单详情页");
					console.log("去订单详情页");
					setTimeout(function(){
						chrome.extension.sendMessage({cmd: 'watchdog'});
						$comment_link[0].click();
					},3000);
				}else{
					console.log("无订单链接,或立即评价按钮");
					window.location.reload(true);
				}
			}else{
				console.log("任务中无评价内容");
				//reportError({type:"comment_error",message:"order_comments_body"});
			}
		},6000);
	},1000);
}

function confirmReceived(){
	var thickconfirm = $(".thickbox").find('a:contains("确认")');
	var dialog_confirm = $(".ui-dialog").find('a:contains("确认")');
	if(thickconfirm.length > 0 || dialog_confirm.length > 0){
		chrome.extension.sendMessage({cmd: 'watchdog'});
		//thickconfirm[0].click();
		confirmDeliver();
	}
}

function confirmDeliver(){
	var url = "http://odo.jd.com/oc/toolbar_confirmDeliver?action=confirmDeliver&orderid="+ task.business_oid;
	console.log(url);
	$.ajax({
		type:"GET",
		url:url,
		data:"",
		dataType:"json",
		timeout: 6e3,
		success: function(e) {
			console.log(e);
			setTimeout(function(){
				chrome.extension.sendMessage({cmd: 'watchdog'});
				window.location.reload(true);
			},3000);
		},
		error: function (e) {
			console.log('error');
			console.log(e);
			var message = e.responseText ? e.responseText : null;
			//responseText: "{html:"抱歉! 订单的状态不能执行该业务"}";
			if(message){
				if(message.indexOf('抱歉') != -1){
					setTimeout(function(){
						chrome.extension.sendMessage({cmd: 'watchdog'});
						//reportError({type:"receipt_error",message:message});
					},3000);
				}else{
					setTimeout(function(){
						chrome.extension.sendMessage({cmd: 'watchdog'});
						window.location.reload(true);
					},3000);
				}
			}else{
				setTimeout(function(){
					chrome.extension.sendMessage({cmd: 'watchdog'});
					window.location.reload(true);
				},3000);
			}

		}
	})
}

var observer = new MutationObserver(function(mutations){
	mutations.forEach(function(mutation) {
		//console.log(mutation.type);
		//console.log(mutation);
		if(mutation.target.className === "thickbox"){
			console.log(mutation.type);
			console.log(mutation);
		}
		if (running) {
			if(mutation.type === 'childList'){
				console.log(mutation.type);
				console.log(mutation.target.className);
				console.log(mutation);
				//if(mutation.target.className === "thickwrap"){
				if(mutation.target.className === "thickwrap" || mutation.target.className === "ui-dialog-content"){
					console.log(mutation.type);
					console.log(mutation);
					console.log("出现弹窗");


					var thicktitle = $(".thickwrap").find('.thicktitle:contains("确认收货")');
					var dialog_title = $(".ui-dialog").find('.ui-dialog-title:contains("确认收货")');
					if(thicktitle.length > 0 || dialog_title.length > 0){
						console.log("出现确认收货");
						var addNodes = mutation.addedNodes;
						if(addNodes.length == 1 ){
							var node = addNodes[0];
							console.log('node');
							console.log(node);
							//if(node.textContent == "确认收货"){
							if(node.textContent.indexOf("请确认是否已收到货") != -1 || node.textContent == "确认收货"){
								console.log("确认收货 start");
								setTimeout(function () {
									chrome.extension.sendMessage({cmd: 'watchdog'});
									confirmReceived();
								}, 3000);
							}
						}
					}
					var thickbox = $(".thickbox").find('a:contains("立即评价")');
					var dialog_comment = $(".ui-dialog").find('a:contains("立即评价")');
					if(thickbox.length > 0 || dialog_comment.length > 0){
						console.log("出现立即评价,去评价页");
						setTimeout(function(){
							chrome.extension.sendMessage({cmd: 'watchdog'});
							//goComment($(".thickbox").find('a:contains("立即评价")'));
							//window.location.reload(true);
						},3000);
					}
				}
			}
		}
	})
});

var config = { attributes: true, childList: true, characterData: true, subtree: true, attributeOldValue: true }
observer.observe(document.body, config);

function reportSuccess(msg){
	chrome.extension.sendMessage({cmd: 'watchdog'});
	console.log("reportSuccess");
	var order_id=task.order_id;
	var message=msg.message ? msg.message : "";
	if(msg.type=="receipt_success"){
		if(task.order_receipts_client_status == 3){

		}else{
			api.reportTask("receipt_success", order_id, 0, "收货成功", function(){
				console.log("report ok");
				var log={code:"receipt_success",order_id:order_id,delay:0,message:"收货成功"};
				console.log(log);
			}, function(){
				console.log("report fail");
				setTimeout(function(){
					chrome.extension.sendMessage({cmd: 'watchdog'});
					reportSuccess(msg);
				},3000);
			});
		}
	}
}

function reportError(msg){
	chrome.extension.sendMessage({cmd: 'watchdog'});
	console.log("reportError");
	var order_id=task.order_id;
	var message=msg.message ? msg.message : "";
	var delay=msg.delay ? msg.delay : 0;

	msg.type = msg.type ? msg.type :"";

	if(msg.type == ""){
		console.log("没有报错类型，默认为收货失败");
		msg.type = "receipt_error";
	}

	if(task.order_receipts_client_status == 3){
		console.log("任务中收货成功，报错类型修改为评价失败");
		msg.type = "comment_error";
	}

	if(msg.type=="receipt_error"){
		message = message ? message : "收货失败";

		api.reportTask("receipt_error", order_id, delay, message, function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			console.log("report ok");
			chrome.extension.sendMessage({cmd: 'task_done'});
			var log={code:"receipt_error",order_id:order_id,delay:delay,message:"收货失败"};
			console.log(log);
		}, function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			console.log("report fail");
			setTimeout(function(){
				chrome.extension.sendMessage({cmd: 'watchdog'});
				reportError(msg);
			},3000);
		});
	}
	if(msg.type=="comment_error"){
		message = message ? message : "评价失败";

		if(message == "order_comments_body"){
			console.log("直接下一条");
			chrome.extension.sendMessage({cmd: 'task_done'});
		}else{
			api.reportTask("comment_error", order_id, delay, message, function(){
				chrome.extension.sendMessage({cmd: 'watchdog'});
				console.log("report ok");
				chrome.extension.sendMessage({cmd: 'task_done'});
				var log={code:"comment_error",order_id:order_id,delay:delay,message:"收货成功"};
				console.log(log);
			}, function(){
				chrome.extension.sendMessage({cmd: 'watchdog'});
				console.log("report fail");
				setTimeout(function(){
					chrome.extension.sendMessage({cmd: 'watchdog'});
					reportError(msg);
				},3000);
			});
		}
	}
}