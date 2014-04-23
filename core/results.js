/**
 * Simple results wrapper
 *
 * Will be passed via events and to formatters
 */
module.exports = function(data) {
    var asserts = {},
        generator = '',
        rawData,
        filterData = [],
        metrics = {},
        offenders = {},
        url;

    if (data) {
        asserts = data.asserts || {};
        generator = data.generator;
        metrics = data.metrics;
        offenders = data.offenders;
        rawData = data.rawData;
        filterData = data.filterData;
        url = data.url;
    }

    // public API
    return {
        //raw
        getRawData:function(){
            return rawData;
        },
        setRawData:function(data){
            rawData = data;
        },
        getFilterData:function(){
            return filterData;
        },
        setFilterData:function(data){
            filterData = data;
        },
        // metrics
        setMetric: function(name, value) {
            metrics[name] = value;
        },
        getMetric: function(name) {
            return metrics[name];
        },
        getMetrics: function() {
            return metrics;
        },
        getMetricsNames: function() {
            return Object.keys(metrics);
        },

        // offenders
        addOffender: function(metricName, msg) {
            if (typeof offenders[metricName] === 'undefined') {
                offenders[metricName] = [];
            }

            offenders[metricName].push(msg);
        },

        getOffenders: function(metricName) {
            return offenders[metricName];
        },

        getAllOffenders: function() {
            return offenders;
        },

        // set URL report was generated for
        setUrl: function(val) {
            url = val;
        },
        getUrl: function() {
            return url;
        },

        // generator - phantomas vX.X.X
        setGenerator: function(val) {
            generator = val;
        },
        getGenerator: function() {
            return generator;
        },

        // asserts handling
        setAssert: function(metric, val) {
            asserts[metric] = val;
        },
        setAsserts: function(val) {
            asserts = val || {};
        },
        getAsserts: function() {
            return asserts;
        },
        hasAssertion: function(metric) {
            return typeof asserts[metric] !== 'undefined';
        },
        getAssertion: function(metric) {
            return asserts[metric];
        },

        // assertions
        assert: function(metric) {
            var expected = this.getAssertion(metric),
                val = this.getMetric(metric);

            if (!this.hasAssertion(metric) || typeof val === 'undefined') {
                return true;
            }

            return (typeof val === 'number') ? val <= expected : true;
        },
        getFailedAsserts: function() {
            return this.getMetricsNames().filter(function(metric) {
                return this.assert(metric) === false;
            }, this);
        }
    };
};
