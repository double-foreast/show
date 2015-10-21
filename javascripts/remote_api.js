
function RemoteApi(settings) {
  this.server_host = "https://disi.se";
  //this.server_host = "https://mars/";
  this.client_id = settings.computer_name;
  this.admin_name = settings.admin_name;
  this.client_user = settings.client_user;
  this.app_secret = 'F$~((kb~AjO*xgn~';
  //this.task_type = settings.task_type;
  this.task_type = "comment";
}

RemoteApi.prototype = {
  getTask: function(done_callback, fail_callback) {
    var url = this.server_host + "/index.php/Admin/ReceiptApi/get_share_task";
    //var url = this.server_host + "/index.php/Admin/ClientApi/get_receipts_comments_task_yhd";
//     array('client_id'     ,'trim' ,''),
// array('type'          ,'trim' ,''),  
// 收货加评价，receipt,   
// 评价   comment

// array('app_secret'      ,'trim' ,'')

// array(
//       'success' =>$success,  0失败1成功
//       'message' =>$message,
//       'data'    =>$data
//     )

    var request_data = {
      client_id: this.client_id,
      admin_name: this.admin_name,
      client_version: chrome.runtime.getManifest().version,
      client_user: this.client_user,
      app_secret: this.app_secret,
      type: 'share'
    };

    $.getJSON(url, request_data, function(data, textStatus, jqXHR) {
      done_callback && done_callback(data);
    }).fail(function(jqXHR, textStatus, errorThrown) {
      fail_callback && fail_callback();
    });
  },

  getAccount: function(account_id,done_callback,fail_callback){
    var url = this.server_host + "/index.php/Admin/ClientApi/business_account_get";
    var request_data = {
      app_secret: this.app_secret,
      account_id: account_id
    };
    $.getJSON(url, request_data, function(data, textStatus, jqXHR) {
      done_callback && done_callback(data);
    }).fail(function(jqXHR, textStatus, errorThrown) {
      fail_callback && fail_callback();
    });
  },

  reportDisable: function(username,slug,message,done_callback, fail_callback){
    var url = this.server_host + "/index.php/Admin/ClientApi/disabled_account";
    var post_data = {
      host_id: this.client_id,
      app_secret: this.app_secret,
      version: chrome.runtime.getManifest().version,
      username: username,
      slug: slug,
      locked_type: 3,
      locked_remark: message
    };
    if(message){
      $.post(url, post_data, function(data) {
        done_callback && done_callback(data);
      },'Json').fail(function(jqXHR, textStatus, errorThrown) {
        fail_callback && fail_callback();
      });
    }else{
      fail_callback && fail_callback();
    }
  },

  reportTask: function(type, order_id, delay, message, done_callback, fail_callback) {
    var url = this.server_host + "/index.php/Admin/ClientApi/report_status";
    var post_data = {
      client_id: this.client_id,
      client_version: chrome.runtime.getManifest().version,
      app_secret: this.app_secret,
      cmd: type,
      order_id: order_id,
      delay: delay,
      message: message
    };

    $.post(url, post_data, function(data) {
      done_callback && done_callback(data);
    },'Json').fail(function(jqXHR, textStatus, errorThrown) {
      fail_callback && fail_callback();
    });
  },

  reportCookie:function(account_id,cookies,done_callback, fail_callback){
    var url = this.server_host + "/index.php/Admin/ClientApi/business_account_cookies_save";

    var post_data = {
      app_secret: this.app_secret,
      cookies: cookies,
      account_id:account_id
    };

    $.post(url, post_data, function(data) {
      done_callback && done_callback(data);
    },'Json').fail(function(jqXHR, textStatus, errorThrown) {
      fail_callback && fail_callback();
    })
  },

  reportShareSuccess:function(share_id,img,done_callback,fail_callback){
    var url = this.server_host + "";
    var post_data = {
      app_secret: this.app_secret,
      id: share_id,
      img: img
    };

    $.post(url, post_data, function(data) {
      done_callback && done_callback(data);
    },'Json').fail(function(jqXHR, textStatus, errorThrown) {
      fail_callback && fail_callback();
    })
  },

  reportShareFail:function(share_id,done_callback,fail_callback){
    var url = this.server_host + '/index.php/Admin/ReceiptApi/report_share';
    var data = {
      host_id: this.client_id,
      app_secret: this.app_secret,
      id: share_id,
      cmd: 'fail'
    };
    $.post(url, data, function(data) {
      done_callback && done_callback(data);
    },'Json').fail(function(jqXHR, textStatus, errorThrown) {
      fail_callback && fail_callback();
    })
  },

  reportCapturePicture:function(share_id,img,done_callback,fail_callback){
    var url = this.server_host + "/index.php/Admin/ReceiptApi/share_picture";
    var post_data = {
      host_id: this.client_id,
      app_secret: this.app_secret,
      id: share_id,
      picture: img
    };

    $.post(url, post_data, function(data) {
      done_callback && done_callback(data);
    },'Json').fail(function(jqXHR, textStatus, errorThrown) {
      fail_callback && fail_callback();
    })
  },

  getVersion: function (done_callback, fail_callback) {
    var url = this.server_host + '/index.php/Admin/ExtensionApi/version';
    var post_data = {
      app_secret: this.app_secret,
      appid:chrome.runtime.id
    };
    $.getJSON(url, post_data, function(data){
      done_callback && done_callback(data);
    }).fail(function(jqXHR, textStatus, errorThrown) {
      fail_callback && fail_callback();
    });
  },

  reportLevel: function(id,level,done_callback,fail_callback){
    var url = this.server_host + '/index.php/Admin/BusinessAccountApi/level';
    var data = {
      app_secret: this.app_secret,
      host_id:this.client_id,
      id:id,
      level:level
    };
    $.getJSON(url, data, function(data){
      done_callback && done_callback(data);
    }).fail(function(jqXHR, textStatus, errorThrown) {
      fail_callback && fail_callback();
    });
  }

};