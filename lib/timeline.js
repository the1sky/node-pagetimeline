/**
 * timeline module
 */

if(!Function.prototype.bind) {
    Function.prototype.bind = function(scope) {
        var self = this;
        return function() {
            return self.apply(scope, arguments);
        };
    };
}

var debug = require('debug')('timeline');
var os = require('os');
var emitter = require('events').EventEmitter;
var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var VERSION = require('./../package').version;

// exit codes
var EXIT_SUCCESS = 0;
var EXIT_PLATFORM_ERROR = 250;
var EXIT_TIMED_OUT = 252;
var EXIT_CONFIG_FAILED = 253;
var EXIT_LOAD_FAILED = 254;
var EXIT_ERROR = 255;

/**
 *  timeline module entry
 *
 * @param url
 * @param options
 * @param callback
 * @returns {TimelineCore}
 */
function timeline(url, options, callback){
    return new TimelineCore( url, options, callback );
};

/**
 *  timeline core process
 *
 * @param url
 * @param options
 * @param callback
 * @returns {*}
 * @constructor
 */
var TimelineCore = function(url,options,callback){
    var self = this;

    this.url = url;
    this.timelineExecPath = module.exports.path + '/timeline';
    this.modules = [];

    // --skip-modules=jQuery,domQueries
    this.skipModules = [];

    // --format=[csv|json]
    this.format = options.format || 'plain';

    // set up results wrapper
    var Results = require('./../core/results');
    this.results = new Results();
    this.results.setGenerator('timeline v' + self.getVersion() + ':\r\n' );
    this.results.setUrl( self.url );

    // --timeout (in seconds)
    this.timeout = (options.timeout > 0 && parseInt(options.timeout, 10)) || 15;

    // setup the stuff
    this.emitter = new emitter();
    this.emitter.setMaxListeners(200);

    this.util = this.require('util');

    // --verbose
    this.verboseMode = options.verbose === true;

    // --silent
    this.silentMode = options.silent === true;

    // setup logger
    var Logger = require('./../core/logger'),
        logFile = options.log || '';

    this.logger = new Logger(logFile, {
        beVerbose: this.verboseMode,
        beSilent: this.silentMode
    });

    if (!this.isTargetPlatform()) {
        return {
            code:EXIT_PLATFORM_ERROR,
            on: this.on.bind(this)
        };
    }

    // options can be omitted
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }

    // options handling
    options = options || {};
    options.url = options.url || url || false;


    // build args
    var width, height, user_agent, url, format;
    Object.keys(options).forEach(function (key) {
        var val = options[key];
        if (val === false) return;
        if (key === 'url') {
            url = val;
        } else if (key === 'user-agent') {
            user_agent = val;
        } else if (key === 'format') {
            format = val;
        } else if (key == 'viewport') {
            var xIndex = val.indexOf('x');
            width = val.substr(0, xIndex);
            height = val.substr(xIndex + 1, val.length - xIndex);
        } else if (key === 'skip-modules') {
            this.skipModules = ( typeof val === 'string') ? val.split(',') : [];
        }
    });

    //exec the process
    var xvfbargs = " -a '--server-args=-screen 0 " + width + "x" + height + "x16' ";
    var timelineArgs = " --url=" + url + " --user-agent=" + user_agent;
    var proc = exec("xvfb-run" + xvfbargs + this.timelineExecPath + timelineArgs );

    proc.on('error', function (err) {
        self.emit('error', err);
    });

    // gather data from stdout
    proc.stdout.on('data', function (buf) {
        self.rawResults += buf;
    });

    // process results
    proc.on('close', function (code) {
        var json = false;

        //save raw result
        self.results.setRawData( self.rawResults );

        //load core modules
        self.addCoreModule('filter');

        // load 3rd party modules
        self.modules = (self.modules.length > 0) ? self.modules : self.listModules();
        self.modules.forEach(function (moduleName) {
            if (self.skipModules.indexOf(moduleName) > -1) {
                return;
            }
            self.addModule(moduleName);
        }, self);

        self.emit('results', self.results );

        // (try to) parse to JSON
        if (options.format === 'json') {
            try {
                json = JSON.parse( self.results.getMetrics() );
                self.emit('data', json);
            }
            catch (ex) {
                debug('Error when parsing JSON (%s): %s', ex, self.results.getMetrics() );
            }pathSqldrivers
        }

        if ( code > 0 ) {
            self.emit('error', code);
        }

        if (typeof callback === 'function') {
            callback(code === 0 ? null : code, json || self.results);
        }
    });

    return {
        pid: proc.pid,
        stdout: proc.stdout,
        stderr: proc.stderr,
        code:EXIT_SUCCESS,
        on:this.on.bind(this)
    };
};

TimelineCore.prototype = {
    emit: function(/* eventName, arg1, arg2, ... */) {
        this.emitter.emit.apply(this.emitter, arguments);
    },

    on: function(ev, fn) {
        this.emitter.on(ev, fn);
    },

    getVersion:function(){
      return VERSION;
    },

    getResults:function(){
        return this.results;
    },

    getPublicWrapper: function() {
        return {
            url: this.url,
            getResults:this.getResults.bind(this),
            getVersion: this.getVersion.bind(this),
            setMetric: this.setMetric.bind(this),
            getMetric: this.getMetric.bind(this),
            addOffender: this.addOffender.bind(this)
        };
    },

    isTargetPlatform:function(){
        //linux or not
        if( os.platform() != "linux" ){
            return false;
        }

        //whether ubuntu12.04 or not
        exec( 'cat /etc/issue' + ' 2>&1 1>output && echo done! > done' );
        while( !fs.existsSync( 'done' ) ){
        }
        var output = fs.readFileSync( 'output' );
        var outputStr = output.toString();
        fs.unlinkSync( 'output' );
        fs.unlinkSync( 'done' );
        if( !( outputStr.indexOf( 'Ubuntu' ) > -1 && outputStr.indexOf( '12.04' ) > -1 ) ){
            return false;
        }
        return true;
    },

    addCoreModule: function(name) {
        var pkg = require('./../core/modules/' + name + '/' + name);
        pkg.module(this.getPublicWrapper());
    },

    addModule:function(name){
        var pkg;
        try {
            pkg = require( __dirname + '/../modules/' + name + '/' + name);
        }
        catch (e) {
            return false;
        }
        if (pkg.skip) {
            return false;
        }
        pkg.module(this.getPublicWrapper());
        return true;
    },

    listModules:function(){
        var fs = require('fs'),
            modulesDir = __dirname + '/../modules',
            ls = fs.readdirSync( modulesDir ) || [],
            modules = [];

        ls.forEach(function(entry) {
            var stat = fs.lstatSync(modulesDir + '/' + entry + '/' + entry + '.js');
            if( !stat.isDirectory() ){
                modules.push(entry);
            }
        });
        return modules;
    },

    // metrics reporting
    setMetric: function(name, value) {
        value = typeof value === 'string' ? value : (value || 0); // set to zero if undefined / null is provided
        this.results.setMetric(name, value);
    },

    getMetric: function(name) {
        return this.results.getMetric(name);
    },

    addOffender: function(/**metricName, msg, ... */) {
        var args = Array.prototype.slice.call(arguments),
            metricName = args.shift();
        this.results.addOffender(metricName, this.util.format.apply(this, args));
    },

    // require CommonJS module from lib/modules
    require: function(module) {
        return require('../lib/modules/' + module);
    }
};

/**
 * Where the phantom binary can be found.
 * @type {string}
 */
try {
    timeline.path = path.resolve(__dirname, require('./location').location.timeline)
} catch(e) {
    // Must be running inside install script.
    timeline.path = null
}


timeline.path = path.join(__dirname,'timeline');

timeline.cleanPath = function (path) {
    return path
        .replace(/:[^:]*node_modules[^:]*/g, '')
        .replace(/(^|:)\.\/bin(\:|$)/g, ':')
        .replace(/^:+/, '')
        .replace(/:+$/, '')
}

// Make sure the binary is executable.  For some reason doing this inside
// install does not work correctly, likely due to some NPM step.
if (timeline.path) {
    try {
        // avoid touching the binary if it's already got the correct permissions
        var st = fs.statSync(timeline.path);
        var mode = st.mode | 0555;
        if (mode !== st.mode) {
            fs.chmodSync(timeline.path, mode);
        }
    } catch (e) {
        // Just ignore error if we don't have permission.
        // We did our best. Likely because phantomjs was already installed.
    }
}

timeline.pathFonts = path.join( timeline.path, 'fonts' );
timeline.pathLibs = path.join( timeline.path, 'libs' );
timeline.pathPlatforms = path.join( timeline.path, 'platforms' );
timeline.pathSqldrivers = path.join( timeline.path, 'sqldrivers' );
timeline.version = VERSION;

//add all relative path
process.env.PATH += ':' + timeline.pathLibs;;
process.env.PATH += ':' + timeline.pathPlatforms
process.env.PATH += ':' + timeline.pathFonts;
process.env.PATH += ':' + timeline.pathSqldrivers;

module.exports = timeline;