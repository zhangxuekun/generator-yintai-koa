"use strict";

const fetch = require('../sys/middleware/fetch');

module.exports = {
	'/':function*(){	

		// var php = {
		// 	'a' : 'http://m.baidu.com/news?tn=bdapibaiyue&t=setuserdata'
		// }
			
		// let data = yield fetch.get(php);
		
		yield this.render('index',{
			css:['css/index.css'],
			noLayout:true
		});
	},
	'main':function*(){
		
	},
	rest:function*(){

	}
}

