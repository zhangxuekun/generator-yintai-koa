"use strict";


module.exports = {
	getConfig:function(key){
		return process.env[key] || require('../../bin/config')[key] || ''
	}
}