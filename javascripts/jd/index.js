
setTimeout(function () {
	orderCenter();
},3000);

function orderCenter(){
	var order_center = $('a:contains("我的订单")');
	if(order_center.length > 0){
		order_center[0].click();
	}else{
		window.location.href = 'http://order.jd.com/center/list.action';
	}
}
