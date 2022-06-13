const express = require('express');
const router = express.Router();
const DataAccess = require('dataAccess');
const Executor = DataAccess.executor;
const Command = DataAccess.command;

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

router.post('/notOpen', (req, res, next) => {
    let uId = req.body.uId;
    let tag = req.body.tag;
    let sql = new Command('select * from user_group where userId = ? and valid = 1', [uId]);
    Executor.query(ServerEnv, sql, (e, r) => {
        if (e) {
            return res.send(Code.DbError)
        }
        if (r.length > 0) {
            let groupId = r[0].groupId;
            let sql = new Command('select userId from user_group where groupId = ?', [groupId])
            Executor.query(ServerEnv, sql, (e, r) => {
                if (e) {
                    return res.send(Code.DbError)
                }
                let users = r.map(data => {
                    return data.userId;
                });
                let range = getWeekRange(0);
                if (tag === 3) {
                    range = getWeekRange(7);
                }
                let begin = range[0];
                let end = range[1];
                let sql = new Command('select distinct(userId) from ringsRank where ts >= ? and ts<= ?', [begin, end]);
                Executor.query(ServerEnv, sql, (e, r) => {
                    if (e) {
                        return res.send(Code.DbError)
                    }
                    let uu = r.map(data => {
                        return data.userId;
                    });
                    let notOpen = [];
                    for (let i = 0; i < users.length; i++) {
                        if (!uu.includes(users[i])) {
                            notOpen.push(users[i]);
                        }
                    }
                    let str = notOpen.toString(",");
                    let sql = new Command(`select * from user where id in (${str})`, notOpen);
                    Executor.query(ServerEnv, sql, (e, r) => {
                        if (e) {
                            return res.send(Code.DbError)
                        }
                        let data = Object.assign({}, Code.SUCCESS, {data: {list: r, hasNext: false}});
                        res.send(data)
                    })
                })
            })
        }
        else {
            return res.send(Code.SUCCESS);
        }
    });
});

module.exports = router;