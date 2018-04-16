var  express=require('express');
var router = express.Router();
var machine_controller = require('../../controllers/machinecontroller');

router.post('/',function(req,res){
    machine_controller.postMachineData(req,res);
});

router.get('/reasons',function (req,res) {
    machine_controller.getReasons(req,res);
});

router.get('/notifs/:user_id',function (req,res) {
    machine_controller.getNotifications(req,res);
});

router.get('/:factoryId/:machineId',function(req,res){
    machine_controller.getMachineData(req,res);
});

router.patch('/notifs/:id',function (req,res) {
    machine_controller.updateNotification(req,res);
});

router.patch('/duration',function (req,res) {
    machine_controller.updateDuration(req,res);
});

router.patch('/reason/:id',function (req,res) {
    machine_controller.updateReason(req,res);
});

module.exports = router;
