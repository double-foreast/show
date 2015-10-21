//订单详情  评价
var task = null;
var running = null;
var api = null;

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
    api.reportTask("login_error", order_id, delay, message, function(){
        //report success 执行下一条
        //chrome.extension.sendMessage({cmd: 'start_task'});
       var log={code:"login_error",order_id:order_id,delay:delay,message:message,log:msg.log};
       console.log(log);
    }, function(){
        //report fail 
    });
}