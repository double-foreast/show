
/**
 * 晒单
 * @return void
 */

function Show(share,pictures){
    var sendUrl = 'http://club.jd.com/index.php?mod=OrderBbs&action=ajaxImageUpload';
    var front_host = '';
    var manage_host = 'https://disi.se';

    this.pictures = pictures;

    //function getImg(imgsrc,success,error){
    //    console.log('get img');
    //    var xhr = new XMLHttpRequest();
    //    xhr.open('GET', imgsrc, true);
    //    xhr.responseType = 'blob';
    //    xhr.onload = function(e) {
    //        if (this.readyState==4){
    //            if (this.status == 200 || this.status == 304) {
    //                console.log(this.response);
    //                submitImg(this.response,success,error);//提交图片
    //            }else{
    //                console.warn('get img result error',this.response);
    //                error && error();
    //            }
    //        }else{
    //            console.warn('get img error',this);
    //            error && error();
    //        }
    //    };
    //    xhr.send();
    //}
    //
    //function submitImg(file,success,error){
    //    console.log('submit img');
    //    var formData = new FormData();
    //    formData.append('Filedata', file);
    //    var xhr = new XMLHttpRequest();
    //    xhr.open('POST', sendUrl, true);
    //    xhr.onload = function(e) {
    //        if (this.readyState==4){
    //            if (this.status == 200) {
    //                console.log(this.response);
    //
    //                console.log('success');
    //                var res = 'http://img30.360buyimg.com/shaidan/' + this.response;
    //                var input = $(".img-list input");
    //                console.log(input);
    //                for(var q=1,r=input.length;r>q;q++){
    //                    var s=$('.img-list input[name="imgs'+q+'"]').val();
    //                    console.log(s);
    //                    if(s){
    //                        continue;
    //                    }
    //                    $('.img-list input[name="imgs'+q+'"]').val(res);
    //                    if(q == pictures.length){
    //                        showSubmit();
    //                    }
    //                    break;
    //                }
    //                success && success(res);
    //            }else{
    //                //提交未成功
    //                console.warn('submit img error',this);
    //                error && error();
    //            }
    //        }else{
    //            console.warn('submit img error',this);
    //            error && error();
    //        }
    //    };
    //
    //    xhr.send(formData);  // multipart/form-data
    //
    //}

    function reportPictureSuccess(id,url){
        var post_data = {
            id:id,
            url:url
        };
        $.post('',post_data,function(){

        });
    }

    function reportPictureFail(id){
        var post_data = {id:id};
        $.post('',post_data,function(){

        });
    }

    this.getImg = function(imgsrc,success,error){
        console.log('get img');
        var xhr = new XMLHttpRequest();
        var obj = this;
        xhr.open('GET', imgsrc, true);
        xhr.responseType = 'blob';
        xhr.onload = function(e) {
            if (this.readyState==4){
                if (this.status == 200 || this.status == 304) {
                    console.log(this.response);
                    obj.submitImg(this.response,success,error);//提交图片
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
    };

    this.submitImg = function(file,success,error){
        console.log('submit img');
        var formData = new FormData();
        formData.append('Filedata', file);
        var xhr = new XMLHttpRequest();
        xhr.open('POST', sendUrl, true);
        xhr.onload = function(e) {
            if (this.readyState==4){
                if (this.status == 200) {
                    console.log(this.response);

                    console.log('success');
                    var res = 'http://img30.360buyimg.com/shaidan/' + this.response;
                    var input = $(".img-list input");
                    console.log(input);
                    for(var q=1,r=input.length;r>q;q++){
                        var s=$('.img-list input[name="imgs'+q+'"]').val();
                        console.log(s);
                        if(s){
                            continue;
                        }
                        $('.img-list input[name="imgs'+q+'"]').val(res);
                        if(q == pictures.length){
                            showSubmit();
                        }
                        break;
                    }
                    success && success(res);
                }else{
                    //提交未成功
                    console.warn('submit img error',this);
                    error && error();
                }
            }else{
                console.warn('submit img error',this);
                error && error();
            }
        };

        xhr.send(formData);  // multipart/form-data

    };

    this.submit = function(func){
        if(this.pictures){
            for(var i in pictures){
                var pic = pictures[i];
                console.log(pic);
                var url = '';
                if(pic.admin){
                    url = manage_host  + pic.picture;
                }else{
                    url = front_host + pic.picture;
                }
                var e = parseInt(i)+1;
                this.getImg(url,function(){

                    if(e == pictures.length){
                        //window.location.reload(true);
                    }
                    //reportPictureSuccess(pic.id,url);
                },function(){
                    if(e == pictures.length){
                        //window.location.reload(true);
                    }
                    //reportPictureFail(pic.id);
                });
            }
        }else{

        }
        func && func();
    };

    this.capture = function(){
        chrome.extension.sendMessage({cmd: 'watchdog'});
        chrome.runtime.sendMessage({cmd: 'capture'},function(response){});
    }
}


