var mysql = require('mysql');

var pool = mysql.createPool({
    host:'us-cdbr-iron-east-05.cleardb.net',
    user:'b6634c23e60198',
    password:'c2c16468',
    database:'heroku_9dcbc0c1a606a4f'
});


module.exports = {
    db:pool
};
