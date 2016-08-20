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
        self.emit("logUpCompareServiceCodeResult",result,serviceCode,msg);
    }

    self.logUpResultCodeResult = function(result,serviceCode,msg){
        self.emit("logUpCompareResultCodeResult",result,serviceCode,msg);
    }

    self.getReport = function(){
        return compareReport;
    }

    self.on("logUpCompareServiceCodeResult",function(result,serviceCode,msg){
        if(!compareReport[serviceCode]){
            compareReport[serviceCode] = {};
            compareReport[serviceCode].serviceCode = {};
        }

        compareReport[serviceCode].serviceCode.result= result;
        compareReport[serviceCode].serviceCode.msg= msg;
    });

    self.on("logUpCompareResultCodeResult",function(result,serviceCode, msg){
        if(!compareReport[serviceCode].resultCode){
            compareReport[serviceCode].resultCode = {};
        }
        compareReport[serviceCode].resultCode.result= result;
        compareReport[serviceCode].resultCode.msg= msg;
    });

}
Compare = function(){
    var self = this,compareXml,
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
        refServiceCode = referenceService.getElementsByTagName("serviceCode").item(0).childNodes.item(0).nodeValue;
        comServiceCode = compareService.getElementsByTagName("serviceCode").item(0).childNodes.item(0).nodeValue;

        result = refServiceCode === comServiceCode

        if(result){
            log.logUpServiceCodeResult(result,refServiceCode,"Matched");
        }else {
            log.logUpServiceCodeResult(result,refServiceCode,"Different: Reference Service Code :" + refServiceCode
                +" Compare Service Code :" + comServiceCode);
        }

        if(next) next(referenceService, compareService,result);
    });

    self.on("compareResultCode",function(referenceService, compareService, next){
        var refServiceCode, refResultCode, comResultCode, result;

        refServiceCode = referenceService.getElementsByTagName("serviceCode").item(0).childNodes.item(0).nodeValue;

        refResultCode = referenceService.getElementsByTagName("resultCode").item(0).childNodes.item(0).nodeValue;
        comResultCode = compareService.getElementsByTagName("resultCode").item(0).childNodes.item(0).nodeValue;

        result = refResultCode === comResultCode;

        if(result){
            log.logUpResultCodeResult(result, refServiceCode, "Matched")
        }else{
            log.logUpResultCodeResult(result, refServiceCode, "Different: Reference Result Code :" + refResultCode
                +" Compare Result Code :" + comResultCode);
        }

        if(next) next(referenceService, compareService,result);
    });

    self.on("compareServiceDatum", function(referenceService, compareService,next){
        if(next) next(log.getReport());
    });

    prepareCompareResultCode = function(referenceService,compareService){
        self.emit("compareResultCode",referenceService,compareService,prepareCompareServiceDatum);
    };

    prepareCompareServiceDatum = function(referenceService,compareService){
        if(!loopEnd){
            self.emit("compareServiceDatum",referenceService,compareService);
        }else{
            self.emit("compareServiceDatum",referenceService,compareService, reportHook);
        }
    };

    return self;
}

util.inherits(Compare,events.EventEmitter)
util.inherits(CompareReport,events.EventEmitter)

module.exports = Compare;
