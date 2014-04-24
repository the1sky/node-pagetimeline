/**
 * Created by nant on 4/21/14.
 */
exports.version = '0.1.0';
exports.module = function(timeline){
    timeline.setMetric('hotspot', 3);

    timeline.addOffender('hotspot','http://www.baidu.com');
    timeline.addOffender('hotspot','http://www.baidu.com/logo.gif');
    timeline.addOffender('hotspot','http://www.baidu.com/test.js');
}