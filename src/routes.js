const routes = require('express').Router();
const multer = require('multer');
const multerConfig = require('./config/multer');
const controlProduto = require('./controller/controllerProduto');


routes.post("/produto", multer(multerConfig).single('file'), async (req, res)=>{
    const {originalname: name, size, key, location: url = ''} = req.file
    console.log(req.file);
    let body = req.body;
    const bodyReq ={
        ...body,
        nomeImg: `${name}`,
        tamanhoImg: size,
        keyImg: `${key}`,
        url:url,
    }
    let resultado = await controlProduto.cadProduto(bodyReq,key);
    return res.json(bodyReq);
});

routes.put("/produto/:idProd",multer().single('file') ,async (req, res, next)=>{
    try{
        let idProd = req.params.idProd;
        let body = req.body;
        let file = req.file || "";
        //console.log(req.body)
        //console.log(req.file)
        let resultado = await controlProduto.atualizarProduto(idProd,body,file)
        //res.send('ok')
        return res.status(200).json(resultado);
    }catch(erro){
        next(erro);
    }
});

routes.delete("/produto/:idProd", async (req, res, next)=>{
    try{
        let idProd = req.params.idProd;
        let resultado = await controlProduto.deleteProduto(idProd);
        // console.log(resultado)
        // console.log(resultado.response)
        return res.status(200).json(resultado);
    }catch(erro){
        next(erro);
    }
});

module.exports = routes;