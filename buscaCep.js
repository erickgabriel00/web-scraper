var http = require('http');
var qs = require("querystring");
// var fs = require('fs');

dados1 = {
    "relaxation": process.argv[2],
    "tipoCep": "ALL",
    "semelhante": "N",
};

dados2 = {
    "relaxation": escape(process.argv[2]), // já faz o encoding correto
    "exata": "S",
    "semelhante": "N",
    "tipoCep": "ALL",
    "qtdrow": "50",
    "pagini": "1",
    "pagfim": "51"
};

var parametros = {
    "method": "POST",
    "hostname": "www.buscacep.correios.com.br",
    "path": "/sistemas/buscacep/ResultadoBuscaCepEndereco.cfm",
    "headers" : {
        "content-type": "application/x-www-form-urlencoded"
    }
};

var req = http.request(parametros, function (httpResponse, err) {
    if (err)  throw new Error(err);


    var pedacos = [];
    httpResponse.on("data", function(pedaco){ pedacos.push(pedaco) });

    httpResponse.on("end", function () {
        var body = Buffer.concat(pedacos);
        var html = body.toString("latin1");
        var regularExpression = /(?:<td.*?>)(.*?)(<\/td>)/g;

        var m;
        var result = [];

        let logradouro = {};
        let index = 0;


        while ((m = regularExpression.exec(html)) !== null){

            info = m[1].replace("&nbsp;", "");
            switch(index){
                case 0: {
                    var regularExpression2 = /<a href=".*">(.*)<\/a>/g;
                    a = regularExpression2.exec(info);
                    if (a){
                        logradouro.nome = a[1].split("<br>").join("");
                    }else{
                        logradouro.nome = info;
                    }

                    index++;
                    break;
                }
                case 1: {
                    logradouro.bairro = info;
                    index++;
                    break;
                }
                case 2: {
                    logradouro.cidade = info.substring(0, info.length -3);
                    logradouro.uf = info.substring(info.length-2);
                    index++;
                    break;
                }
                case 3: {
                    logradouro.cep = info;
                    result.push(logradouro);
                    index = 0;
                    logradouro = {};
                    break;
                }
            }

        // fs.appendFile('cep.csv', nome + '' + bairro + '' + cidade + '' + cep + '');
        }
        console.log(result);
    });
});

req.write(qs.stringify(dados2));
req.end();