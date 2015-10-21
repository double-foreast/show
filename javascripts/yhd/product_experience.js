//评论商品
var task = null;
var running = null;
var api = null;

chrome.storage.local.get(null, function(data) {
	task = data.task;
	console.log("local_data:");
	console.log(data);
	running = data.running;
	if (running && data.settings) {
		console.log("init:");
		api = new RemoteApi(data.settings);
		init();
	}
});


function init() {
	if(task.order_comments_body){
		console.log("任务中有评价内容！");
		commentComplate();
		orderComment();
	}else{
		console.log("任务中无评价内容！");
		chrome.extension.sendMessage({cmd: 'watchdog'});
		//report success 执行下一条
		chrome.extension.sendMessage({cmd: 'task_done'});
	}
}

function commentComplate(){
	console.log("任务评价内容长度补齐yhd所需字数！");
	var length=task.order_comments_body.length;

	if(length < 8){
		do{
			var position = Math.round(length * Math.random());
			var position_valid = false;
			if(position>0 && position<length){
				position_valid=true;
			}
		}while(!position_valid);
		task.order_comments_body=task.order_comments_body.substr(0,position)+" "+task.order_comments_body.substr(position);
		commentComplate();
	}else{

	}
}

function orderComment(){
	console.log("当前页面中的订单");
	var so_id = $("div[class='mod-comment-publishPl jsModCommentPublishPl']");
	if(so_id.length > 0){
		console.log("当前页面中有评价订单");
		var comment_soid = so_id.attr("soId");
		if(comment_soid == task.business_oid){
			console.log("当前页面评价订单是任务中的订单");
			var btn_submit =$("#btn_submit");
			if(btn_submit.length > 0){
				console.log("有提交按钮");
				setTimeout(function(){
					chrome.extension.sendMessage({cmd: 'watchdog'});
					mdescriptPoint();
				},2000);
			}else{
				setTimeout(function(){
					chrome.extension.sendMessage({cmd: 'watchdog'});
					window.location.reload(true);
				},3000);
			}
		}else{
			console.log("当前页面评价订单不是任务中的订单");
			//去我的订单页
			goList();
		}
	}else{
		console.log("当前页面中无评价订单");
		//去我的订单页
		goList();
	}
}

function goList(){
	console.log("goList");
	var hd_menu_list = $("#glHdMyYhd .hd_menu_list").find("li a").filter(':contains("我的订单")');
	if(hd_menu_list.length > 0){
		console.log("有我的订单");
		setTimeout(function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			hd_menu_list[0].click();
		},3000);
	}else{
		console.log("无我的订单");
		setTimeout(function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			window.location.reload(true);
		},3000);
	}
}

function mdescriptPoint(){
	console.log('商品与描述相符');
	var face = $('#mdescriptPoint');
	if(face.length > 0){
		if($('#mdescriptPoint').attr('data-val') == 5){
			setTimeout(function(){
				chrome.extension.sendMessage({cmd: 'watchdog'});
				mservicePoint();
			},1000);
		}else{
			var a5 = face.find('a.a5');
			if(a5.length > 0){
				a5[0].click();
				mdescriptPoint();
			}
		}
	}else{
		setTimeout(function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			mservicePoint();
		},1000);
	}
}

function mservicePoint(){
	console.log('商家的服务态度');
	var face = $('#mservicePoint');
	if(face.length > 0){
		if($('#mservicePoint').attr('data-val') == 5){
			setTimeout(function(){
				chrome.extension.sendMessage({cmd: 'watchdog'});
				mdeliveryPoint();
			},1000);
		}else{
			var a5 = face.find('a.a5');
			if(a5.length > 0){
				a5[0].click();
				mservicePoint();
			}
		}
	}else{
		setTimeout(function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			mdeliveryPoint();
		},1000);
	}
}

function mdeliveryPoint(){
	console.log('物流的发货速度');
	var face = $('#mdeliveryPoint');
	if(face.length > 0){
		if($('#mdeliveryPoint').attr('data-val') == 5){
			setTimeout(function(){
				chrome.extension.sendMessage({cmd: 'watchdog'});
				prodRating();
			},1000);
		}else{
			var a5 = face.find('a.a5');
			if(a5.length > 0){
				a5[0].click();
				mdeliveryPoint();
			}
		}
	}else{
		setTimeout(function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			prodRating();
		},1000);
	}
}

function prodRating(){
	console.log('商品评价');
	var face = $('#prodRating');
	if(face.length > 0){
		if($('#prodRating').attr('data-val') == 5){
			setTimeout(function(){
				chrome.extension.sendMessage({cmd: 'watchdog'});
				productExperienceContent();
			},5000);
		}else{
			var a5 = face.find('a.a5');
			if(a5.length > 0){
				a5[0].click();
				prodRating();
			}
		}
	}else{
		setTimeout(function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			productExperienceContent();
		},5000);
	}
}

function faceBox(){
	console.log("商品满意度");
	var face_box = $("#mod_cmt_edit").find(".face_box #prodRating");
	if(face_box.length > 0){
		console.log("商品满意度-");
		var face_a5 = face_box.find(".a5");
		if(face_a5.length > 0){
			console.log("商品满意度--非常满意");
			face_box.addClass("f5");
			$("#prodRating .a5")[0].click();
		}
		setTimeout(function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			productExperienceContent();
		},5000);
	}else{
		console.log("未找到商品满意度");
		setTimeout(function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			window.location.reload(true);
		},3000);
	}
}

function productExperienceContent(){
	console.log("评价内容！");
	var textarea = $("textarea#productExperienceContent");
	if(textarea.length > 0){
		console.log("找到评价框");
		textarea.val(task.order_comments_body);
		setTimeout(function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			summaryTag();
		},3000);
	}else{
		console.log("未找到评价框");
		setTimeout(function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			window.location.reload(true);
		},3000);
	}
}

function summaryTag(){
	console.log("总结标签");
	if(task.custom_tags){
		console.log("任务中有自定义标签内容");
		var summary_tag = $("#summary_tag #add_tag");
		if(summary_tag.length > 0){
			console.log("可以自定义总结标签");
			console.log("去除选定的标签");
			$("#summary_tag a.tag").removeClass("on");
			var tags = task.custom_tags.split(',');
			for(var i=0;i < tags.length;i++){
				$("#add_tag").before('<a data-val="1" class="tag removeEle remove on" diy="diy">' + tags[i] + '<i class="sub"></i><i class="close"></i></a>');
			}
			setTimeout(function(){
				chrome.extension.sendMessage({cmd: 'watchdog'});
				commentNiming();
			},3000);
		}else{
			setTimeout(function(){
				chrome.extension.sendMessage({cmd: 'watchdog'});
				commentNiming();
			},3000);
		}
	}else{
		console.log("任务中无自定义标签内容");
		setTimeout(function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			commentNiming();
		},3000);
	}
}

function commentScore(){
	var score = $("#dsrScore");
	if(score.length > 0){
		console.log("商品与描述相符：");
		console.log("商品的服务态度：");
		console.log("物流的发货速度：");
		$("#mdescriptPoint").addClass('f5');
		$("#mdescriptPoint .a5")[0].click();

		setTimeout(function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			$("#mservicePoint").addClass('f5');
			$("#mservicePoint .a5")[0].click();
			setTimeout(function(){
				chrome.extension.sendMessage({cmd: 'watchdog'});
				$("#mdeliveryPoint").addClass('f5');
				$("#mdeliveryPoint .a5")[0].click();
				setTimeout(function(){
					chrome.extension.sendMessage({cmd: 'watchdog'});
					commentNiming();
				},1000);
			},1000);
		},1000);
	}else{
		setTimeout(function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			commentNiming();
		},1000);
	}
}

function commentNiming(){
	var niming = $("#niming");
	if(task.anonymous){
		console.log("任务指定匿名评价");
		if(niming.length > 0){
			console.log("页面中有匿名勾选框");
			if($('#niming').hasClass('cur')){
				setTimeout(function(){
					chrome.extension.sendMessage({cmd: 'watchdog'});
					commentSubmit();
				},1500);
			}else{
				$('#niming').addClass('cur');
				commentNiming();
			}
		}else{
			console.log("页面中无匿名勾选框");
			setTimeout(function(){
				chrome.extension.sendMessage({cmd: 'watchdog'});
				commentSubmit();
			},1500);
		}
	}else{
		console.log("任务未指定匿名评价");
		setTimeout(function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			commentSubmit();
		},1500);
	}
}

function commentSubmit(){
	console.log("提交");
	var btn_submit = $("#btn_submit");
	if(btn_submit.length > 0){
		btn_submit[0].click();
	}else{
		setTimeout(function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			window.location.reload(true);
		},1500);
	}

}

var observer = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {
		// console.log(mutation.type);
		// console.log(mutation);
		if (running) {
			if (mutation.type === 'childList' && mutation.target.id === 'error_tips') {

			}
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
	api.reportTask("comment_error", order_id, delay, message, function(){
		chrome.extension.sendMessage({cmd: 'watchdog'});
		//report success 执行下一条
		chrome.extension.sendMessage({cmd: 'task_done'});
	}, function(){
		chrome.extension.sendMessage({cmd: 'watchdog'});
		//report fail
		setTimeout(function(){
			reportError(msg);
		},3000);
	});
}