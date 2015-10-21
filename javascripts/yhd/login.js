//登陆
var task = null;
var running = null;
var api = null;
var verify_code_error_count = 0;
var verify_cid = 0;

chrome.extension.sendMessage({cmd: 'watchdog'});

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
	var $loginname   = $('#un');
	var $loginpwd   = $('#pwd');
	var $loginsubmit = $('#login_button');
	//验证码
	var $authcode = $('#vcd');
  
	if($loginname.length > 0 && $loginpwd.length > 0 && $loginsubmit.length > 0){
		if(task.username && task.password){
			console.log("登陆");
			$loginname.val(task.username);
            var eventBlur = new MouseEvent('blur');
            $('#un')[0].dispatchEvent(eventBlur);
			setTimeout(function(){
				$loginpwd.val(task.password);
				setTimeout(function() {
					chrome.extension.sendMessage({cmd: 'watchdog'});
					if($("#vcd:visible").length == 0){ $loginsubmit[0].click();}
				}, 3000);
			},3000);
		}else{
			console.log("任务中无用户名，密码信息");
			reportError({delay:24*3600,message:"任务中无用户名，密码信息",log:"no username or password"});
		}
	}else{
		console.log("页面无 登陆 用户框 密码框,刷新页面");
		setTimeout(function(){
			chrome.extension.sendMessage({cmd: 'watchdog'});
			window.location.reload(true);
		},3000);
	}
}

var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (running) {
			//console.log(mutation.type);
			//console.log(mutation.target);
			//console.log(mutation);
      if (mutation.type === 'childList' && mutation.target.id === 'error_tips' && mutation.target.hidden === false && mutation.addedNodes.length > 0) {

          console.log("error_tips中出现错误信息,且是可见状态");
          //if(task == null || task == undefined){ console.error('task is ',task); return false;}
        var message = $('#error_tips').text();
				message = message ? message : mutation.target.innerHTML;
				message = message ? message : mutation.addedNodes[0].nodeValue;
				message = message ? message : "error_tips";
				var errors={
					e1:"请输入验证码",
					e2:"请输入校验码",
					e3:"验证码格式不正确",
					e4:"验证码错误，请重新输入",
					e5:"请输入账号和密码",
					e6:"请输入账号",
					e7:"账号长度不能超过100位",
					e8:"请输入密码",
					e9:"密码不能有空格",
					e10:"请输入验证码",
					e11:"账号和密码不匹配，请重新输入",
					e12:"您的账号有安全风险已冻结，请致电400-007-1111解冻",
					e13:"密码错还可试2次",
					e14:"密码错还可试1次",
					e15:"您的账户异常，预计1个工作日内处理完毕",
					e16:"登录异常，请输入验证码"
				};
				console.log("全部错误信息如下：");
				console.log(errors);
          //打码错误，错误次数不超过3
          if(message == errors.e3 || message == errors.e4 || message == errors.e16 || message == errors.e10){
              chrome.extension.sendMessage({cmd: 'verify_fail', cid: verify_cid});
              if(verify_code_error_count <3){
                  if(verify_code_error_count===0){return false;}
                  verify_code_error_count ++;
                  setTimeout(function(){
                      chrome.extension.sendMessage({cmd: 'verify_code', imgsrc: $("#valid_code_pic").attr('src')});
                  },5000);
              }else{
                  reportError({delay:24*3600,message:'登录验证码错误超过3次',log:"#error_tips"});
              }
          }else{
              reportError({delay:24*3600,message:message,log:"#error_tips"});
          }

      }

        if(mutation.type === "attributes" && mutation.target.id === "valid_code_pic" && mutation.attributeName === 'src'){
            console.log("验证码输入框显示状态，登陆需要输入验证码");

            //reportError({delay:24*3600,message:"账号登陆出现验证码输入框",log:"#vcd"});
            if(verify_code_error_count === 0){
                verify_code_error_count ++;
                messageListener();
                setTimeout(function(){
                    chrome.extension.sendMessage({cmd: 'verify_code', imgsrc: $("#valid_code_pic").attr('src')});
                },5000);
            }
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
			console.log("report_error success 执行下一条");
			setTimeout(function(){
				chrome.extension.sendMessage({cmd: 'watchdog'});
				chrome.extension.sendMessage({cmd: 'task_done'});
			},3000);
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


//验证码
function messageListener(){
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
        if(message.cmd === 'verify_code_result'){//验证码返回结果
            $("#vcd").val(message.text);
            setTimeout(function(){
                verify_cid = message.cid;
                $('#login_button')[0].click();
            },3000);
        }
    });
}
