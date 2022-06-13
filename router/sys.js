const express = require('express');
const router = express.Router();
const DataAccess = require('dataAccess');
const Executor = DataAccess.executor;
const Command = DataAccess.command;
router.post('/version', (req, res) => {
    let jsVersion = req.body['jsVersion'];
    let appVersion = req.body['appVersion'];
    let platform = req.body['platform'];
    let sql = new Command('select version,url from version where platform = ?', [platform]);
    console.log(req.body);
    Executor.query(ServerEnv, sql, (e, r) => {
        if (!e) {
            if (r.length > 0) {
                let version = r[0]['version'];
                if (parseInt(appVersion) < parseInt(version)) {
                    let data = Object.assign({}, Code.SUCCESS, { data: { appUpdate: true, url: r[0]['url'] } });
                    res.send(data)
                }
                else {
                    let sql = new Command('select js_version,url from js_version where app_version = ? and valid = 1 and platform = ?', [appVersion, platform]);
                    Executor.query(ServerEnv, sql, (e, r) => {
                        // console.log(r);
                        if (e) {
                            res.send(Code.DbError)
                        }
                        else {
                            if (r.length > 0) {
                                if (parseInt(r[0]['js_version']) > parseInt(jsVersion)) {
                                    let data = Object.assign({}, Code.SUCCESS, { data: { appUpdate: false, jsUpdate: true, jsVersion: r[0]['js_version'], url: r[0]['url'] } });
                                    console.log(data);
                                    res.send(data);
                                }
                                else {
                                    let data = Object.assign({}, Code.SUCCESS, { data: { appUpdate: false, jsUpdate: false } });
                                    console.log(data);
                                    res.send(data);
                                }
                            }
                            else {
                                res.send(Code.VersionError)
                            }
                        }
                    })
                }
            }
            else {
                res.send(Code.VersionError)
            }
        }
        else {
            res.send(Code.DbError)
        }
    })
});
module.exports = router;