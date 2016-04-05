"use strict";

const url       = require('url');
const path      = require('path');
const fs        = require('fs');
const reg       = require('path-to-regexp');
let routers     = require('../../bin/router');


module.exports = function*(next) {
    
    yield delCache;

    let method    = this.method.toLowerCase(),
        uri       = this.req.url.toLowerCase(),
        info      = url.parse(uri, true).pathname.split('/');
       
    //services handler
    if('service' == info[1]){
       yield  service.call(this,info);
    }else{
        //get user router
       var match = yield getUserRouter.apply(this,[uri,method]);
       if(match)return;

      //default router
      yield defaultRoute.apply(this,[info,method])
      
    }
}


function *notFind(){
    this.res.end('no handler');   
}

/**
 * 删除缓存的module
 */
function *delCache(){
    if(process.env.env =='dev'){
        for(let i in require.cache){
            ['controller','bin','gulp-plugin','middleware','service'].forEach(mid=>{
                if(i.indexOf(mid)!=-1){
                    delete require.cache[i];
                }
            })    
        }
    }
}

/**
 * 处理service
 */
function *service(info){
    var pkg     = info[2],
        cls     = info[3],
        insMeth = info[4];
        
    try{
                
         let result = yield  require(`../../service/${pkg}/${cls}`)()[insMeth](this.query,this);

         var res = '';
         
         this.query.callback ? res = `${this.query.callback}(${JSON.stringify(result)})`:res = JSON.stringify(result);
         this.body = res;

        }catch(e){
            console.trace(e.message);
            this.body = e.message;
        }
}

function *getUserRouter(uri,method){
       let userRouter  = Object.keys(routers).filter( router => { 
            let kv = router.split('#'),reqMethod,reqUrl;
            kv.length == 1 ? (reqMethod = 'get',reqUrl = kv[0]) : (reqMethod = kv[0].toLowerCase(),reqUrl = kv[1]);
            if(method == reqMethod && null != reg(reqUrl).exec(url.parse(uri).pathname)){
                return router;
            }
        })

        if(userRouter.length != 0){
            yield routers[userRouter[0]];
            return 1
        }else{
            return 0;
        }
}

function *defaultRoute(info,method){
    let   ctlName        = (info[1] || 'index').toLowerCase(),
            action       = (info.length > 3 ? 'rest' : info[2] || '/').toLowerCase(),
            relativePath = `../../controller/${ctlName}`,
            absolutePath = `${path.resolve(__dirname,relativePath)}.js`;
        
        method != 'get' && (action = `${method}#${action}`);
            try{
                yield require(relativePath)[action] ;
            }catch(e){
                console.trace(e.message);
                this.body = JSON.stringify(e.message)
            }
}
