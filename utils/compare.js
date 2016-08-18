/**
 * Created by jason.hei on 2016/7/29.
 */

var util = require ( 'util' ),
    events = require ( 'events' ) ,
    Compare;

Compare = function(){
    var self = this,compareXml;

    events.EventEmitter.call(this);


    self.compareXml = function (xml1, xml2) {
        self.emit("compareXml",xml1,xml2)
    };



    self.on("compareXml", function(xml1, xml2){
        console.log('compare1');
    });
    return self;
}

util.inherits(Compare,events.EventEmitter)

module.exports = Compare;
