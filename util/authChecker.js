const AuthChecker = module.exports;
const Url = require('url');
const DataAccess = require('dataAccess');
const Executor = DataAccess.executor;
const CryptoUtil = require('./crypto');
const AES = require("crypto-js/aes");
const CryptoJS = require("crypto-js");
const forbidCheck = {
    "/user/verifyCode": 1,
    "/user/login": 1,
    "/sys/version": 1
};

AuthChecker.check = function (req, res, next) {
    // console.log("AuthChecker.check");
    if (req.method === "POST") {
        try {
            let bytes = AES.decrypt(req.body.hack, require('../conf/common').fuckHack);
            let decryptedData = bytes.toString(CryptoJS.enc.Utf8);
            req.body = JSON.parse(decryptedData);
        }
        catch (e) {
            return res.send(Code.FuckHack)
        }
    }


    let need = true;
    let pathname = Url.parse(req.originalUrl).pathname;
    if (forbidCheck[pathname]) {
        need = false;
    }

    if (!need) {
        next();
    }
    else {
        let token = req.headers.token;
        if (token) {
            try {
                let basic = CryptoUtil.toBasic(token, require('../conf/common').tokenKey);
                let userId = basic.split('_')[1];
                let redisTokenKey = `RINGSUSERTOKEN:${userId}`;
                // console.log(redisTokenKey);
                Executor.redisGet(ServerEnv, redisTokenKey, (e, r) => {
                    if (e) {
                        // console.log(e);
                        res.send(Code.TokenError);
                    }
                    else {
                        // console.log(`${redisTokenKey}:${r}`);
                        if (req.method === "POST") {
                            req.body.uId = userId;
                        }
                        else {
                            req.query.uId = userId;
                        }
                        // console.log(r);
                        if (r === token) {
                            // console.log(`auth check success!`);
                            next();
                        }
                        else {
                            res.send(Code.TokenError);
                        }

                    }
                });
            }
            catch (e) {
                console.log(e);
                res.send(Code.TokenError);
            }
        }
        else {
            res.send(Code.TokenError);
        }
    }
};