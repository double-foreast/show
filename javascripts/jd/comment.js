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
		//		order_comments_body:'这款衣副很不错，性价比很高，做工精细，面料手感柔软，穿上时尚大气上档次，值得推荐，非常满意',
		//		item_id:'1756044063',
		//		business_oid: '10393353208',
		//		anonymous:true,
		//		item_only:true,
		//		share:{
		//			id: 12518,
		//			status: 2
		//		},
		//		username:'岩有彪向',
		//		pictures:[
		//			{
		//				picture:'/Public/Uploads/Shares/201510/20151021230625_38898.jpg',
		//				admin:null
		//			},
		//			{
		//				picture:'/Public/Uploads/Shares/201510/20151021230625_74750.jpg',
		//				admin:null
		//			},
		//			{
		//				picture:'/Public/Uploads/Shares/201510/20151021230657_20335.jpg',
		//				admin:null
		//			}
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
		checkShareData()
	}else{
		console.log('当前打开的不是任务中的订单');
		console.log('返回订单列表');
		location.href = 'http://order.jd.com/center/list.action'
	}
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
			showItemComtBox()
		}else{
			setTimeout(function(){
				chrome.extension.sendMessage({cmd: 'watchdog'});
				chrome.extension.sendMessage({cmd: 'task_done'})
			},2000)
		}
	}
}

function showItemComtBox(callback){
	var comt_box = $('.comt-box[pid="'+item_id+'"]:visible');
	if(comt_box.length > 0){
		callback && callback()
	}else{
		var btn = $('a[alt="'+ item_id +'"]');
		if(btn.length > 0){
			btn[0].click();
			setTimeout(function () {
				chrome.extension.sendMessage({cmd: 'watchdog'});
				showItemComtBox(callback)
			},10000)
		}else{
			window.location.reload(true)
		}
	}
}

function checkItem(){
	var btn = $('a[alt="'+ item_id +'"]');
	if(btn.attr('voucherstatus') == 1){
		if(btn.text().indexOf('晒单') != -1){
			clue('开始晒单');
			showPicturesDownload()
		}
	}
	else if(btn.attr('voucherstatus') == 2){
		//clue('已晒单');
		showItemComtBox()
	}
	else if(btn.attr('voucherstatus') == 0){
		clue('请先评价商品，然后才能执行晒单')
	}
	else{
		clue('未知状态错误')
	}
}

function showPicturesDownload(){
	var  pictures = task.pictures;
	var front_host = 'http://www.popsd.com';
	var manage_host = 'https://disi.se/';
	if(pictures && $.isArray(pictures)){
		for(var i in pictures){
			var pic = pictures[i];
			var save_as = business_oid+'_'+task.username + pic.picture.split('/').pop();
			console.log('picture' + pic.picture);
			console.log('save as' + save_as);
			var imgsrc = '';
			if(pic.admin){
				imgsrc = manage_host  + pic.picture
			}else{
				imgsrc = front_host + pic.picture
			}
			var download = task.pictures[i].download ? true : false;
			if(download == false){
				new FileDownloader({
					url: encodeURI(imgsrc),
					filename: save_as,
					callback: function(){
						pictureDownloaded(i,function(){
							if(i == pictures.length -1){
								chrome.storage.local.set({task:task},function(){

								})
							}
						})
					}
				})
			}
		}
	}
}

function pictureDownloaded(i,callback){
	task.pictures[i].download = true;
	callback && callback()
}

function sharedImages(){
	var imgs = $('.img-lists .img-list-ul').find('img');
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
	chrome.extension.sendMessage({cmd: 'watchdog'});
	chrome.runtime.sendMessage({cmd: 'capture'},function(response){});
}

var observer = new MutationObserver(function(mutations) {
	mutations.forEach(function (mutation) {
		if(mutation.type == 'characterData') {
			console.log(mutation.type);
			var target = mutation.target;
			console.log(target);
			if(target.data && target.data.indexOf('1-500字') != -1){

			}
			else if(target.data && target.data.indexOf('麻烦填写0-500个字哦')!=-1){

			}
			else if(target.data && target.data.indexOf('给商品打个标签呗')!=-1){

			}
			else if(target.data && target.data.indexOf('最多能打五个标签呦，思考一下')!=-1){

			}
		}else if(mutation.type == 'childList'){
			if(mutation.target.className == 'ui-dialog'){
				if(mutation.target.innerText.indexOf('评价成功') != -1){

				}
				else if(mutation.target.innerText.indexOf('屏蔽词') != -1){

				}
			}
			else if(mutation.target.className == 'img-list-ul' ) {
				if(mutation.addedNodes.length > 0){
					sharedImages()
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
	if (oid && oid == business_oid && pid && pid == item_id && style.indexOf('none') == -1) {
		checkItem()
	}
}
