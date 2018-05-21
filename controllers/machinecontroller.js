var status = require('../statusConstants');
var pool = require('../globals').db;
var Json2csvParser = require('json2csv').Parser;

exports.postMachineData = function (req,res) {

    console.log(req.body);

    const machineId = req.body.machineId;
    var timeStopped = req.body.time || new Date();

    var currentTime = new Date();

    var currentOffset = currentTime.getTimezoneOffset();

    var ISTOffset = 330;   // IST offset UTC +5:30

    var ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);

    timeStopped = ISTTime.toISOString().slice(0, 19).replace('T', ' ').toString();
    const factoryId = req.body.factoryId || 1;
    const userId = req.body.userId || 1;

    pool.getConnection(function(err,connection){
        if(err || !connection){
            return res.status(status.success.response_code).json({"status":false,"data": err})
        }else {
            connection.query(`Insert into machines(factoryId,machineId,timeStopped) Values(${factoryId},${machineId},"${timeStopped}")`, function(error,results,fields){
                if(error){ return res.status(status.success.response_code).json({"status":false,"data": error})}
                else{
                    connection.query(`Insert into notifications(seen, details, date, user_id, factory_id, machine_id) Values(${0},"${"Check Machine number "+ machineId}","${timeStopped}",${userId},${factoryId},${results.insertId})`,function (nerr,nres) {
                        connection.release();
                        if(nerr){
                            return res.status(status.success.response_code).json({"status":true,"data": results,"nstatus":false,"notifs":nerr});
                        }
                        return res.status(status.success.response_code).json({"status":true,"data": results,"nstatus":true,"notifs":nres});
                    });
                }
            });
        }
    });
};

exports.getMachineData = function (req,res) {
    pool.getConnection(function(err,connection){
        if(err || !connection){
            return res.status(status.success.response_code).json({"status":false,"data": err})
        }else {
            connection.query(`Select * from machines as m Inner Join reason as r ON r.id=m.reason where factoryId = ${req.params.factoryId} and machineId = ${req.params.machineId}`, function(error,results,fields){
                connection.release();
                if(error){ return res.status(status.success.response_code).json({"status":false,"data": error})}
                else{
                    return res.status(status.success.response_code).json({"status":true,"data": results});
                }
            });
        }
    });
};


exports.getReasons = function (req,res) {
    pool.getConnection(function(err,connection){
        if(err || !connection){
            return res.status(status.success.response_code).json({"status":false,"data": err})
        }else {
            connection.query(`Select * from reason`, function(error,results,fields){
                connection.release();
                if(error){ return res.status(status.success.response_code).json({"status":false,"data": error})}
                else{
                    return res.status(status.success.response_code).json({"status":true,"data": results});
                }
            });
        }
    });
};

exports.getNotifications = function (req,res) {
    var user_id = req.params.user_id || 1;


    pool.getConnection(function(err,connection){
        if(err || !connection){
            return res.status(status.success.response_code).json({"status":false,"data": err})
        }else {
            connection.query(`Select * from notifications as n Right Join machines as m On m.id = n.machine_id where user_id = ${user_id} and seen=${0}`, function(error,results,fields){
                connection.release();
                if(error){ return res.status(status.success.response_code).json({"status":false,"data": error})}
                else{
                    return res.status(status.success.response_code).json({"status":true,"data": results});
                }
            });
        }
    });
};


exports.updateReason = function (req,res) {
    console.log(req.body);
    pool.getConnection(function(err,connection){
        if(err || !connection){
            return res.status(status.success.response_code).json({"status":false,"data": err})
        }else {
            if(req.body.reason!==0) {
                connection.query(`Update machines set reason=${req.body.reason} where id=${req.body.id}`, function (error, results, fields) {
                    if (error) {
                        return res.status(status.success.response_code).json({"status": false, "data": error})
                    }
                    else {
                        connection.query(`Update notifications set seen=${1} where id=${req.body.notifId}`, function (nerr, nres) {
                            connection.release();
                            console.log(nres);
                            return res.status(status.success.response_code).json({"status": true, "data": results});
                        });
                    }
                });
            }else{
                connection.query(`Insert into reason(reason) Values("${req.body.text}")`,function (rerr,rres) {
                    if(rerr){
                        return res.status(status.success.response_code).json({"status": false, "data": rerr})
                    }else{
                        console.log(rres);
                        connection.query(`Update machines set reason=${rres.insertId} where id=${req.body.id}`, function (error, results, fields) {
                            if (error) {
                                return res.status(status.success.response_code).json({"status": false, "data": error})
                            }
                            else {
                                connection.query(`Update notifications set seen=${1} where id=${req.body.notifId}`, function (nerr, nres) {
                                    connection.release();
                                    return res.status(status.success.response_code).json({"status": true, "data": results});
                                });
                            }
                        });
                    }
                })
            }
        }
    });
};

exports.updateDuration = function (req,res) {


    console.log(req.body);

    const machineId = req.body.machineId;
    const duration = req.body.duration;
    const factoryId = req.body.factoryId || 1;
    pool.getConnection(function(err,connection){
        if(err || !connection){
            return res.status(status.success.response_code).json({"status":false,"data": err})
        }else {
            connection.query(`Update machines set duration=${duration} where machineId=${machineId} and factoryId = ${factoryId} and duration IS NULL`, function(error,results,fields){

                connection.release();
                if(error){ return res.status(status.success.response_code).json({"status":false,"data": error})}
                else{
                    return res.status(status.success.response_code).json({"status":true,"data": results});
                }
            });
        }
    });
};

exports.updateNotification = function (req,res) {
    if(!req.params.id || !parseInt(req.params.id,10)){
        return res.status(status.wrong_field.response_code).json(status.wrong_field.reason);
    }else{
        var id = req.params.id;
        pool.getConnection(function(err,connection){
            if(err || !connection){
                return res.status(status.success.response_code).json({"status":false,"data": err})
            }else {
                connection.query(`Update notifications set seen=${1} where id=${id}`, function(error,results,fields){
                    connection.release();
                    if(error){ return res.status(status.success.response_code).json({"status":false,"data": error})}
                    else{
                        return res.status(status.success.response_code).json({"status":true,"data": results});
                    }
                });
            }
        });
    }
};

exports.getCsv = function (req,res) {
    pool.getConnection(function(err,connection){
        if(err || !connection){
            return res.status(status.success.response_code).json({"status":false,"data": err})
        }else {
            connection.query(`Select * from machines as m Inner Join reason as r ON r.id=m.reason`, async function(error,results,fields){
                connection.release();
                if(error){ return res.status(status.success.response_code).json({"status":false,"data": error})}
                else{
                    const json2csvParser = new Json2csvParser({ fields:['id','factoryId','machineId','timeStopped','duration','reason'] });
                    const csv = await json2csvParser.parse(results);
                    res.setHeader('Content-disposition', 'attachment; filename=data.csv');
                    res.set('Content-Type', 'text/csv');
                    res.status(200).send(csv);
                }
            });
        }
    });
};


