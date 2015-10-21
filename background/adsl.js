

function adslTab(callback){
    setTimeout(function(){
        last_watchdog_time = new Date().getTime();
        Chrome.newTab('adsl:adsl',function(){

        });
    },3000);
}

function getIp(){
    RemoteApi.getIp();
}