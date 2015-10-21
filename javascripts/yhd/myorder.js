//我的订单
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
    api = new RemoteApi(data.settings);
    init();
  }
});

function init() {
	if(task.order_find_retry){
		if(task.order_find_retry > 2){
			reportError({message:"近期订单未能查找到该订单"});
		}
	}else{
		
	}
}

function orderSearch(){
	var hd_order_menu = $("#gridContent .mod_personal_head ul.condition_select .hd_order_menu").find("span");
	if(hd_order_menu[0].innerHTML == "近期订单"){
		console.log("当前显示的是近期订单");
		orderConfirm();
	}else if(hd_order_menu[0].innerHTML == "历史订单"){
        
		console.log("当前显示的是历史订单");
	}else{
		console.log("当前选中不是历史订单，不是近期订单");
	}
}

function orderConfirm(){
	console.log("收货开始");

	if(task.business_oid){
		var version_no = $("#versionNo_"+task.business_oid);
		if(version_no.length > 0){
			console.log("找到该订单");
			var order_confirm = $("#orderConfirm_"+task.business_oid).find("a");
			if(order_confirm.length > 0){
				console.log("找到确认收货");
				setTimeout(function(){
					chrome.extension.sendMessage({cmd: 'watchdog'});
					console.log("点击确认收货");
					order_confirm[0].click();
				},3000);
			}else{
				console.log("未找到确认收货");
				console.log("找 发表评价 追加评价");
				setTimeout(function(){
					chrome.extension.sendMessage({cmd: 'watchdog'});
					goComment();
				},3000);			
			}
		}else{
			console.log("本页未找到该订单");
			var page_next = $("a.page_next");
			if(page_next.length > 0){
				console.log("去下一页");
				setTimeout(function(){
					chrome.extension.sendMessage({cmd: 'watchdog'});
					page_next[0].click();
				},3000);
			}else{
				console.log("查找到最后一页，未找到该订单");
				task.order_find_retry = task.order_find_retry ? task.order_find_retry :0;
				if(task.order_find_retry > 2){
					//init	中会执行报错，开始下一个
				}else{
					console.log("查找到最后一页，未找到该订单,执行三次刷新，连续不能找到既报告错误");
					task.order_find_retry +=1;
					chrome.storage.local.set({task: task}, function() {
						setTimeout(function(){
							chrome.extension.sendMessage({cmd: 'watchdog'});
							window.location.reload(true);
						},3000);
					})				
				}

			}
		}
	}else{
		console.log("获取任务有误,无平台订单号内容,下一条");
		reportError({message:"获取任务有误,无平台订单号内容",delay:0});
	}
}

function confirmReceipt(){
	var mod_confirm_receipt_form = $(".popGeneral .mod_confirmReceipt_form .dialog_order_form h3");
	if(mod_confirm_receipt_form.length > 0){
		console.log("出现弹出框");
		if(mod_confirm_receipt_form[0].innerHTML == "确认收货"){
			console.log("确认收货开始");
			var btn_sub = $(".popGeneral .mod_confirmReceipt_form .dialog_order_form").find("a.btn_sub");
			if(btn_sub.length > 0){
				console.log("确认收货确定");
				setTimeout(function(){
					chrome.extension.sendMessage({cmd: 'watchdog'});
					console.log("点击确认收货");
					btn_sub[0].click();
					setTimeout(function(){
						chrome.extension.sendMessage({cmd: 'watchdog'});
						//goComment();
                        window.location.reload(true);
					},3000);
				},3000);
			}
		}
	}

}

function goComment(){

	reportSuccess({type:"receipt_success",message:"开始评价"});

	var body = task.order_comments_body;
	var business_oid = task.business_oid;
	if(body != '' && body != null){
		var comment_btn = $("#comment_"+business_oid).next(".input_ping_btn");
		if(comment_btn.length > 0){
			console.log('找到评价相关按钮');
			if(comment_btn.filter(':contains("发表评论")').length > 0){
				console.log('去评价 >>> ');
				setTimeout(function(){
					chrome.extension.sendMessage({cmd: 'watchdog'});
					comment_btn[0].click();
				},3000);
			}else if(comment_btn.filter(':contains("追加评论")').length > 0){
				console.log(" '追加评论'");
				console.log('已评价过，不再追加评价！');
				console.log('report_success');
				reportSuccess({type:"comment_success",message:"出现追加评价，判定为成功评价"});
			}else if(comment_btn.filter(':contains("查看评论")').length > 0){
				reportSuccess({type:"comment_success",message:"出现查看评论，判定为成功评价"});
			}else{
				var message = comment_btn[0].innerHTML;
				reportSuccess({type:"comment_success",message:"出现"+ message +"，判定为成功评价"});
			}
		}else{
			console.log('未找到评价相关按钮');
			reportSuccess({type:"comment_success",message:"未找到 发表评价 追加评价，视为成功评价"});
		}
	}else{
		console.log('无评价内容，暂不评价');
		console.log('下一条');
		setTimeout(function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			chrome.extension.sendMessage({cmd: 'task_done'});
		},3000);	
	}

}

var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
		//console.log(mutation.type);
		//console.log(mutation);
    if (running) {
			
      if (mutation.type === 'childList' && mutation.target.id === 'gridContent') {
				console.log("页面右侧变动");
				//console.log(mutation.target.innerHTML);
				console.log(mutation);
				//var hd_order_menu = $("#gridContent .mod_personal_head ul.condition_select .hd_order_menu").find("span");
				//if(hd_order_menu.length > 0){
					console.log("近期订单中查找订单");
					orderSearch();
				//}else{
				//	console.log("无历史订单，近期订单选择");
				//	orderConfirm();
				//}
      }
			
			if(mutation.type === 'childList' && mutation.target.id === "comParamId" && mutation.addedNodes.length > 0){
				var province_box = $(".popGeneral #provinceBox");
				if(province_box.length > 0){
					console.log("送货至弹出框");
					var select_province = $("#selectProvince");
					if(select_province.length > 0){
						var start_shopping = $("#startShopping");
						setTimeout(function(){
							chrome.extension.sendMessage({cmd: 'watchdog'});
							start_shopping[0].click();
							setTimeout(function(){
								chrome.extension.sendMessage({cmd: 'watchdog'});
								window.location.reload(true);
							},3000);
						},3000);
					}
				}
			}

			if(mutation.type === 'childList' && mutation.target.className === "popGeneral" && mutation.addedNodes.length > 0 ){
				console.log("出现弹出框");
				confirmReceipt();
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
		message=msg.message ? msg.message : "收获成功";
		api.reportTask("receipt_success", order_id, 0, message, function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			console.log("report ok");
		}, function(){
				chrome.extension.sendMessage({cmd: 'watchdog'});
				console.log("report fail");
				setTimeout(function(){
					chrome.extension.sendMessage({cmd: 'watchdog'});
					reportSuccess(msg);
				},3000);
		});
	}else if(msg.type=="comment_success"){
		message=msg.message ? msg.message : "评价成功";
		api.reportTask("comment_success", order_id, 0, message, function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			console.log("report ok");
			console.log("进入列表页判断已经评过，报告成功后，下一条");
			chrome.extension.sendMessage({cmd: 'task_done'});
		}, function(){
				chrome.extension.sendMessage({cmd: 'watchdog'});
				console.log("report fail");
				setTimeout(function(){
					chrome.extension.sendMessage({cmd: 'watchdog'});
					reportSuccess(msg);
				},3000);
		});	
	}else{
		setTimeout(function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			window.location.reload(true);
		},3000);		
	}
}


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
				//report success 执行下一条
				chrome.extension.sendMessage({cmd: 'task_done'});
			 var log={code:type,order_id:order_id,delay:delay,message:message,log:msg.log};
			 console.log(log);
		}, function(){
				chrome.extension.sendMessage({cmd: 'watchdog'});
				//report fail 
				setTimeout(function(){
					chrome.extension.sendMessage({cmd: 'watchdog'});
					reportError(msg);
				},3000);
		});
	}
}