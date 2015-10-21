
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
    var $payment_password = $('#paymentPassword');  //支付密码框
    if($payment_password.length > 0){
        $payment_password.focus().val(task.pay_password;);
		//确认收货按钮
		var $confirm_receive = $('a[class="btn btn-6"]');        
        if($confirm_receive.length > 0){
            setTimeout(function() {
                $confirm_receive[0].click();
            }, 1000); 
            
        }else{
            
        }
    }else{
        //未找到支付密码框
        //收货失败report
    }
}

var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    console.log(mutation.type);
    console.log(mutation);
    if (running) {
      if (mutation.type === 'childList' && mutation.target.id === 'passwordErrorMassage') {
        //支付密码错误
        var message = $('#passwordErrorMassage').text();
        // todo
        // 支付密码错误   
        
      }
    }
  })
});

var config = { attributes: true, childList: true, characterData: true, subtree: true, attributeOldValue: true }
observer.observe(document.body, config);

function reportReceiptError(msg){
    var order_id=task.order_id;
    var delay=msg.delay?msg.delay:0;
    var message=msg.message?msg.message:"";
    api.reportTask("login_error", order_id, delay, message, function(){
        //report success 执行下一条
        chrome.extension.sendMessage({cmd: 'start_task'});
    }, function(){
        //report fail 
    });
}

function reportReceiptSuccess(msg){
    var order_id=task.order_id;
    var delay=msg.delay?msg.delay:0;
    var message=msg.message?msg.message:"";
    api.reportTask("login_error", order_id, delay, message, function(){
        //report success 执行下一条
        chrome.extension.sendMessage({cmd: 'start_task'});
    }, function(){
        //report fail 
    });
}