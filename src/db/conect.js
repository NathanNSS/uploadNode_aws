const mysql = require('mysql');

const conexaoDB = mysql.createConnection({
    host:'localhost',
    port:3306,
    user:'root',
    password: '2738',
    database: 'SGDE01'

})

conexaoDB.connect( erro =>{
    if(erro){
        console.log(erro);
    }
});

module.exports = conexaoDB;
