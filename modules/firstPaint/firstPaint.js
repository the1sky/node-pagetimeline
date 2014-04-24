/**
 * first paint event
 * @type {string}
 */
exports.version = '0.1.0';
exports.module = function(timeline){
    var filterResult = timeline.getResults().getFilterData();
    var len = filterResult.length;
    var passFirstPaint = false;
    var startTime = 0;
    var firstPaint = 0;
    for(var i=0; i < len; i++ ){
        var item = filterResult[i];
        var itemArr = item.split('\t');
        var funcPart = itemArr[0];
        var timePart = itemArr[1];
        var paramsPart = itemArr[2];

        if( i == 0 ){
            startTime = timePart;
        }

        var funcName = funcPart.split('(')[0].split('::')
        funcName = funcName[funcName.length-1];

        //index > 10 is using to ignore init paint (trigger by setFrameRect)
        if( funcName == 'willPaint' && !passFirstPaint && i > 10 ){
            passFirstPaint = true;
            firstPaint = ( ( timePart - startTime ) / 1000000 ).toFixed(2);
            break;
        }
    }
    timeline.setMetric( 'firstPaint', firstPaint );
}