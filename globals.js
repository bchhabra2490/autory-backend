var mysql = require('mysql');

var pool = mysql.createPool({
    host:'localhost',
    user:'root',
    password:'root',
    database:'autory'
});


module.exports = {
    db:pool
};
