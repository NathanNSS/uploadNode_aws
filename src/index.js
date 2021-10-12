require("dotenv").config();

const express = require('express');
const morgan = require('morgan');
const path = require('path');

//instanciando o express para uma variavel 
const app = express();

//Porta que o servidor está rodando
let port = 3333;

const msgErroInterno ={
    title: "Erro Interno do Sistema ",
    status: 'error',
    icon:'cogs',
}

//Abilitando o Express a funcionar com estes tipos de dados
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(morgan('dev'));
app.use('/files', express.static(path.resolve(__dirname,'..','tmp','uploads')));

app.use(require('./routes'));

app.use(function(error, req, res, next ){
    let msg = JSON.parse(error.message);
    res.status(msg.statusCode || 500).json(msg || msgErroInterno);
});

// Abertura do servidor, a parti dele nos comunicamos com client
app.listen((process.env.PORT || port), ()=>{
    let cData = new Date() 
    let data = `${cData.getDate()}/${ cData.getMonth() + 1}/${cData.getFullYear()} ${cData.getHours()}:${cData.getMinutes()}:${cData.getSeconds()}`;
    console.log(`${data} Servidor rodando na porta ${port} :)`)
})