/**
 * Created by jason.hei on 2016/7/29.
 */

var util, events, DOMParser, Compare, CompareReport;
util = require('util');
events = require('events');
DOMParser = require('xmldom').DOMParser,
_ = require("underscore");
CompareReport = function(){
    var self = this,
        compareReport = {};

    events.EventEmitter.call(this);

    self.logUpServiceCodeResult = function(result,serviceCode,msg){
        self.emit("logUpServiceCodeResult",result,serviceCode,msg);
    }

    self.logUpResultCodeResult = function(result,serviceCode,msg){
        self.emit("logUpResultCodeResult",result,serviceCode,msg);
    }

    self.getReport = function(){
        return compareReport;
    }

    self.logUpCountOfServiceData = function(result, serviceCode, msg){
        self.emit("logUpCountOfServiceData",result, serviceCode, msg);
    }

    self.logUpAllOfFieldMatched = function(serviceCode){
        self.emit("logUpAllOfFieldMatched",serviceCode);
    }

    self.logUpServiceDataDifference = function(serviceCode,refServiceDataItem,comServiceDataItem,msg){
        self.emit("logUpServiceDataDifference",serviceCode, refServiceDataItem, comServiceDataItem,msg);
    }

    self.on("logUpServiceCodeResult",function(result,serviceCode,msg){
        if(!compareReport[serviceCode]){
            compareReport[serviceCode] = {};
            compareReport[serviceCode].serviceCode = {};
        }

        compareReport[serviceCode].serviceCode.result= result;
        compareReport[serviceCode].serviceCode.msg= msg;
    });

    self.on("logUpResultCodeResult",function(result,serviceCode, msg){
        if(!compareReport[serviceCode].resultCode){
            compareReport[serviceCode].resultCode = {};
        }
        compareReport[serviceCode].resultCode.result= result;
        compareReport[serviceCode].resultCode.msg= msg;
    });

    self.on("logUpCountOfServiceData", function(result, serviceCode, msg){
        if(!compareReport[serviceCode].serviceData){
            compareReport[serviceCode].serviceData = {};
            compareReport[serviceCode].serviceData.count = {};
            compareReport[serviceCode].serviceData.field = {};
        }
        compareReport[serviceCode].serviceData.count.result= result;
        compareReport[serviceCode].serviceData.count.msg= msg;
    });

    self.on("logUpAllOfFieldMatched",function(serviceCode){
        compareReport[serviceCode].serviceData.field = {};
        compareReport[serviceCode].serviceData.field.result = true;
        compareReport[serviceCode].serviceData.field.msg = "All Matched";
    });

    self.on("logUpServiceDataDifference",function(serviceCode,refServiceDataItem,comServiceDataItem,msg){
        compareReport[serviceCode].serviceData.difference = [];
        compareReport[serviceCode].serviceData.difference.push({"reference":JSON.stringify(refServiceDataItem), "compare":JSON.stringify(comServiceDataItem),"msg":msg});
    });

}
Compare = function(){
    var self = this,
        domParser = new DOMParser(),
        prepareCompareResultCode,
        prepareCompareServiceDatum,
        log, loopEnd, reportHook;

    log = new CompareReport();

    events.EventEmitter.call(this);

    self.compareSuperProxy = function (xml1, xml2, reportCallback) {
        self.emit("compareSuperProxy",xml1,xml2,reportCallback);
    };

    self.on("compareSuperProxy", function(xml1, xml2, reportCallback){
        var referenceXml, compareXml, referenceServicesList, compareServicesList;

        loopEnd = false;

        referenceXml = domParser.parseFromString(xml1);
        compareXml = domParser.parseFromString(xml2);

        referenceServicesList = referenceXml.getElementsByTagName("services");
        compareServicesList = compareXml.getElementsByTagName("services");

        reportHook = reportCallback;

        _.find(referenceServicesList, function(referenceService,idx){
            var compareService;

            if( idx == referenceServicesList.length - 1){
                loopEnd = true;
            }

            compareService = compareServicesList.item(idx);

            self.emit("compareServiceCode",referenceService,compareService,prepareCompareResultCode);
        });
    });

    self.on("compareServiceCode",function(referenceService, compareService, next){
        var refServiceCode, comServiceCode, result;
        refServiceCode = referenceService.getElementsByTagName("serviceCode").item(0).hasChildNodes() ?
            referenceService.getElementsByTagName("serviceCode").item(0).childNodes.item(0).nodeValue : "Empty" ;
        comServiceCode =compareService.getElementsByTagName("serviceCode").item(0).hasChildNodes() ?
            compareService.getElementsByTagName("serviceCode").item(0).childNodes.item(0).nodeValue : "Empty";

        result = refServiceCode === comServiceCode;

        if(result){
            log.logUpServiceCodeResult(result,refServiceCode,"Matched. (Service Code :"+refServiceCode+")");
            // if both service code is the same continue next compare.
            if(next) next(referenceService, compareService);
        }else {
            log.logUpServiceCodeResult(result,refServiceCode,"Different: Reference Service Code :" + refServiceCode
                +" Compare Service Code :" + comServiceCode);
        }
    });

    self.on("compareResultCode",function(referenceService, compareService, next){
        var refServiceCode, refResultCode, comResultCode, result;

        refServiceCode = referenceService.getElementsByTagName("serviceCode").item(0).childNodes.item(0).nodeValue;

        refResultCode = referenceService.getElementsByTagName("resultCode").item(0).childNodes.item(0).nodeValue;
        comResultCode = compareService.getElementsByTagName("resultCode").item(0).childNodes.item(0).nodeValue;

        result = refResultCode === comResultCode;

        if(result){
            log.logUpResultCodeResult(result, refServiceCode, "Matched. (Result Code :" + refResultCode + ")");
        }else{
            log.logUpResultCodeResult(result, refServiceCode, "Different. (Reference Result Code :" + refResultCode
                +" Compare Result Code :" + comResultCode +")");
        }
        if(next) next(referenceService, compareService);

    });

    self.on("compareServiceDatum", function(referenceService, compareService,next){
        var refServiceCode, refServiceDataNodeArr, comServiceDataNodeArr, serviceDataCompareReslt, refServiceData, comServiceData, fieldName, fieldType;

        refServiceCode = referenceService.getElementsByTagName("serviceCode").item(0).childNodes.item(0).nodeValue;

        refServiceDataNodeArr = referenceService.getElementsByTagName("serviceData");
        comServiceDataNodeArr = compareService.getElementsByTagName("serviceData");

        // COUNT CHECK
        serviceDataCompareReslt = refServiceDataNodeArr.length === comServiceDataNodeArr.length;
        if(serviceDataCompareReslt){
            log.logUpCountOfServiceData(serviceDataCompareReslt, refServiceCode, "Matched. (Size :" + refServiceDataNodeArr.length + ")")
        }else{
            log.logUpCountOfServiceData(serviceDataCompareReslt, refServiceCode, "Different. (Reference service data size :" + refServiceDataNodeArr.length
                + " Compare service data size :" + comServiceDataNodeArr.length + ")")
        }

        // field name and value check
        refServiceData = [], comServiceData =[];

        _.each(refServiceDataNodeArr,function(serviceDataNode){
            fieldName = serviceDataNode.childNodes.item(0).childNodes.item(0).nodeValue;
            fieldType = serviceDataNode.childNodes.item(1).nodeName;
            refServiceData.push({"fieldName":fieldName,"fieldType":fieldType});
        });

        _.each(comServiceDataNodeArr,function(serviceDataNode){
            fieldName = serviceDataNode.childNodes.item(0).childNodes.item(0).nodeValue;
            fieldType = serviceDataNode.childNodes.item(1).nodeName;
            comServiceData.push({"fieldName":fieldName,"fieldType":fieldType});
        });

        if(_.isEqual(refServiceData,comServiceData)){
            //log up all of the key and value of service data is same
            //console.log("same")
            log.logUpAllOfFieldMatched(refServiceCode);
            console.log("Reference Service Data: " + JSON.stringify(refServiceData))
            console.log("Compare Service Data: " + JSON.stringify(comServiceData))
        }else{
            // iterator
            _.each(refServiceData, function(refServiceDataItem){
                var comServiceDataItem = _.findWhere(comServiceData,{"fieldName":refServiceDataItem.fieldName});
                if(!comServiceDataItem){
                    // log up com service data item was missing.
                    log.logUpServiceDataDifference(refServiceCode, refServiceDataItem, comServiceDataItem, "Field Missing");
                }else{
                    //compare field type
                    if(!_.isEqual(refServiceDataItem.fieldType,comServiceDataItem.fieldType)){
                        // log up field type is different
                        log.logUpServiceDataDifference(refServiceCode,refServiceDataItem,comServiceDataItem,"Field Type Difference")
                    }else{
                        // matched do nothing
                    }
                }
            });

            _.each(comServiceData, function(comServiceDataItem){
                var refServiceDataItem = _.findWhere(refServiceData,{"fieldName":comServiceDataItem.fieldName});
                if(!refServiceDataItem){
                    // log up com service data item was missing.
                    log.logUpServiceDataDifference(refServiceCode, refServiceDataItem, comServiceDataItem, "Field Extra");
                }

            });

        }

        if(loopEnd && next){
            next(log.getReport());
        }
    });

    prepareCompareResultCode = function(referenceService,compareService){
        self.emit("compareResultCode",referenceService,compareService,prepareCompareServiceDatum);
    };

    prepareCompareServiceDatum = function(referenceService,compareService){
        self.emit("compareServiceDatum",referenceService,compareService, reportHook);
    };

    return self;
}

util.inherits(Compare,events.EventEmitter)
util.inherits(CompareReport,events.EventEmitter)

module.exports = Compare;
