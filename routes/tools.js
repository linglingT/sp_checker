var express = require('express'),
    router = express.Router(),
    SuperSoap = require("../utils/soap/super-soap"),
    superSoap = new SuperSoap(),
    path = require('path'),
    fs = require("fs"),
    pathUtils = require("../utils/PathUtils")



router.get("/tools", function(req,res,next){
    res.redirect("/tools/viewSender");
});

router.get("/tools/viewSender", function(req,res,next){
    res.render('requestSender',  { title: 'Super Proxy Request Sender'});
});

router.post("/tools/requestPost",function(req,res,next){
    superSoap.request(req.body.wsdlUrl, req.body.soapData,null,
        function(data){
            res.end(data);
        });
});

router.get("/tools/viewMissingCheck",function(req, res, next){
    var _configPath = pathUtils.getConfigsPath(),
        _prodSoapDataPath = path.join(_configPath,"PROD_REQUEST_DATA.xml"),_prodSoapDataFile;
        _prodSoapDataFile = fs.readFileSync(_prodSoapDataPath, "utf8");
    //console.log(_prodSoapDataFile)
    res.render('missingCheck',  { title: 'Super Proxy Key Messing Check' , soapData:_prodSoapDataFile.toString() });
});

router.post("/tools/missingCheck", function(req, res, next){
    var _configPath = pathUtils.getConfigsPath(),
        _prodKeyDataPath = path.join(_configPath, "PROD_KEYS_DATA.txt"),
        _prodKeyDataFile , result = {}, keys, keyRegex = /^a\d*_/ , arr = [];

    //console.log(_uatKeyDataPath)

    _prodKeyDataFile = fs.readFileSync(_prodKeyDataPath, "utf8");

    //console.log(_uatKeyDataFile);

    keys = _prodKeyDataFile.split("\n");

    superSoap.request(req.body.wsdlUrl, req.body.soapData,null,
        function(data){
            if(data){
                for(var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    if(keyRegex.exec(key)) {
                        var targetKey = "<key>" + key.replace(/(^\s*)|(\s*$)|(\r*$)/g, '') + "</key>";
                        if(data.indexOf(targetKey) < 0) {
                            arr.push(key.replace(/(^\s*)|(\s*$)|(\r*$)/g, ''));
                        }
                    }
                }
                if(!arr.length){
                    arr.push("All Matched");
                }

            }else{
                arr.push("Soap Error");
            }
            res.end(JSON.stringify(arr));
        });

});

module.exports = router;