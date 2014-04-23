/**
 * filter raw result, save to rawResults again
 * @type {string}
 */
exports.version = '0.1.0';
exports.module = function(timeline){
    var pairMapFunc = {
      'didFinishLoading':'SendRequest'
    };

    var ignoreFunc = {
        'didInvalidateLayout':1,
        'didInsertDOMNode':1
    };

    var funcCount = {};

    var rawResults = timeline.getResults().getRawData();
    rawResults = rawResults.split('\n');
    var filterResults = [];

    rawResults.forEach(function(item){
        var itemArr = item.split('\t');
        var suffixPart = itemArr[0];
        var funcPart = itemArr[1];
        var timePart = itemArr[2];
        var paramsPart = itemArr[3];

        if( suffixPart.match(/^a2b995ddc9-wlog/) && funcPart != undefined ){
            delete itemArr[0];
            var newItemStr = itemArr.join('\t').trim();
            filterResults.push( newItemStr );

            /**
            var funcName = funcPart.split('(')[0].split('::')
            funcName = funcName[funcName.length-1];

            if( !ignoreFunc[funcName] ) {
                if (funcName.match(/^will/)) {
                    var funcNameClean = funcName.substr(4);
                    if (funcCount[funcNameClean]) {
                        funcCount[funcNameClean] += 1;
                    } else {
                        funcCount[funcNameClean] = 1;
                    }
                } else if (funcName.match(/^did/)) {
                    if (pairMapFunc[funcName]) {
                        funcNameClean = pairMapFunc[funcName];
                        console.log(funcNameClean);
                    } else {
                        funcNameClean = funcName.substr(3);
                    }

                    if (funcCount[funcNameClean]) {
                        funcCount[funcNameClean] -= 1;
                        if( funcCount[funcNameClean] < 0 ){
                            funcCount[funcNameClean] = 0;
                        }
                    } else {
                        console.log( 'first appear did' + funcNameClean );
                        funcCount[funcNameClean] = 0;
                    }
                }
            }
             */
        }
    });

    timeline.getResults().setFilterData( filterResults );

    /*
    for( var funcNameClean in funcCount ){
        var count = funcCount[funcNameClean];
        if( count != 0 ){
            console.log( funcNameClean, count );
        }
    };
    */
}