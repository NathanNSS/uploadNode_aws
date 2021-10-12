const conexaoDB = require('../db/conect');

exports.getProduto = (idProd) => {
    return new Promise( (resolve, reject) => {
        conexaoDB.query("SELECT * FROM produto WHERE id = ?", idProd, (err, results, fields) => {
            if(err) throw err;
            return  resolve(results);
        })
    })
}

exports.cadProduto = (bodyReq) => {
    return new Promise( (resolve, reject) => {
        conexaoDB.query("INSERT INTO produto SET ?", bodyReq, (err, results, fields) => {
            if(err) throw err;
            return  resolve(results);
        })
    })
}

exports.updateProduto = (id, bodyReq) => {
    return new Promise( (resolve, reject)=> {
        conexaoDB.query("UPDATE produto SET ? WHERE id = ?", [bodyReq, id], (err, results, fields) => {
            if(err) throw  err;
            return resolve(results);
        })
    })
}

exports.deleteProduto = (idProd) => {
    return new Promise( (resolve, reject) => {
        conexaoDB.query("DELETE FROM produto WHERE id = ? ", idProd, (err, results, fields) => {
            if(err) throw err;
            return resolve(results);
        })
    })
}