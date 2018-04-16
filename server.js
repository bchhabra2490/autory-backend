var express = require('express');
var bodyParser = require('body-parser');

var router = express.Router();
const PORT = process.env.PORT || 5000;
const app = express();
var pool = require('./globals').db;

var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(bodyParser.json());

app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/v1/api',router);

var machine_router = require('./routes/machine');
router.use('/machine',machine_router);

var admin = require('./routes/admin');
router.use('/user', admin);

io.on('connection', socket => {
    socket.on('notifs', () => {
        pool.getConnection(function(err,connection){
            if(err || !connection){
                return res.status(status.success.response_code).json({"status":false,"data": err})
            }else {
                connection.query(`Select * from notifications where factory_Id=1 and seen=${false}`, function(error,results,fields){
                    connection.release();
                    if(error){ return res.status(status.success.response_code).json({"status":false,"data": error})}
                    else{
                        return res.status(status.success.response_code).json({"status":true,"data": results});
                    }
                });
            }
        });
    });


socket.on('disconnect', () => {
        console.log('user disconnected')
    });
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}`))

var io = require('socket.io')(server);
