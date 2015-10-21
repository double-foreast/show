/*打*码*/
/**
 * 云打码
 * @return void
 */
function DaMa(){
    //config
    var username = 'koubei1';
    var password = 'koubei123';
    var appid = 898;//软件id 898
    var appkey = '4fecbf509a2eab0d8973b8de7f997820';//软件key
    var sendUrl = 'http://api.yundama.com/api.php';//接口地址
    var codeLen = 4;

    var codetype = 1004;//验证码类型 1004 英文数字4位
    var timeout = 30;//打码时长s
    var flag = 0;//报错接口 正确1错误0

    /**
     * 获取验证码图片内容
     */
    function getImg(imgsrc,success,error){
        console.log('get img');
        var xhr = new XMLHttpRequest();
        xhr.open('GET', imgsrc, true);
        xhr.responseType = 'blob';
        xhr.onload = function(e) {
            if (this.readyState==4){
                if (this.status == 200) {
                    submitImg(this.response,success,error);//提交图片
                }else{
                    console.warn('get img result error',this.response);
                    error && error();
                }
            }else{
                console.warn('get img error',this);
                error && error();
            }
        };
        xhr.send();
    }

    /**
     * 提交验证码图片内容
     * @param string file 图片内容
     * @return void
     */
    function submitImg(file,success,error){
        console.log('submit img');
        var formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        formData.append('codetype', codetype);
        formData.append('appid', appid);
        formData.append('appkey', appkey);
        formData.append('timeout', timeout);
        formData.append('method', 'upload');
        formData.append('file', file);
        var xhr = new XMLHttpRequest();
        xhr.open('POST', sendUrl, true);
        xhr.onload = function(e) {
            if (this.readyState==4){
                if (this.status == 200) {
                    var result = $.parseJSON(this.response);
                    if(result.ret == '0'){
                        console.log('submit img successfully');
                        getCode(result.cid,success,error);
                    }else{
                        //提交打码错误
                        console.warn('submit img result error',result);
                        error && error();
                    }
                }else{
                    //提交打码未成功
                    console.warn('submit img error',this);
                    error && error();
                }
            }else{
                console.warn('submit img error',this);
                error && error();
            }
        };

        xhr.send(formData);  // multipart/form-data

    }

    /**
     * 获取验证码结果
     */
    function getCode(cid,success,error){
        console.log('get code');
        var data = {
            cid: cid,
            method: 'result'
        }
        $.ajax(sendUrl,{type: 'GET', data: data, dataType: 'JSON'}).success(function(result){
            if(result.ret == 0){//打码结果
                if(result.text.length == codeLen){
                    console.log('get code successfully');
                    //验证码正常使用
                    setTimeout(function(){
                        success && success(cid,result.text);
                    },3000);

                }else{
                    //验证码长度错误
                    console.warn('get code result text length error',result);
                    error && error();
                }
            }else if(result.ret == -3002){//正在识别 ，继续请求
                getCode(cid,success,error);
            }else{
                console.warn('get code result error',result);
                error && error();
            }
        }).error(function(Request){
            console.warn('get code error',Request);
            error && error();
        });

    }

    /**
     * 验证码错误报告
     * @param integer cid 验证码id
     * @param function callback 回调函数
     */
    this.report = function(cid,callback){
        var data = {
            username: username,
            password: password,
            appid: appid,
            appkey: appkey,
            cid: cid,
            flag: flag,
            method: 'report'
        }
        $.ajax(sendUrl,{type: 'POST', data: data, dataType: 'JSON'}).success(function(result){
            if(result.ret == 0){
                console.log('report successfully');
                setTimeout(function(){
                    callback && callback();
                },3000);
            }else{
                console.warn('report result error',result);
            }
        }).error(function(Request){
            console.warn('report error',Request);
        });
    }

    /**
     * 执行
     * @param string imgsrc 验证码地址
     * @param function callback 操作成功回调函数
     * @param function error 操作错误，执行
     */
    this.submit = function(imgsrc,success,error){
        getImg(imgsrc,success,error);
    };

}
