$(function() {
  restoreSettings();

  $('#save').on('click', function() {
    saveSettings(function() {
      chrome.runtime.sendMessage({cmd: 'reload_settings'}, function() {
        alert('保存成功')
      })
    })
  });

  $('#saveAndStart').on('click', function() {
    saveSettings(function() {
      chrome.storage.local.set({running: true}, function() {
        chrome.runtime.sendMessage({cmd: 'reload_settings'}, function() {
          chrome.runtime.sendMessage({cmd: 'start_task'})
        })
      })
    })
  })
});

function restoreSettings() {
  chrome.storage.local.get('settings', function(data) {
    if (data.settings) {
      $('#admin_name').val(data.settings.admin_name ? data.settings.admin_name : null );

      $('#computer_name').val(data.settings.computer_name ? data.settings.computer_name : null );

      $('#auto_task').attr('checked',data.settings.auto_start ? true : false);

      $('#client_user').val(data.settings.client_user ? data.settings.client_user : null)
    }
  })
}

function saveSettings(callback) {
  var settings = {
    admin_name: $('#admin_name').val(),
    computer_name: $('#computer_name').val(),
    auto_start: $('#auto_task').attr('checked') ? true : false,
    client_user: $('client_user').val()
  };

  settings.admin_name = $.trim(settings.admin_name);
  settings.computer_name = $.trim(settings.computer_name);

  if( admin_name && computer_name){
    chrome.storage.local.set({settings: settings}, function() {
      callback && callback()
    })
  }else{
    alert('用户名和主机编号必须设置')
  }
}