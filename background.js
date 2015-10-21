
var last_watchdog_time = new Date().getTime();
var last_watchdog_timeout_time = null;
var watchdog_timeout_count = 0;
var last_ip = null;
var running = false;
var api = null;
var task = null;

var  watchdog_running = false;

var task_start_time = null;

var ip_get_count = 0;

var boot_page = {
  jd: 'http://order.jd.com/center/list.action',
  yhd: 'http://my.yhd.com/order/myOrder.do'
};

var settings = {

};

var adsling = false;

var restarting = false;

reloadSettings();

if(!watchdog_running){
  setTimeout(watchdog, 1000);
}


function getAccount(callback){
  api.getAccount(task.account_id,function(data){
    if(data.success == 1){
      task.username = data.username ? data.username : task.username ;
      task.password = data.password ? data.password : task.password ;
      task.pay_password = data.pay_password ? data.pay_password : task.pay_password ;
      chrome.storage.local.set({task: task}, function() {
        callback && callback();
      });
    }else{

    }
  },function(){

  });
}

function getTask(callback) {
  if(settings.auto_start){
    api.getTask(function(data) {
      console.log(data);
      if (data.success == 1) {
        chrome.storage.local.set({task: data.data}, function() {
          task = data.data;
          task_start_time = new Date().getTime();
          console.log(task);
          console.log(callback);
          callback && callback();
        });
      }
      else {
        //接口返回无任务
        setTimeout(function(){
          last_watchdog_time = new Date().getTime();
          getTask(callback);
        }, 20000);
      }
    }, function() {
      //接口请求失败
      setTimeout(function(){openStartPage()}, 30000);
    });
  }
}


function openStartPage() {
  last_watchdog_time = new Date().getTime();
  task_start_time = null;
  if(!restarting){
    restarting = true;
    chrome.tabs.create({url:'http://home.baidu.com/',selected:true}, function(tab){
      chrome.tabs.query({active:false}, function(tabs) {
        if(tabs){
          for(var i=0;i<tabs.length;i++){
            var remove_tab = tabs[i];
            chrome.tabs.remove(remove_tab.id, function () {
              if(i == tabs.length -1){
                console.log(tab)
              }
            })
          }
        }
      })
    })
  }
}

function adslWindow(callback){

  restarting = false;
  adsling = true;

  setTimeout(function(){
    last_watchdog_time = new Date().getTime();
    checkWindow(function () {
      chrome.windows.create({
        url: 'adsl:adsl'
      }, function(window) {
        setTimeout(function(){
          adsling = false;
          callback && callback()
        }, 8000)
      })
    })
  },3000)
}

function openWindow() {

  last_watchdog_time = new Date().getTime();

  $.ajax({url: 'http://b1.poptop.cc/remote_addr?'+new Date().getTime(), timeout: 3000}).done(function(data) {
    ip_get_count = 0;
	if (isValidIpv4Addr(data)) {
      if (data == last_ip) {
        console.log('当前IP和最后使用IP一样，重新执行更换IP');
        setTimeout(function(){
          adsling = false;
          openStartPage();
        }, 20000);
      }
      else {
        last_ip = data;
        //extensionVersion(function () {
          getTask(function() {
            closeAllWindows(function() {
              setTimeout(function() {
                setCookies(function(){
                  setTimeout(function(){
                    chrome.tabs.create({
                      url: boot_page[task.business_slug],
                      selected:true
                    }, function(tab){
                      console.log(tab);
                      chrome.windows.update(tab.windowId, {state: "maximized"})
                    })
                  },3000)
                })
              }, 10000)
            })
          });
        //})
      }
    }
		
  }).fail(function(){
		if(ip_get_count > 3 ){
			setTimeout(function(){
				ip_get_count = 0;
                adslWindow(function(){
                  openWindow()
                })
			},3000)
		}else{
			ip_get_count++;
			setTimeout(openWindow,10000)
		}
	})
}


function closeAllWindows(callback) {
  console.log('run closeAllWindows');
  closeNormalWindow(callback)
}

function closeNormalWindow(callback){
  chrome.windows.getAll(function(windows) {
    var length = windows.length;
    if(length == 0){
      callback && callback()
    }
    else if(length == 1){
      if(windows[0].type != 'normal'){
        callback && callback();
      }else{
        chrome.windows.remove(windows[0].id, function() {
          setTimeout(function(){
            last_watchdog_time = new Date().getTime();
            checkWindow(callback)
          },3000)
        })
      }
    }else{
      var index = 0;
      for(var i = 0; i < length; i++) {
        if (windows[i].type == 'popup') {
          index++;
          if (index == length) {
            setTimeout(function(){
              last_watchdog_time = new Date().getTime();
              checkWindow(callback)
            },3000)
          }
        }
        else {
          chrome.windows.remove(windows[i].id, function() {
            index++;
            if (index == length) {
              setTimeout(function(){
                last_watchdog_time = new Date().getTime();
                checkWindow(callback);
              },3000)
            }
          })
        }
      }
    }
  })
}

function checkWindow(callback){
  chrome.windows.getAll(function(windows) {
    if(windows.length>1){
      closeAllWindows(callback);
    }else if(windows.length == 1){
      var window = windows[0];
      if(window.type == 'popup'){
        callback && callback();
      }else{
        closeAllWindows(callback);
      }
    }else{
      callback && callback();
    }
  })
}

function removeRunningData(callback) {
  chrome.storage.local.remove(['task_order', 'shop_url'], function() {
    callback && callback()
  })
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log('onMessage：',message);
  //console.log(sender);
  if (message.cmd === 'task_done') {
    if (settings.auto_start) {
      restarting = false;

      if(task.business_slug == 'jd'){
        openHomePage()
      }else{
        openStartPage()
      }
    }
  }
  else if(message.cmd == 'adsl'){
    adslWindow(function(){
      openWindow()
    })
  }
  else if(message.cmd == 'level'){
    var level = message.level;
    if(level){
      reportLevel(level)
    }else{
      window.location.reload(true)
    }
  }
  else if(message.cmd === 'account'){
    console.log('message cmd account');
    getAccount(chrome.tabs.sendMessage(sender.tab.id,{cmd: 'account'}))

  }
  else if (message.cmd === 'start_task') {
		console.log("before start_task");
    restarting = false;
    openStartPage()

  }
  else if (message.cmd === 'watchdog') {
    last_watchdog_time = new Date().getTime();
    if(!watchdog_running){
      setTimeout(watchdog, 1000)
    }
  }
  else if (message.cmd === 'reload_settings') {
    reloadSettings()
  }
  else if(message.cmd === 'disable'){
    last_watchdog_time = new Date().getTime();
    if(message.message){
      reportDisable(message.message)
    }else{
      window.location.reload(true)
    }

  }
  else if(message.cmd === 'verify_code'){//验证码
      console.log('verify_code');
      last_watchdog_time = new Date().getTime();
      setTimeout(function(){
          last_watchdog_time = new Date().getTime();
      },30000);//延时喂狗
      var dama = new DaMa();
      dama.submit(message.imgsrc,function(cid,text){
            chrome.tabs.sendMessage(sender.tab.id,{cmd: 'verify_code_result',cid: cid, text: text})
      },function(){
          chrome.tabs.reload(sender.tab.id)
      })

  }else if(message.cmd === 'verify_fail'){
      last_watchdog_time = new Date().getTime();
      console.log('verify_fail');
      var dama = new DaMa();
      dama.report(message.cid,function(){})

  }
  else if(message.cmd === 'get_cookies'){
    var domain = {jd:'jd.com', yhd:'yhd.com'};
    chrome.cookies.getAll({domain:domain[task.business_slug]},function(cookies){
      console.log(cookies);
      api.reportCookie(task.account_id,cookies,function(){
        chrome.tabs.sendMessage(sender.tab.id,{cmd:'cookies'});
      },function(){
        setTimeout(function(){
          window.location.reload(true)
        },1000)
      })
    })
  }
  else if(message.cmd === 'reload'){
    last_watchdog_time = new Date().getTime();
    message.cmd = 'reloaded';
    console.log(retry);
    if(retry.retry){
      retry.retry ++;
      message.retry =  retry.retry;
    }else{
      message.retry = 1;
    }
    retry = message;
    console.log(retry);
    chrome.tabs.sendMessage(sender.tab.id,message)
  }
  else if(message.cmd == 'capture'){
    //capturePage(0,0)
  }
  else if(message.cmd == 'extensions_update'){
    last_watchdog_time = new Date().getTime();
    extensionVersion(function () {
      chrome.tabs.sendMessage(sender.tab.id,{cmd:'extensions_updated'})
    })
  }
  else if(message.cmd == 'zoom'){
    var zoom_setting = {mode:'manual',scope:'per-tab',defaultZoomFactor:1};
    //chrome.tabs.setZoomSettings(sender.tab.id, zoom_setting, function(settings){
    //  console.log(settings);
    //  chrome.tabs.sendMessage(sender.tab.id,{cmd:'zoom',settings:settings});
    //});
    chrome.tabs.sendMessage(sender.tab.id,{cmd:'zoom'});
  }
  sendResponse &&sendResponse();
  
});

function extensionVersion(callback){
  api = new RemoteApi(settings);
  api.getVersion(function (data) {
    if(data.success == 1){
      var version = data.data;
      var current_version = chrome.runtime.getManifest().version;
      if(version && current_version && (version > current_version)){
        notify('需要更新版本');
        extensionsAutoUpdateCheck(callback);
      }else{
        notify('无更新版本');
        callback && callback();
      }

    }else{
      setTimeout(function () {
        extensionVersion(callback);
      },3000);
    }
  }, function () {
    notify('版本接口请求失败 10s后关闭');
    setTimeout(function(){
      last_watchdog_time = new Date().getTime();
      adslWindow(function(){
        openWindow()
      })
    }, 10000)
  })
}

function extensionsAutoUpdateCheck(callback){
  chrome.runtime.requestUpdateCheck(function(status, details){
    //"throttled", "no_update", or "update_available"

    if(status == 'update_available'){
      notify('rear 自动升级版本' + details.version);
      setTimeout(function () {
        last_watchdog_time = new Date().getTime();
        adslWindow(function(){
          openWindow();
        });
      },3000);
    }else{
      console.log('rear NO UPDATE');
      notify('rear NO UPDATE');
      callback && callback();
    }

  });
}

function setCookies(callback){
  chrome.windows.create({
    url: 'https://www.baidu.com/',
    incognito: true
  });
  var cookies = task.cookies;
  console.log(cookies);
  console.log("set cookies");
  if(cookies){
    var length = cookies.length;
    while(length--){
      var fullCookie = cookies[length];
      //seesion, hostOnly 值不支持设置,
      var newCookie = {};
      var host_only = fullCookie.hostOnly == "false" ? false : true;
      newCookie.url = "http" + ((fullCookie.secure) ? "s" : "") + "://" + fullCookie.domain + fullCookie.path;
      newCookie.name = fullCookie.name;
      newCookie.value = fullCookie.value;
      newCookie.path = fullCookie.path;
      newCookie.httpOnly = fullCookie.httpOnly == "false" ? false : true;
      newCookie.secure = fullCookie.secure == "false" ? false : true;
      if(!host_only){ newCookie.domain = fullCookie.domain; }
      if (fullCookie.session === "true" && newCookie.expirationDate) { newCookie.expirationDate = parseFloat(fullCookie.expirationDate); }
      console.log(newCookie);
      chrome.cookies.set(newCookie);
    }
  }
  console.log("set cookies success");
  callback && callback();
}

function watchdog() {
  watchdog_running = true;
	console.log("entrance watchdog");
  if (last_watchdog_time && running) {
		//console.log("watchdog last_watchdog_time && running");
    var time = new Date().getTime();
    var watch_dog_running = parseInt((time - last_watchdog_time)/1000);
    console.log("watchdog"+"运行"+watch_dog_running+"秒");
    if(task_start_time){

      if(!task.business_slug){
        restarting = false;
        openStartPage();
      }

      var task_running = parseInt((time - task_start_time)/1000);
      if(task_running > 540){
        restarting = false;
        openStartPage();
      }
    }

    if (time - last_watchdog_time > 60000) {

			if (last_watchdog_timeout_time == last_watchdog_time) {
				console.log("watchdog_timeout_count+=1");
        watchdog_timeout_count+=1;
      }
      else {
				console.log("watchdog_timeout_count=0");
        watchdog_timeout_count=0;
      }

      if (watchdog_timeout_count>=4) {
				console.log("watchdog openStartPage");
				watchdog_timeout_count=0;
        restarting = false;
        setTimeout(function(){
          openStartPage();
        },3000);
      }
      // reload page
      chrome.tabs.query({active: true, highlighted: true}, function(tabs) {
				console.log(" chrome.tabs.query");
        if (tabs.length > 0) {
          var current_url = tabs[0].url;
					console.log(current_url);
          if (current_url.indexOf('yhd.com/') >=0 || current_url.indexOf('jd.com/') >=0) {
            if(!task_start_time){
              restarting = false;
              openStartPage();
            }else{
              console.log("执行reload");
              chrome.tabs.reload(tabs[0].id, function() {
                //success
              });
            }
          }

        }

      });
      last_watchdog_time = time;
      last_watchdog_timeout_time = time;
    }
  }

  setTimeout(watchdog, 1000);
}

function openHomePage(){
  console.log('go to home.jd.com');
  chrome.tabs.create({
    url: 'http://home.jd.com/',
    selected:true
  }, function (tab){
    console.log(tab);
  });
}

function reportLevel(level){
  api.reportLevel(task.account_id,level,function(data){
    if(data.success){
      openStartPage();
    }else{
      setTimeout(function () {
        last_watchdog_time = new Date().getTime();
        reportLevel(level);
      },10000);
    }
  }, function () {
    setTimeout(function () {
      last_watchdog_time = new Date().getTime();
      reportLevel(level);
    },20000);
  });
}

function reportCapturePicture(img){
  var share = task.share;
  api.reportCapturePicture(share.id,img,function(){
    restarting = false;
    openStartPage();
  }, function () {
    setTimeout(function () {
      last_watchdog_time = new Date().getTime();
      reportCapturePicture(img);
    },20000)
  });
}

function reportDisable(message){
  chrome.storage.local.get(null, function(data) {
    task = data.task;
    api.reportDisable(task.username,task.business_slug,message,function(){
      var type = "receipt_error";
      if(task.order_receipts_client_status == 3){
        if(task.order_comments_client_status == 3 ){
          adslWindow(function(){
            openWindow();
          });
        }else{
          type = "comment_error";
          reportTask(type,0,message);
        }
      }else{
        reportTask(type,0,message);
      }
    },function(){
      setTimeout(function(){
        last_watchdog_time = new Date().getTime();
        window.location.reload(true);
      },3000);
    });
  });
}

function reportTask(type,delay,message){
  api.reportTask(type, task.order_id, delay, message, function(){
    setTimeout(function(){
      adslWindow(function(){
        openWindow()
      })
    },3000)
  }, function(){
    setTimeout(function(){
      chrome.extension.sendMessage({cmd: 'watchdog'});
      reportTask(type,delay,message);
    },3000)
  })
}

function reloadSettings() {
  chrome.storage.local.get(null, function(data) {
    settings = data.settings;
    console.log(settings);
    if(settings){
      running = data.running;
      api = new RemoteApi(settings)
    }
  })
}

function isValidIpv4Addr(ip) {
  return /^(?=\d+\.\d+\.\d+\.\d+$)(?:(?:25[0-9]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\.?){4}$/.test(ip);
}

function notify(message) {
  var opt = {
    type: 'basic',
    title: '',
    message: message,
    iconUrl: 'icon.png'
  };

  chrome.notifications.create('', opt, function (id) {
    setTimeout(function () {
      chrome.notifications.clear(id, function () {

      })
    }, 10000)
  })
}