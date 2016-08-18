var SuperSoap, soapConfig = require("./config"),
    soap = require("./extension/soap")

SuperSoap = function () {

    var self = this;

    self.request = function(url, soapData,config, requestHandler){
        if(!config){
            config = soapConfig.wsdlOptions;
        }
        return requestHandler(soap,url,config,soapData);
    }

    self.request = function (url, soapData, config, callback) {
        if(!config){
            config = soapConfig.wsdlOptions;
        }
        if(!url){
            return false;
        }
        if(!soapData){
            return false;
        }
        soap.createClient(url, config, function (err, client) {
            if (!err) {
                client.GetExternalService(soapData, function (err, resp) {
                    if(err){
                        console.log(err);
                    }
                    if(resp){
                        console.log(resp);
                    }
                    callback(resp)
                });
            } else {
                console.log(err)
                callback()
            }
        }, url);
    }

    return self;
}

module.exports = SuperSoap;