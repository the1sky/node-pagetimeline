/**
 * Created by nant on 4/21/14.
 */
exports.version = '0.1.0';
exports.module = function (timeline) {
    var function_pair_map = {
        "willSendRequest": "didFinishLoading"
    }
    var ignore_functions = {'willRemoveDOMNode': 1,
        'willDestroyCachedResource': 1,
        "didReceiveData": 1};
    var filterResult = timeline.getResults().getFilterData();
    var len = filterResult.length;
    var startTime = len > 0 ? filterResult[0].split('\t')[1] : 0;
    var hotspot = [];
    for (var i = 0; i < len; i++) {
        var item = filterResult[i];
        var itemArr = item.split('\t');
        var funcPart = itemArr[0];
        var timePart = itemArr[1];
        var paramsPart = itemArr[2];

        var funcName = funcPart.split('(')[0].split('::')
        funcName = funcName[funcName.length - 1];

        if( ignore_functions[funcName] ){
            continue;
        }

        if (funcName.indexOf('will') == 0 || function_pair_map[funcName]) {
            var pair_function_name = '';

            if( function_pair_map[funcName] ){
                pair_function_name = function_pair_map[funcName];
            }else{
               pair_function_name = funcName.replace(/^will$/, 'did');
            }

            var pair_index = i + 1;
            var found = false;

            while( pair_index < len ){
                if( getFuncName( filterResult[pair_index] ) == pair_function_name ){
                    if( funcName == 'willSendRequest'){
                        //todo
                        if( paramsPart[1] == getParameters(filterResult[pair_index]) ){
                            found = true;
                            break;
                        }
                    }else{
                        found = true;
                        break;
                    }
                }
                pair_index += 1;
            }

            if( found ){
                var pair_log = filterResult[pair_index]
                duration = getStartTime( pair_log ) - getStartTime( item ) / 1000000
                var log_type = 'other'
                if function_name in function_type:
                    log_type = function_type[funcName]["type"]

                if ( (duration - 0.009) > 0.00001 ){
                    hotspot.push({
                        "name": log['functionName'].replace('will', ''),
                        "type": log_type,
                        "duration": duration,
                        "extra": log['parameters'] + pair_log['parameters']
                    });
                }
            }
        }
    }


    hotspot = sorted(hotspot, key = lambda x:x['duration'], reverse=True)[:TOP_K]

    for item in hotspot:
    item['duration'] = "{0:.2f}".format( item['duration'] );

    var count_duration = function (start, finish) {
        return ( (finish - start) / 1000000).toFixed(2);
    };

    var getFuncName = function(log){
        return log.split('\t')[0].split('(')[0].split('::');
    };

    var getParameters = function(log){

    };

    var getStartTime = function(log){
        return log.split('\t')[1] : 0;
    }

    timeline.setMetric('hotspot', 3);

    timeline.addOffender('hotspot', 'http://www.baidu.com');
    timeline.addOffender('hotspot', 'http://www.baidu.com/logo.gif');
    timeline.addOffender('hotspot', 'http://www.baidu.com/test.js');
}
