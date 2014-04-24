/**
 * Created by nant on 4/21/14.
 */
exports.version = '0.1.0';
exports.module = function(timeline){
    timeline.setMetric('paint', 2);

    timeline.addOffender('paint','0,0,800,600');
    timeline.addOffender('paint','0,0,600,600');
}