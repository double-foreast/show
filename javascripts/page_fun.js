function random(start, end) {
  return Math.round(Math.random() * (end - start) + start);
}

/**
 * 输入内容
 * @param {target} [需要输入内容的对象jq]
 * @param {string} [输入的字符串]
 * @param {callback} [输入完成后，回调函数]
 * @returns {boolean} [错误，]
 */
function Writing(target, string, callback) {
  //string = "伊子凡2015春装新款 春秋装 韩版女装衣服时尚修身两件套雪纺条纹背心连衣裙";
  target.focus();
  if (target.length <= 0) {
    console.log("wirte object not exist.", 'error');
    return false;
  }

  if (string.length <= 0) {
    console.log("string error", 'error');
    return false;
  }

  var arr = string.split('');
  var len = string.length;

  var eventClick = new MouseEvent('click', {'view': window, 'bubbles': true, 'cancelable': true});
  var eventMove = new MouseEvent('mousemove', {'view': window, 'bubbles': true, 'cancelable': true});
  var eventDown = new MouseEvent('mousedown', {'view': window, 'bubbles': true, 'cancelable': true});
  var eventUp = new MouseEvent('mouseup', {'view': window, 'bubbles': true, 'cancelable': true});
  var eventBlur = new MouseEvent('blur', {'view': window, 'bubbles': true, 'cancelable': true});
  var eventKeydown = new MouseEvent('keydown', {'view': window, 'bubbles': true, 'cancelable': true});
  var eventKeyup = new MouseEvent('keyup', {'view': window, 'bubbles': true, 'cancelable': true});
  this.get = function () {
    if (arr.length > 0) {
      var str = arr.shift();
      setTimeout(function () {
        this.setValue(str)
      }, random(150,300))
    } else {
      target[0].dispatchEvent(eventBlur);
      callback && callback()
    }
  };
  this.setValue = function (str) {
    target.focus();
    var value = target.val();
    if(value.length < len && string.indexOf(value) == 0){
      var val = value + str
    }else{
      var val = string.substr(0,string.indexOf(arr.toString().replace(/,/g,""))) + str
    }

    //target.val(value.length < len && string.indexOf(value) == 0 ? value + str : str);
    target.val(val);

    target[0].dispatchEvent(eventKeydown);
    target[0].dispatchEvent(eventKeyup);

    this.get()
  };

  target[0].dispatchEvent(eventMove);
  target[0].dispatchEvent(eventDown);
  target[0].dispatchEvent(eventClick);
  target[0].dispatchEvent(eventUp);

  target.val('');
  setTimeout(function () {
    target.val('');
    this.get()
  }, 2000)
}