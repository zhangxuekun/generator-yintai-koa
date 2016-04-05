 "use strict";

var fetch = require('../../sys/middleware/fetch.js');

var instance = null;

class testService{

	constructor(){
		
	}

	aa (params,koa) {
		return function*(){
			var data = yield fetch.get({
				a:'http://m.baidu.com/news?tn=bdapibaiyue&t=setuserdata'
			});

			return data;
		}
	}
}


module.exports = function(){
	if(!instance){
		return new testService();
	}else{
		return instance;
	}
}
