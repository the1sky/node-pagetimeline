/**
 * Created by nant on 4/21/14.
 */
exports.version = '0.1.0';
exports.module = function (timeline) {
    var TOP_K = 10;
    var count_duration = function (start, finish) {
        return ( (finish - start) / 1000000).toFixed(2);
    };

    var getFuncName = function (log) {
        var tmp = log.split('\t')[0].split('(')[0].split('::');
        return tmp[tmp.length - 1];
    };

    var getParameters = function (log) {
        var paramStr = log.split('\t')[2];
        if (paramStr) {
            return paramStr.split(' ');
        }
        return null;
    };

    var getStartTime = function (log) {
        return log.split('\t')[1];
    };

    var function_pair_map = {
        "willSendRequest": "didFinishLoading"
    }
    var ignore_functions = {'willRemoveDOMNode': 1,
        'willDestroyCachedResource': 1,
        "didReceiveData": 1};

    var filterResult = timeline.getResults().getFilterData();

    var function_type = JSON.parse(require("fs").readFileSync(__dirname + "/function_type.json"));

    var len = filterResult.length;
    var startTime = len > 0 ? filterResult[0].split('\t')[1] : 0;
    var hotspot = [];
    for (var i = 0; i < len; i++) {
        var log = filterResult[i];
        var funcName = getFuncName(log);

        if (ignore_functions[funcName]) {
            continue;
        }

        if (funcName.indexOf('will') == 0 || function_pair_map[funcName]) {
            var pair_function_name = '';

            if (function_pair_map[funcName]) {
                pair_function_name = function_pair_map[funcName];
            } else {
                pair_function_name = funcName.replace(/^will$/, 'did');
            }

            var pair_index = i + 1;
            var found = false;

            while (pair_index < len) {
                if (getFuncName(filterResult[pair_index]) == pair_function_name) {
                    if (funcName == 'willSendRequest') {
                        if (getParameters(log)[1] == getParameters(filterResult[pair_index])[0]) {
                            found = true;
                            break;
                        }
                    } else {
                        found = true;
                        break;
                    }
                }
                pair_index += 1;
            }

            if (found) {
                var pair_log = filterResult[pair_index];
                var duration = ( getStartTime(pair_log) - getStartTime(log) ) / 1000000;
                var log_type = 'other'
                if (function_type[funcName]) {
                    log_type = function_type[funcName]["type"]
                }

                if ((duration - 0.009) > 0.00001) {
                    var extra = [];
                    var logParams = getParameters(log);
                    var pairLogParams = getParameters(pair_log);
                    if (logParams) {
                        extra = extra.concat(logParams);
                    }
                    if (pairLogParams) {
                        extra = extra.concat(pairLogParams);
                    }

                    hotspot.push({
                        "name": getFuncName(log).replace('will', ''),
                        "type": log_type,
                        "duration": duration,
                        "extra": extra.join(' ')
                    });
                }
            }
        }
    }

    hotspot.sort(function (x, y) {
        return y['duration'] - x['duration'];
    });
    len = hotspot.length < TOP_K ? hotspot.length : TOP_K;
    hotspot = hotspot.slice(0, len);

    timeline.setMetric('hotspot', len);

    for (i = 0; i < len; i++) {
        hotspot[i]['duration'] = hotspot[i]['duration'].toFixed(2);
        timeline.addOffender('hotspot', JSON.stringify(hotspot[i]));
    }
}
