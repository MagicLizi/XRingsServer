const express = require('express');
const router = express.Router();
const DataAccess = require('dataAccess');
const Executor = DataAccess.executor;
const Command = DataAccess.command;
router.post('/closeRings', (req, res, next) => {
    console.log('weekInfo');
    console.log(req.body.weekInfo);
    console.log('stepInfo');
    console.log(req.body.stepInfo);
    let uid = req.body.uId;

    let sql = new Command('select groupId from user_group where userId = ? and valid = 1', [uid]);
    Executor.query(ServerEnv, sql, (e, r) => {
        if (e) {
            return res.send(Code.DbError);
        }
        else {
            // console.log(r);
            let gId = r[0] ? r[0].groupId : null;
            let sqls = [];
            let weekInfo = req.body.weekInfo;
            let closeTimes = req.body.closeTimes;
            let totalCal = req.body.totalCal;
            let stepInfo = req.body.stepInfo;
            let totalStep = stepInfo.total;
            let sInfo = stepInfo.info;
            let rAt = ~~(new Date().getTime() / 1000);
            for (let i = 0; i < weekInfo.length; i++) {
                let info = weekInfo[i];
                let ts = ~~(new Date(`${info['year']}-${info['month']}-${info['day']} 00:00:00`).getTime() / 1000);
                let step = 0;
                for (let j = 0; j < sInfo.length; j++) {
                    let singleInfo = sInfo[j];
                    if (info['year'] === singleInfo['year'] && info['month'] === singleInfo['month'] && info['day'] === singleInfo['day'] && info['weekday'] === singleInfo['weekDay']) {
                        step = singleInfo['value'];
                        break;
                    }
                }
                let sql = new Command('replace into ringsRank(year, month, day,weekday, userId,cal,info,refreshAt,ts,closeTimes,totalCal,totalStep,step,gId) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                    [info['year'], info['month'], info['day'], info['weekday'],
                        uid, parseFloat(info['activeEnergyBurned']).toFixed(4), JSON.stringify(info), rAt, ts, closeTimes, parseFloat(totalCal).toFixed(4), totalStep, step, gId]);
                sqls.push(sql);
            }
            Executor.transaction(ServerEnv, sqls, (e, r) => {
                if (e) {
                    console.log(e);
                    return res.send(Code.DbError);
                }
                res.send(Code.SUCCESS);
            })
        }
    })
});

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

router.post('/glist', (req, res, next) => {
    let uid = req.body.uId;
    let type = ~~req.body.type;
    let tag = ~~req.body.tag;
    // console.log(tag,type);
    let sql = new Command('select groupId from user_group where userId = ? and valid = 1', [uid]);
    Executor.query(ServerEnv, sql, (e, r) => {
        if (e) {
            return res.send(Code.DbError);
        }
        if (r.length > 0) {
            let gId = r[0].groupId;
            if (type === 1) {
                let curDate = new Date();
                let year = curDate.getFullYear();
                let month = curDate.getMonth() + 1;
                let day = curDate.getDate();
                let sql = new Command('select distinct(user.id),user.id,user.nickname,user.headImg,ringsRank.cal from ringsRank left join user on(ringsRank.userId = user.id)' +
                    ' where ringsRank.year = ? and ringsRank.month = ? and ringsRank.day = ? and ringsRank.gId = ? and user.valid = 1 order by ringsRank.cal desc', [year, month, day, gId]);
                if (tag === 2) {
                    let ranges = getWeekRange(0);
                    sql = new Command('select distinct(user.id),user.nickname,user.headImg,ringsRank.totalCal from user left join ringsRank on(user.id = ringsRank.userId) where user.valid = 1 and ringsRank.ts >= ? and ringsRank.ts <= ? ' +
                        'and ringsRank.gId = ? order by ringsRank.totalCal desc', [ranges[0], ranges[1], gId]);
                }
                else if (tag === 3) {
                    let ranges = getWeekRange(7);
                    // console.log(ranges);
                    sql = new Command('select distinct(user.id),user.nickname,user.headImg,ringsRank.totalCal from user left join ringsRank on(user.id = ringsRank.userId) where user.valid = 1 and ringsRank.ts >= ? and ringsRank.ts <= ? ' +
                        'and ringsRank.gId = ? order by ringsRank.totalCal desc', [ranges[0], ranges[1], gId]);
                }
                console.log(sql);
                Executor.query(ServerEnv, sql, (e, r) => {
                    if (e) {
                        console.log(e);
                        return res.send(Code.DbError);
                    }
                    let list = r.map((data, i) => {
                        data.rank = i + 1;
                        data.riceCount = tag !== 1 ? ~~(data.totalCal / 200) : ~~(data.cal / 200);
                        data.cal = tag !== 1 ? ~~data.totalCal : ~~data.cal;
                        data.me = ~~uid === data.id;
                        delete data.id;
                        return data;
                    });
                    let data = Object.assign({}, Code.SUCCESS, {data: {list: list, hasNext: false}});
                    res.send(data)
                })
            }
            else if (type === 2) {
                let curDate = new Date();
                let year = curDate.getFullYear();
                let month = curDate.getMonth() + 1;
                let day = curDate.getDate();
                let sql = new Command('select distinct(user.id),user.id,user.nickname,user.headImg,ringsRank.step from ringsRank left join user on(ringsRank.userId = user.id)' +
                    ' where ringsRank.year = ? and ringsRank.month = ? and ringsRank.day = ? and user.valid = 1 and ringsRank.gId = ? order by ringsRank.step desc', [year, month, day, gId]);
                if (tag === 2) {
                    let ranges = getWeekRange(0);
                    sql = new Command('select distinct(user.id),user.nickname,user.headImg,ringsRank.totalStep from user left join ringsRank on(user.id = ringsRank.userId) where user.valid = 1 and ringsRank.ts >= ? and ringsRank.ts <= ? ' +
                        'and ringsRank.gId = ? order by ringsRank.totalStep desc', [ranges[0], ranges[1], gId]);
                }
                else if (tag === 3) {
                    let ranges = getWeekRange(7);
                    sql = new Command('select distinct(user.id),user.nickname,user.headImg,ringsRank.totalStep from user left join ringsRank on(user.id = ringsRank.userId) where user.valid = 1 and ringsRank.ts >= ? and ringsRank.ts <= ? ' +
                        'and ringsRank.gId = ? order by ringsRank.totalStep desc', [ranges[0], ranges[1], gId]);
                }
                Executor.query(ServerEnv, sql, (e, r) => {
                    if (e) {
                        console.log(e);
                        return res.send(Code.DbError);
                    }
                    let list = r.map((data, i) => {
                        data.rank = i + 1;
                        data.value = tag !== 1 ? data.totalStep : data.step;
                        data.me = ~~uid === data.id;
                        delete data.id;
                        return data;
                    });
                    let data = Object.assign({}, Code.SUCCESS, {data: {list: list, hasNext: false}});
                    // console.log(list);
                    res.send(data)
                })
            }
            else if (type === 3) {
                let curDate = new Date();
                let year = curDate.getFullYear();
                let month = curDate.getMonth() + 1;
                let day = curDate.getDate();
                let ranges = getWeekRange(0);
                let sql = new Command('select distinct(user.id),user.nickname,user.headImg,ringsRank.closeTimes from user left join ringsRank on(user.id = ringsRank.userId) where user.valid = 1 and ringsRank.ts >= ? and ringsRank.ts <= ? ' +
                    'and ringsRank.gId = ? order by ringsRank.closeTimes desc', [ranges[0], ranges[1], gId]);
                if (tag === 3) {
                    ranges = getWeekRange(7);
                    sql = new Command('select distinct(user.id),user.nickname,user.headImg,ringsRank.closeTimes from user left join ringsRank on(user.id = ringsRank.userId) where user.valid = 1 and ringsRank.ts >= ? and ringsRank.ts <= ? ' +
                        'and ringsRank.gId = ? order by ringsRank.closeTimes desc', [ranges[0], ranges[1], gId]);
                }
                Executor.query(ServerEnv, sql, (e, r) => {
                    if (e) {
                        console.log(e);
                        return res.send(Code.DbError);
                    }
                    let list = r.map((data, i) => {
                        data.rank = i + 1;
                        data.totalTimes = 3;
                        data.me = ~~uid === data.id;
                        delete data.id;
                        return data;
                    });
                    let data = Object.assign({}, Code.SUCCESS, {data: {list: list, hasNext: false}});
                    res.send(data)
                })
            }

        }
        else {
            return res.send(Code.UserNotInGroup);
        }
    })
})

router.post('/list', (req, res, next) => {
    let uid = req.body.uId;
    let type = ~~req.body.type;
    let tag = ~~req.body.tag;
    console.log('list', type, tag);
    if (type === 1) {
        let curDate = new Date();
        let year = curDate.getFullYear();
        let month = curDate.getMonth() + 1;
        let day = curDate.getDate();
        let sql = new Command('select distinct(user.id),user.id,user.nickname,user.headImg,ringsRank.cal from ringsRank left join user on(ringsRank.userId = user.id)' +
            ' where ringsRank.year = ? and ringsRank.month = ? and ringsRank.day = ? and user.valid = 1 order by ringsRank.cal desc limit 0,100', [year, month, day]);
        // console.log(sql);
        if (tag === 2) {
            let ranges = getWeekRange(0);
            sql = new Command('select distinct(user.id),user.nickname,user.headImg,ringsRank.totalCal from user left join ringsRank on(user.id = ringsRank.userId) where user.valid = 1 and ringsRank.ts >= ? and ringsRank.ts <= ? ' +
                'order by ringsRank.totalCal desc limit 0,100', [ranges[0], ranges[1]]);
        }
        else if (tag === 3) {
            let ranges = getWeekRange(7);
            // console.log(ranges);
            sql = new Command('select distinct(user.id),user.nickname,user.headImg,ringsRank.totalCal from user left join ringsRank on(user.id = ringsRank.userId) where user.valid = 1 and ringsRank.ts >= ? and ringsRank.ts <= ? ' +
                'order by ringsRank.totalCal desc limit 0,100', [ranges[0], ranges[1]]);
        }
        console.log(sql);
        Executor.query(ServerEnv, sql, (e, r) => {
            if (e) {
                console.log(e);
                return res.send(Code.DbError);
            }
            let list = r.map((data, i) => {
                data.rank = i + 1;
                data.riceCount = tag !== 1 ? ~~(data.totalCal / 200) : ~~(data.cal / 200);
                data.cal = tag !== 1 ? ~~data.totalCal : ~~data.cal;
                data.me = ~~uid === data.id;
                delete data.id;
                return data;
            });
            let data = Object.assign({}, Code.SUCCESS, {data: {list: list, hasNext: false}});
            res.send(data)
        })
    }
    else if (type === 2) {
        let curDate = new Date();
        let year = curDate.getFullYear();
        let month = curDate.getMonth() + 1;
        let day = curDate.getDate();
        let sql = new Command('select distinct(user.id),user.id,user.nickname,user.headImg,ringsRank.step from ringsRank left join user on(ringsRank.userId = user.id)' +
            ' where ringsRank.year = ? and ringsRank.month = ? and ringsRank.day = ? and user.valid = 1 order by ringsRank.step desc limit 0,100', [year, month, day]);
        if (tag === 2) {
            let ranges = getWeekRange(0);
            sql = new Command('select distinct(user.id),user.nickname,user.headImg,ringsRank.totalStep from user left join ringsRank on(user.id = ringsRank.userId) where user.valid = 1 and ringsRank.ts >= ? and ringsRank.ts <= ? ' +
                'order by ringsRank.totalStep desc limit 0,100', [ranges[0], ranges[1]]);
        }
        else if (tag === 3) {
            let ranges = getWeekRange(7);
            sql = new Command('select distinct(user.id),user.nickname,user.headImg,ringsRank.totalStep from user left join ringsRank on(user.id = ringsRank.userId) where user.valid = 1 and ringsRank.ts >= ? and ringsRank.ts <= ? ' +
                'order by ringsRank.totalStep desc limit 0,100', [ranges[0], ranges[1]]);
        }
        Executor.query(ServerEnv, sql, (e, r) => {
            if (e) {
                console.log(e);
                return res.send(Code.DbError);
            }
            let list = r.map((data, i) => {
                data.rank = i + 1;
                data.value = tag !== 1 ? data.totalStep : data.step;
                data.me = ~~uid === data.id;
                delete data.id;
                return data;
            });
            let data = Object.assign({}, Code.SUCCESS, {data: {list: list, hasNext: false}});
            // console.log(list);
            res.send(data)
        })
    }
    else if (type === 3) {
        let curDate = new Date();
        let year = curDate.getFullYear();
        let month = curDate.getMonth() + 1;
        let day = curDate.getDate();
        let ranges = getWeekRange(0);
        let sql = new Command('select distinct(user.id),user.nickname,user.headImg,ringsRank.closeTimes from user left join ringsRank on(user.id = ringsRank.userId) where user.valid = 1 and ringsRank.ts >= ? and ringsRank.ts <= ? ' +
            'order by ringsRank.closeTimes desc limit 0,100', [ranges[0], ranges[1]]);
        if (tag === 3) {
            ranges = getWeekRange(7);
            sql = new Command('select distinct(user.id),user.nickname,user.headImg,ringsRank.closeTimes from user left join ringsRank on(user.id = ringsRank.userId) where user.valid = 1 and ringsRank.ts >= ? and ringsRank.ts <= ? ' +
                'order by ringsRank.closeTimes desc limit 0,100', [ranges[0], ranges[1]]);
        }
        Executor.query(ServerEnv, sql, (e, r) => {
            if (e) {
                console.log(e);
                return res.send(Code.DbError);
            }
            let list = r.map((data, i) => {
                data.rank = i + 1;
                data.totalTimes = 3;
                data.me = ~~uid === data.id;
                delete data.id;
                return data;
            });
            let data = Object.assign({}, Code.SUCCESS, {data: {list: list, hasNext: false}});
            res.send(data)
        })
    }
});


module.exports = router;