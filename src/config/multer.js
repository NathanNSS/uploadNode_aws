const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const aws =require("aws-sdk")
const multerS3 = require('multer-s3');

const storageType = {
    local: multer.diskStorage({
        destination:(req, file, callBack) =>{
            callBack(null,path.resolve(__dirname,"..","..","tmp","uploads"));
        },
        filename: (req, file, callBack) =>{
            crypto.randomBytes(16,(err, hash) => {
                if(err) callBack(err)

                file.key = `${hash.toString('hex')}-${file.originalname}`;

                callBack(null, file.key);
            });
        },
    }),
    s3: multerS3({
        s3: new aws.S3(),
        bucket:'sgdeuploads',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl:'public-read',
        key:(req, file, callBack) =>{
            crypto.randomBytes(16,(err, hash) => {
                if(err) callBack(err)

                const filename = `${hash.toString('hex')}-${file.originalname}`;

                callBack(null, filename);
            });
        }

    })
    
}

module.exports = {
    dest: path.resolve(__dirname,"..","..","tmp","uploads"),
    storage: storageType[process.env.STORAGE_TYPE],
    limits:{
        fileSize: (2*1024)*1024
    },
    fileFilter: (req, file, callBack) =>{
        const allowedMimes = [
            "image/jpeg",
            "image/pjpeg",
            "image/jpg",
            "image/png"
        ];
        
        if(allowedMimes.includes(file.mimetype)){
            callBack(null, true);
        }else{
            callBack(new Error({
                title: "Tipo de Arquivo invalido",
                status: 'error',
                icon:'user-slash',
                statusCode:400
            }));
        }
    }
}