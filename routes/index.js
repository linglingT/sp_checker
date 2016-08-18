var express = require('express');
var router = express.Router();
var Compare = require('../utils/compare');

var soap = require('../utils/soap/extension/soap');
/* GET home page. */

var url = 'http://10.26.2.37:9910/superproxy/endpoints/ExternalServicesWS.wsdl';

router.get("/", function(req,res,next){

  var compare = new Compare();
  compare.compareXml("xml1","xml2");

  res.render('index', { title: 'Express1'});
})

module.exports = router;
