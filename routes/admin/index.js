var  express=require('express');
var router = express.Router();

router.post('/',function(req,res){
    console.log("New User to be created");
    return res.status(200).json({"status":false, message: "To be created"});
});

router.get('/:factoryId/:id',function(req,res){
    console.log("Get details of User");
    return res.status(200).json({"status":false, message: "To be created"});
});

module.exports = router;
