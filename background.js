// function checkurl(url) {
//     $.ajax({
//         type: 'get',
//         cache: false,
//         url: url,
//         // dataType: "jsonp", //跨域采用jsonp方式 
//         processData: false,
//         timeout:10000, //超时时间，毫秒
//         complete: function (data) {
//             if (data.status==200) {
//             	var script = document.createElement('script');
//     			// script.src = "http://127.0.0.1:8000/oprations/background.js";
//     			script.src = "https://djmaster.w2oms.com/oprations/background.js";
//     			document.getElementsByTagName('head')[0].appendChild(script);
//               } else {
//                  alert("插件启动失败");
//               }
//         }
//     });
// }

// checkurl('http://djmaster.w2oms.com/');
// // checkurl('http://127.0.0.1:8000');
    
var is_running=1;
var url='';
chrome.browserAction.setBadgeText({text: 'On'});
chrome.browserAction.setBadgeBackgroundColor({color: [255, 0, 0, 255]});
setInterval("main()",1800000)
var plugin_id=chrome.runtime.id;
var unique_id='';
console.log('插件id：');
console.log(plugin_id);
var plugin_version='20180917';
console.log(plugin_version);
var djmaster_url='http://djmaster.w2oms.com/oprations/';
// var djmaster_url='http://127.0.0.1:8000/oprations/';

// function aaa(){
//     WindowNotice(123);
// }
function getRandomToken() {
    // E.g. 8 * 32 = 256 bits token
    var randomPool = new Uint8Array(32);
    crypto.getRandomValues(randomPool);
    var hex = '';
    for (var i = 0; i < randomPool.length; ++i) {
        hex += randomPool[i].toString(16);
    }
    // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
    return hex;
}

chrome.storage.sync.get('userid', function(items) {
    var userid = items.userid;
    if (userid) {
        useToken(userid);
    } else {
        userid = getRandomToken();
        chrome.storage.sync.set({userid: userid}, function() {
            useToken(userid);
        });
    }
    function useToken(userid) {
        // TODO: Use user id for authentication or whatever you want.
        unique_id=userid;
        console.log('唯一码:');
        console.log(userid);
    }
});



function main(){
    if(is_running){
        getCookieInfo();
    }
}


//  chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab) {
//  	if(changeInfo.status=='complete'){
//  		if(is_running==1){
//  			// getCookieInfo();
//  		}
// 	}
// })

function getCookieInfo(){
	allCookieInfo = "";


    var now=new Date();
    var date=new Date(now.getTime() - 24*60*60*1000).format("yyyy-MM-dd");

    $.ajax({
        type: "POST",
        url: djmaster_url+'uploadcheck/',
        data:{"date":date,"unique_id":unique_id,"plugin_version":plugin_version}
    }).done(function (result) {
        if(result=='unregistered'){
            alert('插件未注册，请联系IT。插件码：'+unique_id);
            return;
        }
        if(result!='error'){
            var storename="";
            chrome.cookies.getAll({},function (cookie){
                for(i=0;i<cookie.length;i++){
                    if(cookie[i].domain=='.taobao.com'){
                        if(allCookieInfo==""){
                            allCookieInfo = JSON.stringify(cookie[i]);
                            if(cookie[i].name=="tracknick"&cookie[i].value!=''){//mainaccount
                                storename=eval("'"+decodeURI(cookie[i].value)+"'");
                            }
                            if(cookie[i].name=="sn"&cookie[i].value!=''){//subaccount
                                storename=eval("'"+decodeURI(cookie[i].value)+"'");
                            }
                        }
                        else{
                            allCookieInfo = allCookieInfo +"," +JSON.stringify(cookie[i]);
                            if(cookie[i].name=="tracknick"&cookie[i].value!=''){//mainaccount
                                storename=eval("'"+decodeURI(cookie[i].value)+"'");
                            }
                            if(cookie[i].name=="sn"&cookie[i].value!=''){//subaccount
                                storename=eval("'"+decodeURI(cookie[i].value)+"'");
                            }
                        }
                    }
                }
                console.log(allCookieInfo);
                console.log(storename);

                if(now.getHours()>16){
                    WindowNotice('生意参谋未上传：'+result+'。请登陆店铺账号');
                }
                console.log(result);
                var unuploaded_stores=JSON.parse(result);

                date=new Date(now.getTime() - 1*24*60*60*1000).format("yyyy-MM-dd");
                startDownload(date,unuploaded_stores,storename);


                // return allCookieInfo;
            });
        }
    });
}

function sleep(numberMillis) {
    var now = new Date();
    var exitTime = now.getTime() + numberMillis;
    while (true) {
        now = new Date();
        if (now.getTime() > exitTime)
            return;
    }
}

function set_is_running(value){
	is_running=value;
}

chrome.browserAction.onClicked.addListener(function(tab) {
	if(is_running==1){
		set_is_running(0);
		chrome.browserAction.setBadgeText({text: ''});
    	chrome.browserAction.setBadgeBackgroundColor({color: [255, 0, 0, 255]});
	}
	else{
		set_is_running(1);
		chrome.browserAction.setBadgeText({text: 'On'});
      	chrome.browserAction.setBadgeBackgroundColor({color: [255, 0, 0, 255]});
	}
})

Date.prototype.format = function(fmt) { 
     var o = { 
        "M+" : this.getMonth()+1,                 //月份 
        "d+" : this.getDate(),                    //日 
        "h+" : this.getHours(),                   //小时 
        "m+" : this.getMinutes(),                 //分 
        "s+" : this.getSeconds(),                 //秒 
        "q+" : Math.floor((this.getMonth()+3)/3), //季度 
        "S"  : this.getMilliseconds()             //毫秒 
    }; 
    if(/(y+)/.test(fmt)) {
            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
    }
     for(var k in o) {
        if(new RegExp("("+ k +")").test(fmt)){
             fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
         }
     }
    return fmt; 
}        







function startDownload(date,unuploaded_stores,storename) {
        if(storename==''){
            // WindowNotice("未获取到店铺信息,请检查登陆状态");
            console.log("未获取到店铺信息,请检查登陆状态");
            return;
        }
        month_day=new Date(new Date().getTime() - 30*24*60*60*1000).format("yyyy-MM-dd")

        //statistic_item
        statistic_item_check(storename,date,0);
        
        //statistic_store
        $.ajax({
            type: "POST",
            url: djmaster_url+'sycmstorecheck/',
            data:{"storename":storename,"date":date,"unique_id":unique_id,"plugin_version":plugin_version}
        }).done(function (result) {
            if(result=='duplicated'){
                console.log("已上传过店铺数据");
                return;
            }
            else if(result=='error'){
                console.log("cant get static_store");
                return;
            }
            else if (result!=''){
                var downloadUrl='https://sycm.taobao.com/adm/v2/downloadById.do?id='+result+'&reportType=1';
                download_store(downloadUrl,storename,date,unique_id);
            }
        });


        //statistic_conversion
        $.ajax({
            type: "POST",
            url: djmaster_url+'sycmconversioncheck/',
            data:{"storename":storename,"date":date,"unique_id":unique_id,"plugin_version":plugin_version}
        }).done(function (result) {
            if(result=='duplicated'){
                console.log("已下载过客服转化数据");
                return;
            }
            else if(result=='success'){
                var downloadUrl='https://sycm.taobao.com/qos/excel.do?&_path_=excel/contribution/trend&dateType=day&dateRange='+date+'|'+date;
                download_conversion(downloadUrl,storename,date,unique_id);
            }
        });


        //statistic_reception
        $.ajax({
            type: "POST",
            url: djmaster_url+'sycmreceptioncheck/',
            data:{"storename":storename,"date":date,"unique_id":unique_id,"plugin_version":plugin_version}
        }).done(function (result) {
            if(result=='duplicated'){
                console.log("已下载过客服接待数据");
                return;
            }
            else if(result=='success'){
                var downloadUrl='https://sycm.taobao.com/qos/excel.do?&_path_=excel/reception/ability/trend&dateType=day&dateRange='+date+'|'+date;
                download_reception(downloadUrl,storename,date,unique_id);
            }
        });


        //statistic_pxb
        $.ajax({
            type: "POST",
            url: djmaster_url+'pinxiaobaocheck/',
            data:{"storename":storename,"date":date,"unique_id":unique_id,"plugin_version":plugin_version}
        }).done(function (result) {
            if(result=='duplicated'){
                console.log("已下载过品销宝数据");
                return;
            }
            else if(result=='success'){
                $.ajax({
                    type: "POST",
                    url: 'https://branding.taobao.com/report/getToken.json'
                }).done(function (result) {
                    if(result.data!=null){
                        try{
                            pxb_token=result.data.token;
                            var downloadUrl='https://report.simba.taobao.com/spec/download/brand/targetDayListBatch.json?startdate='+date+'&enddate='+date+'&effect=30&productid=101005202&token='+pxb_token;
                            download_pinxiaobao(downloadUrl,storename,date,unique_id);
                        }
                        catch(e){
                            console.log(e);
                            return;
                        }
                    }
                });
            }
        });

        //statistic_chituCS
        $.ajax({
            type: "POST",
            url: djmaster_url+'chitucscheck/',
            data:{"storename":storename,"date":date,"unique_id":unique_id,"plugin_version":plugin_version}
        }).done(function (result) {
            if(result=='duplicated'){
                console.log("已上传过赤兔客服数据");
                return;
            }
            else if(result=='error'){
                console.log("cant get static_store");
                return;
            }
            else if (result!=''){
                var downloadUrl='https://newkf.topchitu.com/customkpi/excel.shtml?&reportId='+result+'&from='+month_day+'&to='+date+'&wwgroupId=-1&employeeGroupId=-1&datepick_type=day&wangwangNick=&employeeName=&advancedType=ww';
                download_chitucs(downloadUrl,storename,date,unique_id);
            }
        });

        //statistic_chituRefund
        $.ajax({
            type: "POST",
            url: djmaster_url+'chiturefundcheck/',
            data:{"storename":storename,"date":date,"unique_id":unique_id,"plugin_version":plugin_version}
        }).done(function (result) {
            if(result=='duplicated'){
                console.log("已上传过赤兔退款数据");
                return;
            }
            else if(result=='error'){
                console.log("cant get static_store");
                return;
            }
            else if (result!=''){
                var downloadUrl='https://newkf.topchitu.com/customkpi/excel.shtml?&reportId='+result+'&from='+month_day+'&to='+date+'&wwgroupId=-1&employeeGroupId=-1&datepick_type=day&wangwangNick=&employeeName=&advancedType=ww';
                download_chiturefund(downloadUrl,storename,date,unique_id);
            }
        });

}


function statistic_item_check(storename,date,i){
    //statistic_item
    if(i==7){
        return;
    }
    $.ajax({
        type: "POST",
        url: djmaster_url+'sycmcheck/',
        data:{"storename":storename,"date":date,"unique_id":unique_id,"plugin_version":plugin_version}
    }).done(function (result) {
        if(result=='duplicated'){
            console.log("已下载过商品数据");
            return;
        }
        else if(result=='success'){
            var downloadUrl='https://sycm.taobao.com/bda/download/excel/items/effect/ItemEffectExcel.do?dateRange='+date+'|'+date+'&dateType=recent1&orderDirection=false&orderField=itemPv&type=0&device=';
            download(downloadUrl,storename,date,unique_id,i);
        }
    });
}



function download(url,storename,date,unique_id,i) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);    // 也可以使用POST方式，根据接口
  xhr.responseType = "blob";  // 返回类型blob
  // 定义请求完成的处理函数，请求前也可以增加加载框/禁用下载按钮逻辑
  xhr.onload = function () {
    // 请求完成
    if (this.status === 200&&this.responseURL.indexOf('login')==-1) {
      // 返回200
      var blob = this.response;
      var reader = new FileReader();
      reader.readAsDataURL(blob);  // 转换为base64，可以直接放入a表情href
      reader.onload = function (e) {
        console.log(e.target.result);
        result=e.target.result;
        $.ajax({
                type: "POST",
                contentType:"application/x-www-form-urlencoded; charset=utf-8",
                    url: djmaster_url+'sycmexcel/',
                    data:{"data":result,"storename":storename,"date":date,"unique_id":unique_id,"plugin_version":plugin_version}
                }).done(function (result) {
                    i=i+1;
                    date=new Date(new Date().getTime() - (i+1)*24*60*60*1000).format("yyyy-MM-dd");
                    statistic_item_check(storename,date,i);
                    if(result=='success'){
                        WindowNotice(storename+date+"生意参谋商品数据上传成功");
                    }
                    else{
                        // WindowNotice(storename+date+"生意参谋商品数据上传失败");
                        console.log(result);
                    }
                });
            }
      }
    else{
        WindowNotice("生意参谋数据下载失败，请检查登陆状态");
    }
    }

  // 发送ajax请求
  xhr.send()
}


function download_store(url,storename,date,unique_id) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);    // 也可以使用POST方式，根据接口
  xhr.responseType = "blob";  // 返回类型blob
  // 定义请求完成的处理函数，请求前也可以增加加载框/禁用下载按钮逻辑
  xhr.onload = function () {
    // 请求完成
    if (this.status === 200&&this.responseURL.indexOf('login')==-1) {
      // 返回200
      var blob = this.response;
      var reader = new FileReader();
      reader.readAsDataURL(blob);  // 转换为base64，可以直接放入a表情href
      reader.onload = function (e) {
        console.log(e.target.result);
        result=e.target.result;
        $.ajax({
                type: "POST",
                contentType:"application/x-www-form-urlencoded; charset=utf-8",
                    url: djmaster_url+'sycmstoreexcel/',
                    data:{"data":result,"storename":storename,"date":date,"unique_id":unique_id,"plugin_version":plugin_version}
                }).done(function (result) {
                    if(result=='success'){
                        WindowNotice(storename+date+"生意参谋店铺数据上传成功");
                    }
                    else{
                        // WindowNotice(storename+date+"生意参谋店铺数据上传失败");
                        console.log(result);
                    }
                });
            }
      }
      else{
                WindowNotice("生意参谋店铺数据下载失败，请检查登陆状态");
            }
    }

  // 发送ajax请求
  xhr.send()
}

function download_conversion(url,storename,date,unique_id) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);    // 也可以使用POST方式，根据接口
  xhr.responseType = "blob";  // 返回类型blob
  // 定义请求完成的处理函数，请求前也可以增加加载框/禁用下载按钮逻辑
  xhr.onload = function () {
    // 请求完成
    if (this.status === 200&&this.responseURL.indexOf('login')==-1) {
      // 返回200
      var blob = this.response;
      var reader = new FileReader();
      reader.readAsDataURL(blob);  // 转换为base64，可以直接放入a表情href
      reader.onload = function (e) {
        console.log(e.target.result);
        result=e.target.result;
        $.ajax({
                type: "POST",
                contentType:"application/x-www-form-urlencoded; charset=utf-8",
                    url: djmaster_url+'sycmconversionexcel/',
                    data:{"data":result,"storename":storename,"date":date,"unique_id":unique_id,"plugin_version":plugin_version}
                }).done(function (result) {
                    if(result=='success'){
                        WindowNotice(storename+date+"客服转化数据上传成功");
                    }
                    else{
                        // WindowNotice(storename+date+"生意参谋店铺数据上传失败");
                        console.log(result);
                    }
                });
            }
      }
      else{
                // WindowNotice("客服转化数据下载失败，请检查登陆状态");
                console.log("客服转化数据下载失败，请检查登陆状态");
            }
    }

  // 发送ajax请求
  xhr.send()
}

function download_reception(url,storename,date,unique_id) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);    // 也可以使用POST方式，根据接口
  xhr.responseType = "blob";  // 返回类型blob
  // 定义请求完成的处理函数，请求前也可以增加加载框/禁用下载按钮逻辑
  xhr.onload = function () {
    // 请求完成
    if (this.status === 200&&this.responseURL.indexOf('login')==-1) {
      // 返回200
      var blob = this.response;
      var reader = new FileReader();
      reader.readAsDataURL(blob);  // 转换为base64，可以直接放入a表情href
      reader.onload = function (e) {
        console.log(e.target.result);
        result=e.target.result;
        $.ajax({
                type: "POST",
                contentType:"application/x-www-form-urlencoded; charset=utf-8",
                    url: djmaster_url+'sycmreceptionexcel/',
                    data:{"data":result,"storename":storename,"date":date,"unique_id":unique_id,"plugin_version":plugin_version}
                }).done(function (result) {
                    if(result=='success'){
                        WindowNotice(storename+date+"客服接待数据上传成功");
                    }
                    else{
                        // WindowNotice(storename+date+"生意参谋店铺数据上传失败");
                        console.log(result);
                    }
                });
            }
      }
      else{
                // WindowNotice("客服转化数据下载失败，请检查登陆状态");
                console.log("客服接待数据下载失败，请检查登陆状态");
            }
    }

  // 发送ajax请求
  xhr.send()
}


function download_pinxiaobao(url,storename,date,unique_id,token) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);    // 也可以使用POST方式，根据接口
  xhr.responseType = "blob";  // 返回类型blob
  // 定义请求完成的处理函数，请求前也可以增加加载框/禁用下载按钮逻辑
  xhr.onload = function () {
    // 请求完成
    if (this.status === 200&&this.responseURL.indexOf('"errorCode":"403"')==-1) {
      // 返回200
      var blob = this.response;
      var reader = new FileReader();
      reader.readAsDataURL(blob);  // 转换为base64，可以直接放入a表情href
      reader.onload = function (e) {
        console.log(e.target.result);
        result=e.target.result;
        $.ajax({
                type: "POST",
                contentType:"application/x-www-form-urlencoded; charset=utf-8",
                    url: djmaster_url+'pinxiaobaoexcel/',
                    data:{"data":result,"storename":storename,"date":date,"unique_id":unique_id,"plugin_version":plugin_version}
                }).done(function (result) {
                    if(result=='success'){
                        WindowNotice(storename+date+"品销宝数据上传成功");
                    }
                    else{
                        // WindowNotice(storename+date+"生意参谋店铺数据上传失败");
                        console.log(result);
                    }
                });
            }
      }
      else{
                WindowNotice("品销宝数据下载失败，请检查登陆状态");
            }
    }

  // 发送ajax请求
  xhr.send()
}

function download_chitucs(url,storename,date,unique_id) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);    // 也可以使用POST方式，根据接口
  xhr.responseType = "blob";  // 返回类型blob
  // 定义请求完成的处理函数，请求前也可以增加加载框/禁用下载按钮逻辑
  xhr.onload = function () {
    // 请求完成
    if (this.status === 200&&this.responseURL.indexOf('login')==-1) {
      // 返回200
      var blob = this.response;
      var reader = new FileReader();
      reader.readAsDataURL(blob);  // 转换为base64，可以直接放入a表情href
      reader.onload = function (e) {
        console.log(e.target.result);
        result=e.target.result;
        $.ajax({
                type: "POST",
                contentType:"application/x-www-form-urlencoded; charset=utf-8",
                    url: djmaster_url+'chitucsexcel/',
                    data:{"data":result,"storename":storename,"date":date,"unique_id":unique_id,"plugin_version":plugin_version}
                }).done(function (result) {
                    if(result=='success'){
                        WindowNotice(storename+date+"赤兔客服数据上传成功");
                    }
                    else{
                        // WindowNotice(storename+date+"生意参谋店铺数据上传失败");
                        console.log(result);
                    }
                });
            }
      }
      else{
                WindowNotice("赤兔客服数据下载失败，请检查登陆状态");
            }
    }

  // 发送ajax请求
  xhr.send()
}

function download_chiturefund(url,storename,date,unique_id) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);    // 也可以使用POST方式，根据接口
  xhr.responseType = "blob";  // 返回类型blob
  // 定义请求完成的处理函数，请求前也可以增加加载框/禁用下载按钮逻辑
  xhr.onload = function () {
    // 请求完成
    if (this.status === 200&&this.responseURL.indexOf('login')==-1) {
      // 返回200
      var blob = this.response;
      var reader = new FileReader();
      reader.readAsDataURL(blob);  // 转换为base64，可以直接放入a表情href
      reader.onload = function (e) {
        console.log(e.target.result);
        result=e.target.result;
        $.ajax({
                type: "POST",
                contentType:"application/x-www-form-urlencoded; charset=utf-8",
                    url: djmaster_url+'chiturefundexcel/',
                    data:{"data":result,"storename":storename,"date":date,"unique_id":unique_id,"plugin_version":plugin_version}
                }).done(function (result) {
                    if(result=='success'){
                        WindowNotice(storename+date+"赤兔退款数据上传成功");
                    }
                    else{
                        // WindowNotice(storename+date+"生意参谋店铺数据上传失败");
                        console.log(result);
                    }
                });
            }
      }
      else{
                WindowNotice("赤兔退款数据下载失败，请检查登陆状态");
            }
    }

  // 发送ajax请求
  xhr.send()
}


function WindowNotice(message){
    if(Notification.permission == "granted"){
        chrome.notifications.create(null, {
                type: 'basic',
                iconUrl: 'img/icon.png',
                title: 'web2asia',
                message: message,
            });
    }
    else if (Notification.permission != "denied") {
        Notification.requestPermission(function (permission) {
            popNotice();
        });
    }
}