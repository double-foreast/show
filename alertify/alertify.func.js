/**
 * 提示信息 alertify
 * @param {string} [message]
 * @param {string} [type]
 */
function clue(message,type){
    //ddLog(message);
    console.log(message);
    type = type ? type : 'log';
    alertify.log(message,type,0);
}