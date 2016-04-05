"use strict";

module.exports = function(){

	const koa 		 = require('koa');
	const logger 	 = require('koa-log4js');
	const bodyparser = require('koa-bodyparser');
	const favicon 	 = require('koa-favicon');
	const render 	 = require('koa-ejs');
	const util 		 = require('util');
	const path 		 = require('path');
	const serve 	 = require('koa-static');
	const livereload = require('koa-livereload');
	const config 	 = require('../bin/config');

	let env = process.env;

	let app 		 = new koa();

	app.use(livereload());

	//use static file server
	app.use(serve(`${path.resolve(__dirname,'../')}/resource/`,{
		maxage 	 :0,
		compress :false
	}));

	//use static file server
	app.use(serve(`${path.resolve(__dirname,'../')}/resource/es5/`,{
		maxage 	 :0,
		compress :false
	}));

	//use body parse mw
	app.use(bodyparser());

	//use .ico mw
	app.use(favicon(path.resolve(__dirname ,'../resource/images/favicon.ico')));

	//use template engine
	render(app, {
	  root: `${path.resolve(__dirname,'../')}/view/`,
	  layout: 'template',
	  viewExt: 'html',
	  cache: false,
	  debug: true
	});


	// rewrite render
	let sysRender = app.context.render;

	let defaultCfg = {
		js 					:['lib/require.js','lib/jq.js'],
		css 				:['css/base.css'],
		header_description 	:'xxx',
		header_keywords		:'xxx',
		header_title		:'addison'
	}

	let extendCfg = {
		sysApi 	 	 : env.api || config.api || '',
		jsServerAddr : env.jsserver || config.jsserver || '/',
		ResVer		 : env.ver || config.ver || 1	
	}

	'dev' == (env.env || config.env) && defaultCfg.js.push('http://localhost:35729/livereload.js??ver=1')

	app.context.render = function(view,opt){
		
		return function*(){
			opt = opt || {};
			
			opt.js  	= (opt.js || []).concat(defaultCfg.js);
			opt.css 	= (opt.css || []).concat(defaultCfg.css);
			opt.header_keywords 	= opt.header_keywords || defaultCfg.header_keywords;
			opt.header_title 		= opt.header_title || defaultCfg.header_title;
			opt.header_description 	= opt.header_description || defaultCfg.header_description;
			opt.layout				= opt.noLayout ? false : 'template';
			util._extend(opt,extendCfg);

			yield sysRender.apply(this,[view,opt]);
		}
	}

	//use router
	app.use(require('./middleware/router'));

	return app;
};