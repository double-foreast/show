//订单评价
var task = null;
var running = null;
var api = null;
var item_id = null;
var item_only = true;
var settings = null;

var showing = false;

var retry = null;

var zoom = null;

chrome.extension.sendMessage({cmd: 'watchdog'});

console.log('trade_comment.js');
messageListener();
chrome.storage.local.get(null, function(data) {
	console.log('chrome.storage.local.get');
	//data = {
	//	task:{
	//		order_comments_body:'还没怎么使用，感觉还可以，打开记录仪录像还是挺清晰的，好评',
	//		item_id:1407113408,
	//		custom_tags:'录像清晰,画质很好'
	//	},
	//	running:true,
	//	settings:{
	//		client_id : 'gd002',
	//		running : true
	//	}
	//};
	task = data.task;
	settings = data.settings;
	item_id = task.item_id ? task.item_id : null;
	item_only = task.item_only ? true : false;
	if( ! item_id) {
		var last_product = $('.pro-info').last();
		if(last_product) {
			item_id = last_product.attr('pid');
		}
	}


	console.log("local_data:");
	console.log(data);
	console.log(task);
	running = data.running;
	if (running && data.settings) {
		api = new RemoteApi(data.settings);
		//init();
		documentZoom(function(){

		});
	}
});


function documentZoom(callback){
	chrome.extension.sendMessage({cmd: 'zoom'});
	callback && callback();
	//zoom = document.body.style.cssText;
	//console.log(zoom);
	//if(zoom){
	//	do{
	//		zoom = zoom.replace(' ','');
	//		var temp=zoom.split(' ');
	//	}while(temp.length!=1);
	//	console.log(zoom);
	//	if(zoom == 'zoom:1;'){
	//		console.log('当前显示为100%模式');
	//		callback && callback();
	//	}
	//}else{
	//	document.body.style.cssText = 'zoom: 1;';
	//	setTimeout(function () {
	//		chrome.extension.sendMessage({cmd: 'watchdog'});
	//		documentZoom(callback);
	//	},1000);
	//}
}

function messageListener(){
	chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){

		if(message.cmd === 'reloaded'){
			if(message.retry > 3) {
				setTimeout(function () {
					chrome.extension.sendMessage({cmd: 'watchdog'});
					reportError({message: message.message, delay: 24 * 3600});
				}, 2000);
			}else{
				setTimeout(function () {
					chrome.extension.sendMessage({cmd: 'watchdog'});
					window.location.reload(true);
				}, 2000);
			}
		}else if(message.cmd == 'zoom'){
			setTimeout(function () {
				chrome.extension.sendMessage({cmd: 'watchdog'});
				init();
			},500);
		}
	});


}

function init() {
	if(task.order_comments_body){
		var $goods_trs = $('table[class="tb-void tb-line"] > tbody > tr');
		if($goods_trs.length == 0){
			console.log("未找到订单商品列表");
			setTimeout(function() {
				chrome.extension.sendMessage({cmd: 'watchdog'});
				window.location.reload(true);
			}, 3000);
		}else{
			console.log("评价开始");
			var no_comment=$('table[class="tb-void tb-line"]').filter(':contains("暂无商品评价")');

			var tip_num = $('#tip-num:contains("全部已评价")');

			if(no_comment.length > 0){
				if(tip_num.length > 0){
					console.log("全部已经评过了");
					//reportSuccess({message:"全部已评价"});
					setTimeout(function () {
						chrome.extension.sendMessage({cmd: 'reload',message: '暂无商品评价 全部已评价'});
					}, 3000);

				}else{
					console.log("暂无商品评价,tip-num不是全部已评价，jd加载有问题，刷新页面");
					setTimeout(function(){
						chrome.extension.sendMessage({cmd: 'watchdog'});
						window.location.reload(true);
					},3000);
				}
			}else{
				console.log("有商品列出");
				if(tip_num.length > 0){
					console.log("全部已评价");
					setTimeout(function(){
						chrome.extension.sendMessage({cmd: 'watchdog'});
						commentScore();
					},10000);
				}else {


					console.log("有未评价商品");
					var item = $("ul[pid='" + item_id + "']");
					if (item.length > 0) {
						if(item_only){
							item_product();
						}else{

						}
					} else {
						console.log('未找到主商品');
					}
				}
			}
		}
	}else{
		console.log("无评价内容 report_error");
		reportError({type:"comment_error",message:"任务中无评价内容"});
	}
}

function commentStar(){
	var $comment_box = $('div[class="comment-box prompt01"]');
	if($comment_box.find('.commstar a.star5').length>0){
		console.log("评分5");
		$comment_box.find('a.star5')[0].click();
	}
}

function commentTags(){
	console.log("开始自定义标签");
	if(task.custom_tags){
		console.log("任务中有自定义标签内容");
		console.log(task.custom_tags);
		console.log("标签");
		var $li_tags = $('ul[class="tips-list"] li.list-last').filter(":contains('自定义')");
		console.log("可以自定义标签");
		if($li_tags.length > 0){
			console.log("商品评价中有自定义标签");
			var tags = task.custom_tags.split(',');
			console.log(tags);
			var label_select=$('div[class="comment-box prompt01"]:visible').find("li.select");
			if(label_select.length==0){
				console.log("没有有选中的标签，添加自定义标签");
				for(var i=0;i < tags.length;i++){
					$li_tags.before('<li class="select" vid=""><s class="f-check"></s>' + tags[i] + '</li>');
				}
			}else{
				console.log("有选中的标签，不再选标签");
			}

			var label_select=$('div[class="comment-box prompt01"]:visible').find("li.select");
			if(label_select.length>5){
				console.log("自定义评价标签选中超过5个");
				setTimeout(function(){
					chrome.extension.sendMessage({cmd: 'watchdog'});
					window.location.reload(true);
				},3000);
			}else if(label_select.length==0){
				console.log("自定义评价标签未设置成功");
				setTimeout(function(){
					chrome.extension.sendMessage({cmd: 'watchdog'});
					window.location.reload(true);
				},3000);
			}else{
				console.log("自定义评价标签ok");
			}
		}else{
			console.log("该商品无自定义标签");
		}
	}else{
		console.log("任务无自定义标签内容");
	}
}

function commentTextarea(){
	console.log("commentTextarea");
	console.log("心得");
	var $comment_textarea = $('div[class="comment-box prompt01"]:visible').find('textarea');
	if($comment_textarea){
		console.log("$comment_textarea");
		commentComplate();
		console.log("focus");
		$comment_textarea.focus().val(task.order_comments_body);
		console.log("commentTextarea ok");
	}
}

function commentAnonymous(){
	console.log("commentAnonymous");
	console.log("匿名评价");
	if(task.anonymous){
		$('div[class="comment-box prompt01"]:visible').find('#anonymousFlag').attr('checked',true);
	}
}

function commentSecCode(){
	console.log("commentSecCode");
	console.log("验证码");
	if(($('div[class="comment-box prompt01"]:visible').find('#seccode:visible').length > 0) && ($('div[class="comment-box prompt01"]:visible').find("#seccode:visible").next('img.seccodeimg').length >0)){
		if($('div[class="comment-box prompt01"]:visible').find('#seccode').val().length == 4){
			ymdCode();
		}else{
			commentSecCode();
		}
	}else{
	}
}

function commentScore(){
	console.log("四项评分");
	if($('div.score-succ').is(':visible')){
		console.log("评价成功了，observe中会处理");
	}else{
		$div_score = $('div[class="score"]');
		if($div_score.length > 0){
			console.log("四项评分");
			var $span_comments = $('div[class="score"] > dl[class="ev-list"] > dd > span[class="commstar"]');
			if($span_comments.length > 0){
				for(var i = 0;i < $span_comments.length;i++){
					console.log("选最后一个满分");
					var $a_last = $($span_comments[i]).find('a:last');
					if($a_last.length > 0){
						$a_last[0].click();
					}
				}
				var $btn_submit = $('a[class="btn-5"]');
				if($btn_submit.length > 0){
					console.log("出现提交按钮");
					setTimeout(function(){
						chrome.extension.sendMessage({cmd: 'watchdog'});
						$btn_submit[0].click();
					},1000);
				}else{
					console.log("未出现提交按钮");
					setTimeout(function(){
						chrome.extension.sendMessage({cmd: 'watchdog'});
						window.location.reload(true);
					},3000);
				}
			}else{
				console.log("评分项异步加载，observer");
				task.score_retry = task.score_retry ? task.score_retry :0;
				if(task.score_retry > 1){
					console.log("三次刷新均未出现满意度评价，自动完成成功");
					reportSuccess({message:"刷新未出现四项评分"});
				}else{
					task.score_retry +=1;
					chrome.storage.local.set({task: task}, function() {
						setTimeout(function(){
							chrome.extension.sendMessage({cmd: 'watchdog'});
							window.location.reload(true);
						},3000);
					})
				}
			}
		}else{
			console.log("未发现满意度评价,可能页面打开就是成功的，observe中会处理");
			console.log("未发现满意度评价,可能商品不需要四项评分，订单超3个月，某些商品京东没有四项评分");
			task.score_retry = task.score_retry ? task.score_retry :0;
			if(task.score_retry > 1){
				console.log("三次刷新均未出现满意度评价，自动完成成功");
				reportSuccess({message:"刷新未出现四项评分"});
			}else{
				task.score_retry +=1;
				chrome.storage.local.set({task: task}, function() {
					setTimeout(function(){
						chrome.extension.sendMessage({cmd: 'watchdog'});
						window.location.reload(true);
					},3000);
				})
			}
		}
	}
}


function commentComplate(){
	console.log(task.order_comments_body);
	console.log('去除空。处理已知屏蔽词');
	var re_str = ' ';
	task.order_comments_body = task.order_comments_body.replace(new RegExp(re_str,'gm'),'');
	task.order_comments_body = task.order_comments_body.toUpperCase();
	var strs = ['天瘦','买卖','天猫','MD','一B','TM','DIY','AV','QQ群','C4','——','~','～','TMD','X东','TB','T猫','A片'];
	for(var i in strs){
		var str = strs[i];
		var rep = new Array( str.length + 1 ).join( '?' );
		task.order_comments_body = task.order_comments_body.replace(new RegExp(str,'gm'),rep);
	}

	var length=checksum(task.order_comments_body);
	console.log(length);
	if(length == 1){
		task.order_comments_body += " ";
	}
	length=checksum(task.order_comments_body);
	if(length < 10){
		console.log("length < 10");
		do{
			var position = Math.round(length * Math.random());
			var position_valid = false;
			if(position>0 && position<length){
				position_valid=true;
			}
		}while(!position_valid);
		task.order_comments_body=task.order_comments_body.substr(0,position)+"?"+task.order_comments_body.substr(position);
		commentComplate();
	}else{

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

function ymdCode(){
	//设置需要用到信息
	var username = 'koubei1';
	var password = 'koubei123';
	var codetype = 1004;//验证码类型 1004 英文数字4位
	var appid = 898;//软件id 898
	var appkey = '4fecbf509a2eab0d8973b8de7f997820';//软件key
	var timeout = 30;//打码时长
	var src = null;//存储验证码地址
	var sendUrl = 'http://api.yundama.com/api.php';//接口地址

	var seccode = $('div[class="comment-box prompt01"]:visible').find("#seccode:visible");//验证码输入
	var seccodeimg = $('div[class="comment-box prompt01"]:visible').find("#seccode:visible").next('img.seccodeimg');//验证码

	function getImageSrc(){
		console.log('得到src');
		console.log(seccode.length>0 && seccodeimg.length>0);
		if(seccode.length>0 && seccodeimg.length>0){
			src = seccodeimg.attr('src');
			getImage();//获取图片
		}else{
			//无京东验证码图片
			window.location.reload(true);
		}
	}

	function getImage(){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', src, true);
		xhr.responseType = 'blob';
		xhr.onload = function(e) {
			if (this.readyState==4){
				console.log('readyState=4');
				if (this.status == 200) {
					sendImage(this.response);//提交图片
				}else{
					console.log(this.response);
				}
			}
		};
		xhr.send();
	}

	function sendImage(file){
		var formData = new FormData();
		formData.append('username', username);
		formData.append('password', password);
		formData.append('codetype', codetype);
		formData.append('appid', appid);
		formData.append('appkey', appkey);
		formData.append('timeout', timeout);
		formData.append('method', 'upload');
		formData.append('file', file);
		console.log('formData');
		var xhr = new XMLHttpRequest();
		console.log('new xhr');
		xhr.open('POST', sendUrl, true);
		console.log('xhr open');
		xhr.onload = function(e) {
			console.log('xhr onload');
			if (this.readyState==4){
				console.log('readyState=4');
				if (this.status == 200) {
					var res = $.parseJSON(this.response);
					if(res.ret == '0'){
						getCodeResult(res.cid);
					}else{
						//提交打码错误
						console.log('提交打码错误');
						window.location.reload(true);
					}
				}else{
					console.log(this.response);
					//提交打码未成功
					console.log('提交打码未成功');
					window.location.reload(true);
				}
			}
		};

		xhr.send(formData);  // multipart/form-data		
	}

	//获取结果
	function getCodeResult(cid){
		console.log('获取结果');
		var lastGetCodeResult = setInterval(function(){
			var resultUrl = 'http://api.yundama.com/api.php?method=result&cid='+cid;
			var xhr = new XMLHttpRequest();
			xhr.open('GET', resultUrl, true);
			xhr.onload = function(e) {
				if (this.readyState==4){
					console.log('readyState=4');
					if (this.status == 200) {
						var res = $.parseJSON(this.response);
						if(res.ret == '0'){
							if(res.text.length!=4){
								//刷新验证码			**刷新本页
								//window.location.reload(true);
								console.log('长度不对');
								ymdEasyReport(cid);
							}else{

								setCode(res.text);
								clearInterval(lastGetCodeResult);
							}
						}else{
							//刷新验证码				**刷新本页
							//window.location.reload(true);
							console.log('码返回错误');
							if(res.ret!='-3002'){//3002为正在识别，反复请求知道识别成功或其他返回
								ymdEasyReport(cid);
							}
						}

					}else{
						//刷新验证码				**刷新本页
						//window.location.reload(true);
						console.log('回码不成功');
					}
				}
			};
			xhr.send();
		},500);
	}

	//填写验证码
	function setCode(code){
		console.log('填写验证码');
		if(seccode.length > 0){
			seccode.val(code);
		}
	}

}


function commentWord(){

	//去除屏蔽词
	var words = $(".thickbox").find("h3").filter(':contains("屏蔽词")');

	if(words.length == 0){
		setTimeout(function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			window.location.reload(true);
		},3000);
	}else{
		words = words[0].innerHTML;

		if(!words){
			console.log("屏蔽词");
		}
		var word=words.split('屏蔽词');
		word=word[1];

		word=word.split('，');
		word=word[0];

		word=word.split('“');
		word=word[0]?word[0]:word[1];
		word=word.split('”');
		word=word[0]?word[0]:word[1];

		var comment=$('div[class="comment-box prompt01"]:visible').find('textarea').val();

		task.order_comments_body = comment.replace(word," ");

		do{
			var word_rep = new Array( word.length + 1 ).join( '?' );
			task.order_comments_body = task.order_comments_body.replace(word,word_rep);
			var temp=task.order_comments_body.split(word);
		}while(temp.length!=1);

		commentComplate();

		var closeThickBox = $(".thickbox").find("a").filter(':contains("关闭")');
		if(closeThickBox.length > 0){
			console.log("close屏蔽词弹出框");
			setTimeout(function(){
				chrome.extension.sendMessage({cmd: 'watchdog'});
				closeThickBox[0].click();
			},2000);
		}

		setTimeout(function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			$('div[class="comment-box prompt01"]:visible').find('textarea').focus().val(task.order_comments_body);
			console.log("替换后得心得输入");
			console.log("再提交");
			setTimeout(function(){
				chrome.extension.sendMessage({cmd: 'watchdog'});
				commentSubmit();
			},3000);
		},5000);
	}
}

function commentSubmit(func){
	var pingjia = $('div[class="comment-box prompt01"]:visible').find('span.pingjiaEl:contains("评价")');
	if (pingjia.length > 0) {
		console.log("评价提交");
		setTimeout(function () {
			chrome.extension.sendMessage({cmd: 'watchdog'});
			pingjia[0].click();
		}, 2000);
	} else {
		console.log("无评价提交");
		setTimeout(function () {
			chrome.extension.sendMessage({cmd: 'watchdog'});
			//window.location.reload(true);
		}, 3000);
	}

	func && func();
}

function item_product() {

	var item = $("ul[pid='" + item_id + "']");
	if (item.length > 0) {
		console.log("找到主商品");
		var pub_comment = item.find('.fore3 a').filter(":contains('发表评价')");

		if (pub_comment.length > 0) {
			console.log("主商品未评价");
			var comment_box = $("div[pid='" + item_id + "']");
			var prompt01 = $('div[class="comment-box prompt01"]:visible');
			if (prompt01.attr('pid') == item_id) {
				console.log("当前评价框是主商品");

			} else {
				console.log("当前评价框不是主商品");
				console.log(pub_comment);
				setTimeout(function () {
					pub_comment[0].click();
				}, 2000);
			}
		} else {
			console.log("主商品不是 发表评价 状态");
			console.log("主商品已经评价，开始评分，");
			setTimeout(function () {
				chrome.extension.sendMessage({cmd: 'watchdog'});
				commentScore();
			}, 3000);
		}
	}

}

function item_comment(){

	console.log('start item_comment');

	var comment_box = $('div[class="comment-box prompt01"]:visible');
	console.log(comment_box);
	var pro_info = $('div[class="comment-box prompt01"]:visible').siblings('.pro-info');
	console.log(pro_info);

	var pub_comment = $('div[class="comment-box prompt01"]:visible').siblings('.pro-info').find('.fore3 a').filter(":contains('发表评价')");

	console.log(pub_comment);
	if (pub_comment.length > 0) {
		setTimeout(function () {
			chrome.extension.sendMessage({cmd: 'watchdog'});
			commentStar();
		}, 2000);

		setTimeout(function () {
			chrome.extension.sendMessage({cmd: 'watchdog'});
			commentTags();

			setTimeout(function () {
				chrome.extension.sendMessage({cmd: 'watchdog'});
				commentTextarea();

				setTimeout(function () {
					chrome.extension.sendMessage({cmd: 'watchdog'});
					commentAnonymous();

					setTimeout(function () {
						chrome.extension.sendMessage({cmd: 'watchdog'});
						commentSecCode();

						setTimeout(function () {
							chrome.extension.sendMessage({cmd: 'watchdog'});
							commentSubmit();
						}, 1000);

					}, 1000);

				}, 6000);

			}, 15000);

		}, 5000);
	}else{
		console.log('item has commented');
		commentScore();
	}
}

var observer = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {

		if (running) {

			if(mutation.type === 'childList' ) {
				console.log(mutation.type);
				console.log(mutation);
				if(mutation.target.className === 'comment-box prompt01'){
					if(mutation.addedNodes.length > 0){
						var prompt01 = $('div[class="comment-box prompt01"]:visible');
						if(item_only) {
							console.log('之评价主商品');
							if (prompt01.attr('pid') == item_id) {
								console.log('当前是主商品');
								console.log('开始评价主商品');
								item_comment();
							} else {
								console.log('评价框出现 不是主商品');
								item_product();
							}
						}else{
							console.log('全部商品评价');
							item_comment();
						}
					}
				}

				if(mutation.target.className === "score"){
					console.log("出现四项评分");
					var addedNodes = mutation.addedNodes;
					if(addedNodes.length > 0 ){
						console.log("出现四项评分提交");
						var tip_num = $('#tip-num:contains("全部已评价")');
						if(tip_num.length > 0){
							console.log("全部已经评价，开始评分，仅在页面加载完后评价内容已提交，只剩四项评分时才会执行");
							setTimeout(function(){
								chrome.extension.sendMessage({cmd: 'watchdog'});
								commentScore();
							},3000);
						}else {
							//item_product();
							console.log('score 有为评价商品');
						}
					}
				}
				if(mutation.target.className === "msg-error-01 hide"){
					console.log("评价过程中出现小提示错误，标签不合要求，字数超出之类的");
					reportError({type:"comment_error",message:mutation.target.innerText});
				}

				if(mutation.target.className === "thickwrap"
					&& mutation.addedNodes.length > 0
					&& mutation.addedNodes[0].className ==="thickcon"){
					console.log("出现弹出框");
					console.log(mutation);
					console.log($(".thickwrap .thickcon").find("h3").html());
					var errormessage=$(".thickwrap .thickcon").find("h3").filter(':contains("屏蔽词")');
					var thicktitle = $(".thickwrap .thickcon").find("h3").html();
					if(errormessage.length > 0){

						task.pingbici_retry = task.pingbici_retry ? task.pingbici_retry : 0;
						if(task.pingbici_retry > 0){
							if(task.pingbi_message) {
								if (thicktitle == task.pingbi_message) {
									console.log("评价内容中有屏蔽词尝试替换后还有提示");
									setTimeout(function () {
										chrome.extension.sendMessage({cmd: 'watchdog'});
										reportError({message: thicktitle + " 无法替换", delay: 24 * 3600});
									}, 3000);
								} else {
									task.pingbi_message = thicktitle;
									commentWord();
								}
							}else{
								task.pingbi_message = thicktitle;
								commentWord();
							}

						}else{
							task.pingbici_retry+=1;
							console.log("评价内容中有屏蔽词，开始尝试替换");
							console.log(thicktitle + "开始替换");
							commentWord();
						}
					}else{
						//发表失败，直接刷新
						if(thicktitle){
							if(thicktitle == "发表失败"){
								setTimeout(function(){
									chrome.extension.sendMessage({cmd: 'watchdog'});
									window.location.reload(true);
								},3000);
							}
						}else{
							setTimeout(function(){
								chrome.extension.sendMessage({cmd: 'watchdog'});
								//window.location.reload(true);
								reportError({message:thicktitle,delay:24*3600});
							},3000);
						}
					}
				}

				if(mutation.target.className === "pro-info" && mutation.addedNodes.length > 0){
					console.log("产品列表中的 发表评价 变动，该商品评价完成");
					var $a_comments = $('a[class="pj"]').filter(':contains("发表评价")');
					if($a_comments.length == 0){
						console.log("全部商品均评价");
						setTimeout(function(){
							chrome.extension.sendMessage({cmd: 'watchdog'});
							commentScore();
						},3000);
					}else{
						//item_product();
					}
				}

				if(mutation.target.className == 'img-list-ul' && mutation.addedNodes.length > 0) {
					sharedImages();
				}

			}


			if(mutation.type === "attributes"){

				if(mutation.target.className === "score-succ" && mutation.target.hidden === false){
					console.log("感谢您的评分  是可见状态");
					reportSuccess({message:"感谢您的评分"});
				}

				if(mutation.target.id === "anonymousFlag"){
					if(mutation.attributeName === "checked"){

					}
				}
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
	var type = msg.type ? msg.type : "comment_error";
	api.reportTask(type, order_id, delay, message, function(){
		chrome.extension.sendMessage({cmd: 'watchdog'});
		//report success 执行下一条
		setTimeout(function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			chrome.extension.sendMessage({cmd: 'task_done'});
		},4000);
	}, function(){
		chrome.extension.sendMessage({cmd: 'watchdog'});
		//report fail
		setTimeout(function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			reportError(msg);
		},5000);
	});
}

function checkItemComment(callback){
	var item = $("ul[pid='" + item_id + "']");
	if (item.length > 0) {
		console.log("找到主商品");
		var pub_comment = item.find('.fore3 a');

		if (pub_comment.length > 0) {
			var text = pub_comment[0].innerText;
			if(text.indexOf('发表评价')!=-1){
				item_product();
			}else{
				callback && callback();
			}
			//console.log("主商品未评价");
			//var comment_box = $("div[pid='" + item_id + "']");
			//var prompt01 = $('div[class="comment-box prompt01"]:visible');
			//if (prompt01.attr('pid') == item_id) {
			//	console.log("当前评价框是主商品");
			//
			//} else {
			//	console.log("当前评价框不是主商品");
			//	console.log(pub_comment);
			//	setTimeout(function () {
			//		pub_comment[0].click();
			//	}, 2000);
			//}
		} else {

		}
	}
}

function reportSuccess(msg){
	chrome.extension.sendMessage({cmd: 'watchdog'});
	checkItemComment(function () {
		var order_id=task.order_id;
		var delay=msg.delay?msg.delay:0;
		var message=msg.message?msg.message:"评价成功";
		console.log("评价成功");
		api.reportTask("comment_success", order_id, delay, message, function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			if(showing){

			}else{
				showing = true;
				checkShow();
			}
		}, function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			//report fail
			setTimeout(function(){
				chrome.extension.sendMessage({cmd: 'watchdog'});
				reportSuccess(msg);
			},5000);
		});
	});

}

function showSubmit(func){
	var pingjia = $('div[pid="'+item_id+'"]').find('span.pingjiaEl:contains("评价")');
	if (pingjia.length > 0) {
		console.log("评价提交");
		setTimeout(function () {
			chrome.extension.sendMessage({cmd: 'watchdog'});
			pingjia[0].click();
		}, 100);
	} else {
		console.log("无评价提交");
		setTimeout(function () {
			chrome.extension.sendMessage({cmd: 'watchdog'});
			chrome.extension.sendMessage({cmd: 'share_fail'});
			//window.location.reload(true);
		}, 3000);
	}

	func && func();
}

function orderShow(){
	var share = task.share;
	var pictures = task.pictures;
	var show = new Show(share,pictures);
	show.submit(function(){
		//showSubmit(function(){
		//	//window.location.reload(true);
		//});
	});
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
	var offset = $('ul[pid="'+item_id+'"]').offset();
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

function checkShow(){
	console.log('checkShow');
	var share = task.share;
	var pictures = task.pictures;
	console.log(share);
	console.log(pictures);
	if(share && pictures){
		var pickbutton = $('#pickbutton_'+task.business_oid+'_'+item_id+':visible');
		console.log(pickbutton);
		if(pickbutton.length > 0){
			orderShow();
		}else{
			var item = $("ul[pid='" + item_id + "']");
			if (item.length > 0) {
				console.log("找到主商品");
				var comment_box = $("div[pid='" + item_id + "']:visible");
				if(comment_box.length > 0){
					console.log('开始截图');
					//orderCapture();
				}else{
					var pub_share = item.find('.fore3 a').filter(":contains('发表晒单')");
					if(pub_share.length > 0){
						pub_share[0].click();
						orderShow();
					}else{
						var show_share = item.find('.fore3 a').filter(":contains('查看')");
						if(show_share.length > 0){
							show_share[0].click();
							setTimeout(function () {
								chrome.extension.sendMessage({cmd: 'watchdog'});
								checkShow();
							},3000);
						}else{

						}
					}
				}
			}else{

			}
		}

	}else{
		setTimeout(function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			chrome.extension.sendMessage({cmd: 'task_done'});
		},2000);
	}
}

function ymdEasyReport(cid){
	console.log('打码错误报告');

	cClient.turn_on_watcher("打码错误报告");

	//设置需要用到信息
	var username = 'koubei1';
	var password = 'koubei123';
	var appid = 898;//软件id 898
	var appkey = '4fecbf509a2eab0d8973b8de7f997820';//软件key

	var formData = new FormData();
	formData.append('username', username);
	formData.append('password', password);
	formData.append('appid', appid);
	formData.append('appkey', appkey);
	formData.append('cid', cid);
	formData.append('flag', 0);
	formData.append('method', 'report');
	//var reportUrl="http://api.yundama.com/api.php";


	var easyReport = setInterval(function(){
		var reportUrl="http://api.yundama.com/api.php";
		var xhr = new XMLHttpRequest();
		xhr.open('POST', reportUrl, true);
		xhr.onload = function(e) {
			if (this.readyState==4){
				console.log('readyState=4');
				if (this.status == 200) {
					var res = $.parseJSON(this.response);
					if(res.ret == '0'){
						clearInterval(easyReport);
					}else{
						console.log('打码错误报告错误');
					}

				}else{
					console.log('打码错误报告不成功');
				}
			}
		};
		xhr.send(formData);
	},500);
	window.location.reload(true);
}
