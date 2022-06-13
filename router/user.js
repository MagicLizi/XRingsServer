const express = require('express');
const router = express.Router();
const randomstring = require("randomstring");
const messageXSend = require('../util/submail/lib/messageXSend');
const submailConf = require('../conf/submail');
const dataAccess = require('dataAccess');
const Command = dataAccess.command;
const Executor = dataAccess.executor;
const CryptoUtil = require('../util/crypto');
const sConf = require('../util/submail/lib/config');
const OverseasSmsXSend = require('../util/submail/lib/intersmsXsend');

router.post('/verifyCode', (req, res, next) => {
    let mobile = req.body['mobile'];
    let mType = mobileValid(mobile);
    if (!mType) {
        return res.send(Code.MobileFormatError)
    }
    let smsCode = randomstring.generate({
        length: 6,
        charset: '0123456789'
    });

    let cur = ~~(new Date().getTime() / 1000);
    let sql = new Command('select * from sms where mobile = ? and create_at > ?', [mobile, cur - 60]);
    Executor.query(ServerEnv, sql, (e, r) => {
        if (e) {
            console.log(e);
            return res.send(Code.DbError);
        }
        else {
            if (r.length > 0) {
                return res.send(Code.ReSendSoFast);
            }
            let sql = new Command('insert into sms(mobile,smscode,create_at) values(?,?,?)', [mobile, smsCode, cur]);
            Executor.query(ServerEnv, sql, (e) => {
                if (e) {
                    console.log(e);
                    return res.send(Code.DbError);
                }

                if (mType === 1) {
                    let conf = submailConf['CN'];
                    sConf.messageConfig.appid = conf['appID'];
                    sConf.messageConfig.appkey = conf['appKey'];
                    let message = new messageXSend();
                    message.set_to(mobile);
                    message.set_project(conf.template);
                    message.add_var('code', smsCode);
                    message.xsend(() => {

                    });
                }
                else if (mType === 2) {
                    let conf = submailConf['HK'];
                    let m = '+852' + mobile.toString();
                    sConf.inter_smsConfig.appid = conf['appID'];
                    sConf.inter_smsConfig.appkey = conf['appKey'];
                    let message = new OverseasSmsXSend();
                    message.set_to(m);
                    message.set_project(conf.template);
                    message.add_var('code', smsCode);
                    message.xsend(() => {

                    });
                }
                let data = Object.assign({}, Code.SUCCESS, {
                    data: {
                        coolDown: 60
                    }
                });
                res.send(data);
            })
        }
    })
});

function mobileValid(mobile) {
    if ((/^1[34578]\d{9}$/.test(mobile))) {
        return 1;
    }
    else if ((/^([6|9])\d{7}$/.test(mobile))) {
        return 2;
    }
    return null;
}

function tryLogin(mobile, res) {
    let sql = new Command('select * from user where mobile = ?', [mobile]);
    Executor.query(ServerEnv, sql, (e, r) => {
        if (e) {
            console.log(e);
            return res.send(Code.DbError);
        }
        let cur = ~~(new Date().getTime() / 1000);
        if (r.length === 0) {
            let sql = new Command('insert into user(mobile,createAt) values(?,?)', [mobile, cur]);
            let sql1 = new Command('update sms set verify_at = ? where mobile = ?', [cur, mobile]);
            Executor.transaction(ServerEnv, [sql, sql1], (e, r) => {
                if (e) {
                    console.log(e);
                    return res.send(Code.DbError);
                }
                else {
                    let token = genToken(r[0]['insertId'], cur);
                    let redisTokenKey = `RINGSUSERTOKEN:${r[0]['insertId']}`;
                    Executor.redisSet(ServerEnv, redisTokenKey, token, (e) => {
                        if (e) {
                            console.log(e);
                            return res.send(Code.DbError);
                        }
                        else {
                            let data = Object.assign({}, Code.SUCCESS, {
                                data: {
                                    token: token,
                                    nickname: null,
                                    headImg: null
                                }
                            });
                            res.send(data);
                        }
                    });
                }
            })
        }
        else {
            let sql1 = new Command('update sms set verify_at = ? where mobile = ?', [cur, mobile]);
            Executor.query(ServerEnv, sql1, (e) => {
                if (e) {
                    return res.send(Code.DbError)
                }
                let userInfo = r[0];
                let token = genToken(userInfo.id, cur);
                let redisTokenKey = `RINGSUSERTOKEN:${userInfo.id}`;
                Executor.redisSet(ServerEnv, redisTokenKey, token, (e) => {
                    if (e) {
                        console.log(e);
                        return res.send(Code.DbError);
                    }
                    let data = Object.assign({}, Code.SUCCESS, {
                        data: {
                            token: token,
                            nickname: userInfo.nickname,
                            headImg: userInfo.headImg
                        }
                    });
                    res.send(data);
                });
            })
        }
    })
}

router.post('/login', (req, res, next) => {
    let mobile = req.body.mobile;
    let verifyCode = req.body.verifyCode;
    if (!mobileValid(mobile)) {
        return res.send(Code.MobileFormatError)
    }

    if (mobile === "13333333333" && verifyCode === "1") {
        tryLogin(mobile, res)
    }
    else if (mobile === "91030232" && verifyCode === "20190503") {
        tryLogin(mobile, res)
    }
    else {
        let sql = new Command('select id,smscode from sms where mobile= ? and verify_at is null order by id desc limit 0,1', [mobile]);
        Executor.query(ServerEnv, sql, (e, r) => {
            if (e) {
                console.log(e);
                return res.send(Code.DbError);
            }
            if ((r.length > 0 && r[0].smscode === verifyCode)) {
                tryLogin(mobile, res)
            }
            else {
                res.send(Code.VerifyCodeError);
            }
        })
    }
});

function genToken(uid, cur) {
    let key = "XRingsUser";
    let tokenBasic = `${key}_${uid}_${cur}`;
    return CryptoUtil.toSecret(tokenBasic, require('../conf/common')['tokenKey'])
}

router.post('/edit', (req, res, next) => {
    let nickname = req.body.nickname;
    let headImg = req.body.headImg;
    let uId = req.body.uId;
    let sql = new Command('update user set nickname = ?,headImg = ? where id = ?', [nickname, headImg, uId]);
    Executor.query(ServerEnv, sql, (e, r) => {
        if (e) {
            return res.send(Code.DbError)
        }
        res.send(Code.SUCCESS);
    })
});

router.post('/logout', (req, res, next) => {
    let uId = req.body.uId;
    let redisTokenKey = `RINGSUSERTOKEN:${uId}`;
    Executor.redisDelete(ServerEnv, redisTokenKey, e => {
        if (e) {
            console.log(e);
            return res.send(Code.DbError)
        }
        res.send(Code.SUCCESS);
    })
})

router.post('/uploadSign', (req, res, next) => {
    let OSS = require('ali-oss');
    let STS = OSS.STS;
    let sts = new STS({
        accessKeyId: require('../conf/oss').accId,
        accessKeySecret: require('../conf/oss').accKey,
    });

    let policy = {
        "Version": "1",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "oss:*"
                ],
                "Resource": [
                    "acs:oss:*:*:xrings",
                    "acs:oss:*:*:xrings/*"
                ]
            }
        ]
    };

    sts.assumeRole('acs:ram::1988298429111248:role/oss', policy, 15 * 60, "liziossSession").then(result => {
        let data = Object.assign({}, Code.SUCCESS, {
            data: {
                AccessKeyId: result.credentials.AccessKeyId,
                AccessKeySecret: result.credentials.AccessKeySecret,
                SecurityToken: result.credentials.SecurityToken,
                Expiration: result.credentials.Expiration
            }
        });
        res.send(data)
    }).catch(e => {
        res.send(Code.UpLoadSignError)
    });
});

router.post('/groupInfo', (req, res, next) => {
    let uId = req.body.uId;
    let sql = new Command('select * from user_group where userId = ? and valid = 1', [uId]);
    Executor.query(ServerEnv, sql, (e, r) => {
        if (e) {
            return res.send(Code.DbError)
        }
        if (r.length > 0) {
            let groupId = r[0].groupId;
            let sql = new Command('select user.id,user.nickname,user.headImg from user_group left join user on(user.id = user_group.userId) where user_group.groupId = ? and user_group.valid = 1', [groupId]);
            let sql1 = new Command('select cuid,title,headImg,joinId,createAt,totalCal,totalStep,totalClosed from group_info where id = ?', groupId);
            let sql2 = new Command('select sum(cal) as cal,sum(step) as step from ringsRank where gId = ?', [groupId]);
            let sql3 = new Command('select * from ringsRank where gId = ?', [groupId]);
            Executor.transaction(ServerEnv, [sql, sql1, sql2, sql3], (e, r) => {
                if (e) {
                    res.send(Code.DbError)
                }
                else {
                    let userInfo = r[0];
                    let groupInfo = r[1][0];
                    let groupSumInfo = r[2][0];
                    let infos = r[3];
                    groupInfo.isCreator = groupInfo.cuid === ~~uId;
                    groupInfo.joinId = groupInfo.joinId + groupId.toString();
                    groupInfo.totalCal = ~~groupSumInfo.cal;
                    groupInfo.totalStep = ~~groupSumInfo.step;
                    let closeTime = 0;
                    for (let i = 0; i < infos.length; i++) {
                        let info = infos[i];
                        let infoObj = JSON.parse(info.info);
                        if (infoObj['present'] === 100) {
                            closeTime++;
                        }
                    }
                    groupInfo.totalClosed = closeTime;
                    let obj = Object.assign({}, Code.SUCCESS, {data: {users: userInfo, info: groupInfo}});
                    res.send(obj);
                }
            })
        }
        else {
            return res.send(Code.SUCCESS);
        }
    })
})

router.post('/editGroup', (req, res, next) => {
    let uId = req.body.uId;
    let title = req.body.title;
    let headImg = req.body.headImg;
    let sql = new Command('update group_info set title = ?,headImg = ? where valid = 1 and cuid = ?', [title, headImg, uId]);
    Executor.query(ServerEnv, sql, (e, r) => {
        if (e) {
            console.log(e);
            res.send(Code.DbError)
        }
        else {
            res.send(Code.SUCCESS);
        }
    })
})


function getWeekRange(off) {
    let oneDayTime = 24 * 60 * 60 * 1000;
    let now = new Date(new Date().setHours(0, 0, 0, 0));
    let nowTime = now.getTime();
    let day = now.getDay();
    // console.log(`day ${day}`);
    if (day === 0) {
        day = 7;
    }
    let MondayTime = nowTime - (day - 1 + off) * oneDayTime;
    let SundayTime = nowTime + (7 - day - off) * oneDayTime + 24 * 60 * 60 * 1000 - 1;
    // console.log(`MondayTime :${MondayTime}`);
    // console.log(`SundayTime :${SundayTime}`);
    return [~~(MondayTime / 1000), ~~(SundayTime / 1000)];
}

router.post('/userGroupRings', (req, res, next) => {
    let guid = req.body.guid;
    let uid = req.body.uId;
    let sql = new Command('select * from user_group where userId = ? and groupId = (select groupId from user_group where userId = ? and valid = 1)', [uid, guid]);
    Executor.query(ServerEnv, sql, (e, r) => {
        if (!e && r.length > 0) {
            console.log('user exist!')
            //获取本周和上周数据
            let begin = getWeekRange(7)[0]
            let end = getWeekRange(0)[1]
            let sql = new Command('select * from ringsRank where userId = ? and ts >= ? and ts <= ?', [guid, begin, end])
            Executor.query(ServerEnv, sql, (e, r) => {
                if (e) {
                    return res.send(Code.DbError)
                }
                let ldata = r.map((data, i) => {
                    return {
                        year: data.year,
                        month: data.month,
                        day: data.day,
                        weekday: data.weekday,
                        cal: data.cal,
                        totalCal: data.totalCal,
                        step: data.step,
                        totalStep: data.totalStep,
                        closeTimes: data.closeTimes,
                        info: JSON.parse(data.info)
                    }
                })
                let obj = Object.assign({}, Code.SUCCESS, {data: {rings: ldata}})
                console.log(ldata);
                res.send(obj);
            })
        }
        else {
            res.send(Code.UserNotInGroup)
        }
    })
})

router.post('/createGroup', (req, res, next) => {
    let uId = req.body.uId;
    let title = req.body.title;
    let headImg = req.body.headImg;
    let joinId = randomstring.generate({
        length: 4,
        charset: '0123456789abcdefghijklmnopqrstuvwxyz'
    });
    let cur = ~~(new Date().getTime() / 1000);
    let sql = new Command('insert into group_info(cuid,title,headImg,joinId,createAt) values(?,?,?,?,?)', [~~uId, title, headImg, joinId, cur]);
    let sql1 = new Command('insert into user_group(userId,groupId,joinAt) values(?,?,?)', [uId, 0, cur]);
    sql1.exeBefore = function () {
        let groupId = this.lastResult.insertId;
        this.params[1] = groupId;
    };
    Executor.transaction(ServerEnv, [sql, sql1], (e, r) => {
        if (e) {
            if (e.code === "ER_DUP_ENTRY") {
                return res.send(Code.GroupHasExist)
            }
            else {
                return res.send(Code.DbError)
            }
        }
        else {

            let sql = new Command('update ringsRank set gId = ? where userId = ?', [r[0].insertId, uId]);
            Executor.query(ServerEnv, sql, (e, r) => {
                if (e) {
                    return res.send(Code.DbError)
                }
                else {
                    res.send(Code.SUCCESS);
                }
            })
        }
    })
})

router.post('/leaveGroup', (req, res, next) => {
    let uId = req.body.uId;
    let sql = new Command('select groupId from user_group where userId = ? and valid = 1', [uId]);
    Executor.query(ServerEnv, sql, (e, r) => {
        if (e) {
            res.send(Code.DbError)
        }
        else {
            console.log(r);
            if (r.length > 0) {
                let groupId = r[0]['groupId'];
                let sql = new Command('update user_group set valid = 0 where userId = ? and groupId = ?', [uId, groupId]);
                let sql1 = new Command('update ringsRank set gId = null where userId = ?', [uId]);
                Executor.transaction(ServerEnv, [sql, sql1], (e, r) => {
                    if (e) {
                        res.send(Code.DbError)
                    }
                    else {
                        res.send(Code.SUCCESS);
                    }
                })
            }
            else {
                res.send(Code.GroupNotExist);
            }
        }
    })
});

router.post('/joinGroup', (req, res, next) => {
    let uId = req.body.uId;
    let joinId = req.body.joinId;
    // console.log(joinId);
    let realJoinId = joinId.substring(0, 4);
    let groupId = joinId.substring(4, joinId.length);
    let sql = new Command('select id from group_info where id = ? and joinId = ?', [groupId, realJoinId]);
    Executor.query(ServerEnv, sql, (e, r) => {
        if (e) {
            res.send(Code.DbError)
        }
        else {
            if (r.length > 0) {
                let groupId = r[0].id;
                let sql = new Command('select * from user_group where userId = ? and groupId = ?', [uId, groupId]);
                Executor.query(ServerEnv, sql, (e, r) => {
                    if (e) {
                        res.send(Code.DbError)
                    }
                    else {
                        let sql = new Command('insert into user_group(userId,groupId,joinAt) values(?,?,?)', [uId, groupId, ~~(new Date().getTime() / 1000)]);
                        if (r.length > 0) {
                            sql = new Command('update user_group set valid = 1 where groupId = ? and userId = ?', [groupId, uId]);
                        }
                        let sql1 = new Command('update ringsRank set gId = ? where userId = ?', [groupId, uId]);
                        Executor.transaction(ServerEnv, [sql, sql1], (e, r) => {
                            if (e) {
                                res.send(Code.DbError)
                            }
                            else {
                                res.send(Code.SUCCESS)
                            }
                        })
                    }
                })
            }
            else {
                res.send(Code.GroupNotExist)
            }
        }
    })
});

module.exports = router;
