const modelsProduto = require('../models/modelsProduto');
const aws = require('aws-sdk');
const fs = require("fs");
const path = require("path");
const crypto = require('crypto');
const { promisify } = require("util");

const multer = require('multer');
const multerConfig = require('../config/multer');

const s3 = new aws.S3();

// exports.cadProduto = (bodyReq) => {
//     return modelsProduto.cadProduto(bodyReq);
// }


const MsgErro = (title, status, icon, statusCode = 500) =>{
    return JSON.stringify({
        title: title,
        status: status,
        icon: icon,
        statusCode: statusCode
    })
}

var typesallowed = [
    "image/jpeg",
    "image/pjpeg",
    "image/jpg",
    "image/png"
];
exports.cadProduto = (bodyReq) =>{
    if(!bodyReq.url){
        bodyReq.url = `${process.env.APP_URL}/files/${bodyReq.keyImg}`;
    }
    return modelsProduto.cadProduto(bodyReq);
    
}

exports.atualizarProduto = async (idProd, body, file) => {
       
    let resProd = await modelsProduto.getProduto(idProd)
    if(!resProd.hasOwnProperty(0)) throw new Error(MsgErro('Produto não encontrado em nossa ','error','ban',400))

    const keyImg  = resProd[0].keyImg ;

    const getParams = {
        Bucket: process.env.BUCKET_NAME, 
        Key: keyImg
    };
    if(file != ''){
        try{
            if(Math.round((file.size / 1024) / 1024) > 1) throw new Error(MsgErro('Envie um arquivo menor que 1 Mb','error','ban',400))
            if(!typesallowed.includes(file.mimetype)) throw new Error(MsgErro('Tipo do Arquivo invalido','error','ban',400))
        
            if(process.env.STORAGE_TYPE === "s3"){
       
                const resultAws = await s3.getObject(getParams).promise()
                    .catch(err => {
                        console.log(err)
                        if(err.code == 'NoSuchKey' ){
                            throw MsgErro('Arquivo não encorntado na AWS s3','error','ban',400)
                        }else{
                            throw MsgErro('Erro na Consulta do Arquivo','error','ban',500)
                        }
                    })
               
                if(resultAws.ContentType){
                    const putParams = {
                        ACL: 'public-read',
                        ContentType: file.mimetype,
                        Body:file.buffer,
                        Bucket: process.env.BUCKET_NAME, 
                        Key:`${crypto.randomBytes(16).toString('hex')}-${file.originalname}`
                    };
 
                    let { Location: url } = await s3.upload(putParams).promise()
                        .catch(err => {
                            //console.log(err);
                            throw MsgErro('Não foi possivel atualizar o arquivo na aws s3','error','ban',400)
                        });
                
                    var objectUpdate = {
                        ...body,
                        nomeImg:file.originalname,
                        tamanhoImg:file.size,
                        keyImg:  putParams.Key,
                        url: url
                    }

                    s3.deleteObject(getParams).promise().catch(err => {throw new Error(err)});

                    console.log('Params Update:', objectUpdate);
                }else{
                    throw  MsgErro('Arquivo não encontrado na AWS','error','ban',400)
                }
            }else{
                let keyUpdateLocal = `${crypto.randomBytes(16).toString('hex')}-${file.originalname}`;
                var objectUpdate = {
                    ...body,
                    nomeImg:file.originalname,
                    tamanhoImg:file.size,
                    keyImg:  keyUpdateLocal,
                    url: `${process.env.APP_URL}/files/${keyUpdateLocal}`
                }
                console.log(objectUpdate);
                
                promisify(fs.writeFile)(
                    path.resolve(__dirname,"..","..","tmp","uploads",objectUpdate.keyImg),
                    file.buffer
                ).catch(err => {
                    throw MsgErro('Não foi possivel criar o arquivo localmente','error','ban',500)
                })

                promisify(fs.unlink)(
                    path.resolve(__dirname,"..","..","tmp","uploads",keyImg)
                ).catch(err => {
                    throw MsgErro('Não foi possivel deletar o arquivo localmente','error','ban',500)
                })
            }
        }catch(erro){
            throw Error(erro);
        }
    }
    let res = await modelsProduto.updateProduto(idProd,objectUpdate || body);
    return res;
}

exports.deleteProduto = async (idProd) => {
    try{
        let resPros = await  modelsProduto.getProduto(idProd);
        if(!resPros.hasOwnProperty(0)) throw MsgErro('Produto não encontrado','error','ban',400)
        const keyImg  = resPros[0].keyImg ;
        var params = {
            Bucket: process.env.BUCKET_NAME, 
            Key: keyImg
        };

        let res = await modelsProduto.deleteProduto(idProd);
        
        if(process.env.STORAGE_TYPE === "s3"){
            var resAws = [];
            s3.deleteObject(params,(err, data)=>{
                if(err) console.log(err, err.stack)
                else console.log(data)
            }).promise().then(response => console.log(response.data))

            
            

            //resulmido
            //s3.deleteObject(params).promise()

            //console.log(resAws);
            return {success:true};
        }else{

            //console.log(path.resolve(__dirname,"..","..","tmp","uploads",keyImg))
            promisify(fs.unlink)(
                path.resolve(__dirname,"..","..","tmp","uploads",keyImg)
            ).catch(err => {
                console.log(err);
                throw  MsgErro('Não foi possivel deletar o arquivo localmente','error','ban',500)
            })
        }
    }catch(erro){
        throw new Error(erro)
    }
    
    return res;
}
