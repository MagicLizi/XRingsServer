const dataAccess = require('dataAccess');
dataAccess.setPoolConfig(require('./conf/mysql'));
dataAccess.setRedisConfig(require('./conf/redis'));
const Command = dataAccess.command;
const Executor = dataAccess.executor;
function repaire(){
    let sql = new Command('select * from ringsrank',[]);
    Executor.query('prod',sql,(e,r)=>{
        let errorInfo = [];
        for(let i=0;i<r.length;i++){
            let data = r[i];
            let ts = data.ts;
            let date = new Date(ts*1000);
            let realDay = date.getDay();
            if(realDay!=data.weekday){
                console.log(data.userId,ts,data.year,data.month,data.day,data.weekday,realDay);
                errorInfo.push({
                    userId:data.userId,
                    year:data.year,
                    month:data.month,
                    day:data.day,
                    weekday:data.weekday,
                    realwd:realDay
                })
            }
        }
        console.log(errorInfo);

        let sqls = [];
        for(let i = 0;i<errorInfo.length;i++){
            let ei = errorInfo[i];
            let s = new Command('delete from ringsrank where userId = ? and year = ? and month = ? and day = ? and weekday = ?',[ei['userId'],ei['year'],ei['month'],ei['day'],ei['weekday']])
            sqls.push(s);
        }

        Executor.transaction('prod',sqls,(e,r)=>{
            console.log(e);
            console.log(r);
        })
    })
}


repaire();