const Code = require('./util/code');
global['Code'] = Code;
global['ServerEnv'] = "local";
const express = require('express');
const app = express();
const user = require('./router/user');
const rank = require('./router/rank');
const sys = require('./router/sys');
const report = require('./router/report');
const authChecker = require('./util/authChecker');
const dataAccess = require('dataAccess');
dataAccess.setPoolConfig(require('./conf/mysql'));
dataAccess.setRedisConfig(require('./conf/redis'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use((req, res, next) => {
    authChecker.check(req, res, next);
});
app.use('/user', user);
app.use('/rank', rank);
app.use('/sys', sys);
app.use('/report', report);


app.listen(30003, () => {
    console.log('server start at 30003')
});

