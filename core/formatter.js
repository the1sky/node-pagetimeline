/**
 * Results formatter
 */
module.exports = function(results, format) {
	var formatterPath = './formatters/' + format,
		formatter;

	try {
		formatter = new (require(formatterPath))(results);
	}
	catch(ex) {
		throw 'formatter: format "' + format + '" is not supported!';
	}

    return formatter.render();
};
