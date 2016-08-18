/**
 * Created by jason.hei on 2016/7/26.
 */
var path = require('path');
module.exports = {
    getConfigsPath : function(){
        var _projectDir = path.resolve(__dirname, ".."),
            _configPath = path.join(_projectDir, 'configs');
        return _configPath;
    }
}