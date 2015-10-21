//order_comment
var task = null;
var settings = null;

var item_id = null;
var item_only = null;
var business_oid = null;

var running = null;

var api = null;

chrome.extension.sendMessage({cmd: 'watchdog'});

console.log('order_comment');

messageListener();

storageData();

/**
 * 初始化数据
 */
function storageData(){
	console.log("storage data");
	chrome.storage.local.get(null, function(data) {
		chrome.extension.sendMessage({cmd: 'watchdog'});

		//data = {
		//	task:{
		//		order_comments_body:'非常不错，是真皮的，很漂亮，质量杠杠滴',
		//		item_id:'1336119343',
		//		business_oid: '10314059037',
		//		anonymous:true,
		//		item_only:true,
		//		share:{
		//			id: 8961,
		//			status: 2
		//		},
		//		pictures:[
		//			{picture:'/Public/Uploads/Shares/201510/20151010124756_41035.jpg'}
		//		]
		//	},
		//	running:true,
		//	settings:{
		//		client_id : 'hn_001',
		//		running : true
		//	}
		//};

		task = data.task;
		settings = data.settings;
		item_id = task.item_id ? task.item_id : null;
		item_only = task.item_only ? true : false;
		business_oid = task.business_oid;


		console.log('task');
		console.log(task);
		console.log('settings');
		console.log(settings);

		running = data.running;
		console.log('running');
		console.log(running);

		api = new RemoteApi(settings);
		checkOrder()
	})
}

/**
 * 页面最大化
 * @param callback
 */
function documentZoom(callback){
	if (running && settings) {
		api = new RemoteApi(settings);
		chrome.extension.sendMessage({cmd: 'zoom'});
		callback && callback()
	}else{
		storageData()
	}
}

function messageListener(){
	chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
		if(message.cmd === 'reloaded'){

		}else if(message.cmd == 'zoom'){
			setTimeout(function () {
				chrome.extension.sendMessage({cmd: 'watchdog'});
				checkOrder()
			},500)
		}
	})
}

/**
 * 确保打开的订单页面  是任务中需要执行的订单
 */
function checkOrder(){
	var href = location.href;
	if(href.indexOf(business_oid) != -1){
		checkTaskData()
	}else{
		console.log('当前打开的不是任务中的订单');
		console.log('返回订单列表');
		location.href = 'http://order.jd.com/center/list.action'
	}
}

function checkTaskData(){
	if( ! task.order_comments_body){
		console.log('无评价内容');
		return false
	}
	commentComplate()
}

function checkComment(){
	var comt_order = $('#evalu01').find('.comt-plists');
	if(comt_order.length <= 0){
		console.log('没有找到订单显示部分');
		commentRelay('没有找到订单显示部分');
		return false
	}
	var comt_plist = comt_order.find('.comt-plist');
	if(comt_plist.length <= 0){
		console.log('无订单商品显示');
		commentRelay('无订单商品显示');
		return false
	}
	var comment_btns = comt_plist.find('.op-btns a[voucherstatus="0"]');
	console.log(comment_btns);
	if(comment_btns.length <=0){
		console.log('已全部评价');
		commentSuccess();
		return true
	}
	if(item_only){
		var item = comt_plist.find('.op-btns a[alt="'+ item_id +'"]');
		if(item.attr('voucherstatus') != 0 && item.text().indexOf('点击评价') == -1){
			console.log('仅评价主商品');
			console.log('主商品已评价');
			commentSuccess();
			return true
		}
	}
	showCommentBox()
}

/**
 * 评价商品
 */
function showCommentBox(){
	var btn = item_only ? $('a[alt="'+ item_id +'"][voucherstatus="0"]') : $('a.btn-9[voucherstatus="0"]');
	if(btn.length <= 0 ){
		checkComment()
	}else{
		chrome.extension.sendMessage({cmd: 'watchdog'});
		btn[0].click();
		setTimeout(function () {
			chrome.extension.sendMessage({cmd: 'watchdog'});
			checkComtBox()
		},10000)
	}
}

function checkComtBox(){
	var comt_box = $('.comt-box:visible');
	if(comt_box.length <= 0){
		showCommentBox()
	}else{

	}
}

function productComment(product_id){
	var btn_9 = $('a[alt="'+ product_id +'"][voucherstatus="0"]');
	if(btn_9.length >0){
		var comt_box = $('.comt-box[oid="'+ business_oid +'"][pid="'+ product_id +'"]:visible');
		if(comt_box.length <= 0){
			console.log('没有找到'+ product_id +'评价框');
			return false
		}
		productScore(comt_box)
	}
	else{
		if(product_id == item_id){
			checkShareData()
		}
	}
}

function productScore(comt_box){
	var star5 = comt_box.find('a.star5');
	if(star5.length <= 0){
		console.log('没有找到商品评5分');
		return false
	}

	if(star5.hasClass('active')){
		productTags(comt_box)
	}else{
		//star5.addClass('active');
		star5[0].click();
		setTimeout(function () {
			chrome.extension.sendMessage({cmd: 'watchdog'});
			productScore(comt_box)
		},1000)
	}
}

//function reportTags(comt_box){
//	var report_tags = [];
//	var tags = comt_box.find('.tags-list .tag-item a');
//	if(tags.length > 0) {
//		tags.each(function (i, tag) {
//			tag = $(this);
//			report_tags.push(tag.text());
//		});
//		api.reportTags(report_tags,function(data){
//			if(data.success){
//
//			}else{
//				window.location.reload(true)
//			}
//		},function(){
//			window.location.reload(true)
//		})
//	}
//}

function productTags(comt_box){
	var eventClick = new MouseEvent('click', {'view': window, 'bubbles': true, 'cancelable': true});
	var eventMove = new MouseEvent('mousemove', {'view': window, 'bubbles': true, 'cancelable': true});
	var eventDown = new MouseEvent('mousedown', {'view': window, 'bubbles': true, 'cancelable': true});
	var eventUp = new MouseEvent('mouseup', {'view': window, 'bubbles': true, 'cancelable': true});
	var eventBlur = new MouseEvent('blur', {'view': window, 'bubbles': true, 'cancelable': true});

	//var report_tags = [];

	var tags = comt_box.find('.tags-list .tag-item a');
	console.log(tags);
	if(tags.length > 0){
		tags.each(function(i,tag){
			//tag = tags.eq(i);
			tag = $(this);
			//report_tags.push(tag.text());
			//if(i%4==0 && i<13 && tag.hasClass('tag-txt-selected') == false){
			if(i==0){
				var value = tag.text();
				if((value.indexOf('不')==-1) && (value.indexOf('好')!=-1 || value.indexOf('快')!=-1)){

				}else{
					tags[i].dispatchEvent(eventMove);
					tags[i].dispatchEvent(eventDown);
					tags[i].dispatchEvent(eventClick);
					tag.click();
					tags[i].dispatchEvent(eventUp);
					tags[i].dispatchEvent(eventBlur);
					tag.removeClass('tag-txt-selected')
				}
			}
			else{
				var value = tag.text();
				if((value.indexOf('不')==-1) && (value.indexOf('好')!=-1 || value.indexOf('快')!=-1)){
					tags[i].dispatchEvent(eventMove);
					tags[i].dispatchEvent(eventDown);
					tags[i].dispatchEvent(eventClick);
					tag.click();
					tags[i].dispatchEvent(eventUp);
					tags[i].dispatchEvent(eventBlur);
					tag.addClass('tag-txt-selected')
				}
			}
		})
	}

	setTimeout(function () {
		chrome.extension.sendMessage({cmd: 'watchdog'});
		productXinde(comt_box)
	},5000)
}

function productXinde(comt_box){
	var area = comt_box.find('textarea');
	if(area.length <= 0){
		console.log('没有找到商品心得输入框')
	}
	Writing(area, task.order_comments_body, function () {
		if(area.val() == task.order_comments_body){
			area.blur();
			productCommentAnonymous(comt_box)
		}else{
			productXinde(comt_box)
		}
	})
}



function keybordInput(area,callback){
	var eventKeydown = new MouseEvent('keydown', {'view': window, 'bubbles': true, 'cancelable': true});
	var eventKeyup = new MouseEvent('keyup', {'view': window, 'bubbles': true, 'cancelable': true});
	area.dispatchEvent(eventKeydown);
	area.dispatchEvent(eventKeyup);
	setTimeout(function () {
		chrome.extension.sendMessage({cmd: 'watchdog'});
		callback && callback()
	},2000)
}

function productCommentAnonymous(comt_box){
	if(task.anonymous){
		var anonymousFlag = comt_box.find('#anonymousFlag');
		if(anonymousFlag.length > 0){
			anonymousFlag.attr('checked',true)
		}
	}
	setTimeout(function () {
		chrome.extension.sendMessage({cmd: 'watchdog'});
		productCommentSubmit(comt_box)
	},1000)
}

function productCommentSubmit(comt_box){
	var setcomment = comt_box.find('.setcomment');
	if(setcomment.length > 0){
		chrome.extension.sendMessage({cmd: 'watchdog'});
		setcomment[0].click()
	}
}

/**
 * 四项评分
 */
function serviceScore(){
	console.log('四项评分');
	var score = $('.score:visible');
	if(score.length > 0){
		var commstars = $('div[class="score"] > dl[class="ev-list"] > dd > span[class="commstar"]');
		if(commstars.length > 0){
			for(var i = 0;i < commstars.length;i++){
				console.log("选最后一个满分");
				var star_last = $(commstars[i]).find('a:last');
				if(star_last.length > 0){
					star_last[0].click()
				}
			}
			var service_score_submit = $('a[class="btn-5"]');
			if(service_score_submit.length > 0){
				console.log("四项评分提交按钮");
				setTimeout(function(){
					chrome.extension.sendMessage({cmd: 'watchdog'});
					service_score_submit[0].click()
				},1000)
			}
		}
	}
	checkShareData()
}

function checkShareData(){
	task.sharing = task.sharing ? task.sharing : false;
	if(task.sharing == false){
		task.sharing = true;
		console.log('晒单');
		var share = task.share;
		var pictures = task.pictures;
		console.log(share);
		console.log(pictures);
		if(share && pictures){
			checkShare()
		}else{
			setTimeout(function(){
				chrome.extension.sendMessage({cmd: 'watchdog'});
				chrome.extension.sendMessage({cmd: 'task_done'})
			},2000)
		}
	}
}

function checkShare(){
	var btn_9 = $('a[alt="'+ item_id +'"]');
	if(btn_9.attr('voucherstatus') == 1){
		if(btn_9.text().indexOf('晒单') != -1){
			itemCommentBoxShow(itemShare)
		}
	}else if(btn_9.attr('voucherstatus') == 2){
		console.log('已晒单');
		itemCommentBoxShow(sharedImages)
	}
}

function itemCommentBoxShow(callback){
	var item_comm_box = $('.comt-box[pid="'+ item_id +'"]:visible');
	if(item_comm_box.length > 0){
		callback && callback()
	}else{
		$('a[alt="'+ item_id +'"]')[0].click();
		setTimeout(function () {
			chrome.extension.sendMessage({cmd: 'watchdog'});
			itemCommentBoxShow(callback)
		},3000)
	}

}

function sharedImages(){
	var imgs = $('.img-list .img-list-ul').find('img');
	console.log(imgs);
	var imgNum=imgs.length;
	imgs.load(function(){
		if(!--imgNum){
			// 加载完成
			console.log('share images loaded');
			captureArea();
		}
	});
}

function captureArea(){
	var scroll_top = document.body.scrollTop;
	var offset = $('.pro-info[pid="'+ item_id +'"]').offset();
	if (scroll_top != offset.top) {
		document.body.scrollTop = offset.top;
		setTimeout(function () {
			chrome.extension.sendMessage({cmd: 'watchdog'});
			captureArea();
		}, 600);
	} else {
		orderCapture();
	}
}

function orderCapture(){
	var share = task.share;
	var pictures = task.pictures;
	var show = new Show(share,pictures);
	show.capture();
}

function showSubmit(pictures){
	if(pictures){
		var imgs = '';
		for(var i in pictures){
			var picture = pictures[i];
			imgs += i>0 ? ',' : '';
			imgs += '//img30.360buyimg.com/shaidan/'+picture.res
		}
		var product_name = $('.pro-info[oid="'+ business_oid +'"][pid="'+ item_id +'"]').find('.p-name a').text();
		var data = {
			imgs: imgs,
			productId:item_id,
			orderId: business_oid,
			anonymousFlag: task.anonymous ? 1 : 0,
			productName: encodeURI(product_name)
		};
		//commitShare(data)
	}else{

	}
	//var comt_box = $('.comt-box[oid="'+ business_oid +'"][pid="'+ item_id +'"]:visible');
	//if(comt_box.length > 0){
	//	productCommentSubmit(comt_box);
	//}
}

function commitShare(data){
	var url = "http://club.jd.com/myJdcomments/commitJdForm.action";
	console.log(url);
	$.ajax({
		type:"POST",
		url:url,
		data:data,
		dataType:"json",
		success: function(e) {
			console.log('share success');
			console.log(e);
			//setTimeout(function(){
			//	chrome.extension.sendMessage({cmd: 'watchdog'});
			//	window.location.reload(true);
			//},3000);
		},
		error: function (e) {
			console.log('share error');
			console.log(e);
			//var message = e.responseText ? e.responseText : null;
			////responseText: "{html:"抱歉! 订单的状态不能执行该业务"}";
			//if(message){
			//	if(message.indexOf('抱歉') != -1){
			//		setTimeout(function(){
			//			chrome.extension.sendMessage({cmd: 'watchdog'});
			//			reportError({type:"receipt_error",message:message});
			//		},3000);
			//	}else{
			//		setTimeout(function(){
			//			chrome.extension.sendMessage({cmd: 'watchdog'});
			//			window.location.reload(true);
			//		},3000);
			//	}
			//}else{
			//	setTimeout(function(){
			//		chrome.extension.sendMessage({cmd: 'watchdog'});
			//		window.location.reload(true);
			//	},3000);
			//}
		}
	})
}

function itemShare(){
	var show = new Show(task.share,task.pictures);
	show.submit(function(){

	});
}

var observer = new MutationObserver(function(mutations) {
	mutations.forEach(function (mutation) {
		if(mutation.type == 'characterData') {
			console.log(mutation.type);
			var target = mutation.target;
			console.log(target);
			if(target.data && target.data.indexOf('1-500字') != -1){
				//console.log(target.parentNode);
				//parentNodeUntilComtBox(target)
			}
			else if(target.data && target.data.indexOf('麻烦填写0-500个字哦')!=-1){

			}
			else if(target.data && target.data.indexOf('给商品打个标签呗')!=-1){
				//window.location.reload(true)
			}
			else if(target.data && target.data.indexOf('最多能打五个标签呦，思考一下')!=-1){
				window.location.reload(true)
			}
		}else if(mutation.type == 'childList'){
			//console.log('childList');
			//console.log(mutation.target);
			//console.log(mutation);
			if(mutation.target.className == 'ui-dialog'){
				if(mutation.target.innerText.indexOf('评价成功') != -1){
					showCommentBox()
				}
				else if(mutation.target.innerText.indexOf('屏蔽词') != -1){
					commentReplace(mutation.target.innerText)
				}
			}
		}else if(mutation.type == 'attributes'){
			if(mutation.target.className.indexOf('comt-box')!=-1){
				if(mutation.attributeName == 'style' && mutation.oldValue == null) {
					currentComtBox(mutation.target)
				}
			}
		}else{

		}
	})
});

observer.observe(document.body, {
	attributes: true,
	childList: true,
	characterData: true,
	subtree: true,
	attributeOldValue: true
});

function commentSuccess(msg){
	console.log('评价成功 report');
	chrome.extension.sendMessage({cmd: 'watchdog'});
	msg = msg ? msg : '';
	api.reportTask("comment_success", task.order_id, 0, msg, function(){
		chrome.extension.sendMessage({cmd: 'watchdog'});
		serviceScore()
	}, function(){
		chrome.extension.sendMessage({cmd: 'watchdog'});
		setTimeout(function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			reportSuccess(msg);
		},5000);
	});
}

function commentFail(){

}

function commentRelay(msg){
	chrome.extension.sendMessage({cmd: 'watchdog'});
	var order_id=task.order_id;
	var delay= 24*3600;
	msg = msg ? msg : "";
	api.reportTask('comment_error', order_id, delay, msg, function(){
		chrome.extension.sendMessage({cmd: 'watchdog'});
		setTimeout(function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			chrome.extension.sendMessage({cmd: 'task_done'});
		},4000);
	}, function(){
		chrome.extension.sendMessage({cmd: 'watchdog'});
		setTimeout(function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			commentRelay(msg);
		},5000);
	});
}

function currentComtBox(target){
	var attrs = target.attributes;
	var oid = null;
	var pid = null;
	var style = null;
	for (var i in attrs) {
		var attr = attrs[i];
		if (attr.name == "oid") {
			oid = attr.value;
		} else if (attr.name == 'pid') {
			pid = attr.value;
		} else if (attr.name == 'style') {
			style = attr.value;
		}
	}
	console.log('oid:' + oid);
	console.log('pid:' + pid);
	console.log('style:' + style);
	if (oid && oid == business_oid && pid && style.indexOf('none') == -1) {
		productComment(pid)
	}
}

function parentNodeUntilComtBox(target){
	if(target.parentNode.className.indexOf('comt-box')!=-1){
		console.log(target.parentNode);
		var attrs = target.parentNode.attributes;
		console.log(attrs);
		var pid = null;
		var oid = null;

		for(var i in attrs){
			var attr = attrs[i];
			if(attr.name == "oid"){
				oid = attr.value;
			}else if(attr.name == 'pid'){
				pid = attr.value;
			}else{

			}
		}
		if(pid && oid && oid == business_oid){
			productComment(pid)
		}
	}else{
		parentNodeUntilComtBox(target.parentNode)
	}
}

function commentReplace(text){
	var word=text.split('屏蔽词');
	word=word[1];

	word=word.split('，');
	word=word[0];

	word=word.split('“');
	word=word[0]?word[0]:word[1];
	word=word.split('”');
	word=word[0]?word[0]:word[1];

	do{
		var word_rep = new Array( word.length + 1 ).join( '?' );
		task.order_comments_body = task.order_comments_body.replace(word,word_rep);
		var temp=task.order_comments_body.split(word);
	}while(temp.length!=1);
	var comt_box = $('.comt-box:visible');
	if(comt_box.length > 0){
		var product_id = comt_box.attr('pid');
		productComment(product_id)
	}
	//chrome.storage.local.set({task:task},function(){
	//	window.location.reload(true)
	//})
}

function commentComplate(){
	console.log(task.order_comments_body);
	console.log('去除空。处理已知屏蔽词');
	var re_str = ' ';
	task.order_comments_body = task.order_comments_body.replace(new RegExp(re_str,'gm'),'');
	task.order_comments_body = task.order_comments_body.toUpperCase();
	var strs = ['天瘦','买卖','天猫','MD','一B','TM','口交','DIY','AV','QQ群','C4','——','~','～','TMD','X东','TB','T猫','A片'];
	for(var i in strs){
		var str = strs[i];
		var rep = new Array( str.length + 1 ).join( '?' );
		task.order_comments_body = task.order_comments_body.replace(new RegExp(str,'gm'),rep)
	}

	var length=checksum(task.order_comments_body);
	console.log(length);
	if(length == 1){
		task.order_comments_body += " "
	}
	length=checksum(task.order_comments_body);
	if(length < 10){
		console.log("length < 10");
		do{
			var position = Math.round(length * Math.random());
			var position_valid = false;
			if(position>0 && position<length){
				position_valid=true
			}
		}while(!position_valid);
		task.order_comments_body=task.order_comments_body.substr(0,position)+"?"+task.order_comments_body.substr(position);
		commentComplate()
	}else{
		showCommentBox()
	}
}


//功能：统计包含汉字的字符个数
//说明：汉字占1个字符，非汉字占0.5个字符
function checksum(chars){
	var sum = 0;
	for (var i=0; i<chars.length; i++)
	{
		var c = chars.charCodeAt(i);
		if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f))
		{
			sum++;
		}
		else
		{
			sum+=2;
		}
	}

	return Math.floor(sum/2);
}
