const Xinge = require('./Xinge');
const xgConf = require('./conf/xgConf');
const XingeApp = new Xinge.XingeApp(xgConf['appId'], xgConf['appS']);
const env = 1;
const schedule = require('node-schedule');

function sendToAlliOS(title,content){
    console.log('sendToAlliOS');
    let iOSMessage = new Xinge.IOSMessage();
    iOSMessage.alert = {
        title:title,
        body:content
    };
    //推送消息给所有设备
    XingeApp.pushToAllDevices(iOSMessage, env,function(err, result){
        if(err){
            console.log(err);
        }
        console.log(result);
    });
}


function sendRemoteiOS(type){
    let iOSMessage = new Xinge.IOSMessage();
    iOSMessage.customContent = {
        "aps":{
            "type":type,
            "content-available":1
        }
    };
    iOSMessage.type = "message";
    // console.log(iOSMessage);
    XingeApp.pushToAllDevices(iOSMessage, env,function(err, result){
        if(err){
            console.log(err);
        }
        console.log(result);
    });
}

function sendToAccount(account, title,content){
    let iOSMessage = new Xinge.IOSMessage();
    iOSMessage.alert = {
        title:title,
        body:content
    };
    //推送消息给所有设备
    XingeApp.pushToSingleAccount(account,iOSMessage, env,function(err, result){
        if(err){
            console.log(err);
        }
        console.log(result);
    });
}

schedule.scheduleJob('0 56 9-22 * * *', function(){
    console.log('stand up time:' + new Date());
    sendToAlliOS(null, `马上 ${new Date().getHours() + 1}:00 了，该站起来走一圈了！`);
});

schedule.scheduleJob('0 0 22 * * *', function(){
    console.log('every day open:' + new Date());
    sendToAlliOS(null, '记得每天打开XRings同步一下数据哦！');
});

schedule.scheduleJob('0 0 10 * * 5', function(){
    console.log('close rings notice:' + new Date());
    sendToAlliOS(null, '今天已经周五了，再不努力就要交营养费了哦！');
});

schedule.scheduleJob('0 30 * * * *', function(){
    sendRemoteiOS(`ringsinfo_${new Date()}`);
});

// sendRemoteiOS(`ringsinfo_${new Date()}`);

// sendToAlliOS(null, `${new Date().getHours()}:00 该站起来走一圈了！`);


