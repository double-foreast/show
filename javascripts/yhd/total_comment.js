//已评论
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
    var my_order = $("a[data-ref='YHD_TOP_order']");
    if(!my_order){
        my_order = "<a href='http://my.yhd.com/order/myOrder.do' data-ref='YHD_TOP_order' target='_blank' rel='nofollow'>我的订单</a>";
    }
    if(my_order){
        setTimeout(function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
            my_order[0].click();
        });
    }
}

var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (running) {
			console.log(mutation.type);
			console.log(mutation);
    }
  })
});