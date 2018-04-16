var status = require('../statusConstants');
var pool = require('../globals').db;


exports.postMachineData = function (req,res) {
    const machineId = req.body.machineId;
    var timeStopped = req.body.time || new Date();
    timeStopped = timeStopped.toISOString().slice(0, 19).replace('T', ' ').toString();
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
            connection.query(`Select * from notifications as n Inner Join machines as m On m.id = n.machine_id where user_id = ${user_id} and seen=${0}`, function(error,results,fields){
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
    pool.getConnection(function(err,connection){
        if(err || !connection){
            return res.status(status.success.response_code).json({"status":false,"data": err})
        }else {
            if(req.body.reason!==0) {
                connection.query(`Update machines set reason=${req.body.reason} where id=${req.params.id}`, function (error, results, fields) {
                    if (error) {
                        return res.status(status.success.response_code).json({"status": false, "data": error})
                    }
                    else {
                        connection.query(`Update notifications set seen=${1} where id=${req.body.r}`, function (nerr, nres) {
                            connection.release();
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
                        connection.query(`Update machines set reason=${rres.insertId} where id=${req.params.id}`, function (error, results, fields) {
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
    pool.getConnection(function(err,connection){
        if(err || !connection){
            return res.status(status.success.response_code).json({"status":false,"data": err})
        }else {
            connection.query(`Update machines set duration=${req.body.duration} where machineId=${req.body.machineId} and factoryId = ${req.body.factoryId}`, function(error,results,fields){
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


