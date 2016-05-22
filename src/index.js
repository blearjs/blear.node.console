/**
 * 修正 global.console，以便可以在不同的环境打印不同级别的日志
 * @author ydr.me
 * @create 2015-12-10 21:35
 */


'use strict';

var util = require('util');
var access = require('blear.utils.access');
var collection = require('blear.utils.collection');
var object = require('blear.utils.object');
var typeis = require('blear.utils.typeis');
var string = require('blear.utils.string');

var console = global.console;
var oldLog = console.log;

var colorCodes = {
    bold: [1, 22],
    dim: [2, 22],
    italic: [3, 23],
    underline: [4, 24],
    inverse: [7, 27],
    hidden: [8, 28],
    strikethrough: [9, 29],

    black: [30, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    blue: [94, 39],
    magenta: [35, 39],
    cyan: [36, 39],
    white: [37, 39],
    gray: [90, 39],
    grey: [90, 39],

    bgBlack: [40, 49],
    bgRed: [41, 49],
    bgGreen: [42, 49],
    bgYellow: [43, 49],
    bgBlue: [44, 49],
    bgMagenta: [45, 49],
    bgCyan: [46, 49],
    bgWhite: [47, 49],

    // legacy styles for colors pre v1.0.0
    blackBG: [40, 49],
    redBG: [41, 49],
    greenBG: [42, 49],
    yellowBG: [43, 49],
    blueBG: [44, 49],
    magentaBG: [45, 49],
    cyanBG: [46, 49],
    whiteBG: [47, 49]

};


/**********************************************
 pretty
 **********************************************/
/**
 * 格式错误对象
 * @param err
 * @returns {*}
 */
var formatError = function (err) {
    var msg = err.stack || err.message || String(err);
    var name = err.name || 'Error';

    collection.each(err, function (key, val) {
        msg += '\n' + name + '.' + key + ': ' + format(val);
    });

    return msg;
};


/**
 * 格式化
 * @param obj
 * @returns {*}
 */
var format = function (obj) {
    if (typeis.String(obj)) {
        return obj;
    }

    if (obj && obj instanceof Error) {
        return formatError(obj);
    }

    try {
        return util.inspect(obj, {
            depth: 3,
            colors: false,
            showHidden: false
        });
    } catch (err) {
        /* istanbul ignore next */
        return formatError(err);
    }
};


/**********************************************
 colors
 **********************************************/
/**
 * 颜色包装器
 * @param color
 * @returns {Function}
 */
var makeColor = function (color) {
    return function () {
        var msg = console.format.apply(global, arguments);

        if (!color) {
            return msg;
        }

        var args = [];

        args.push('\x1b[' + colorCodes[color][0] + 'm%s\x1b[' + colorCodes[color][1] + 'm');
        args.push(msg);

        return util.format.apply(util, args);
    };
};

console.colors = {
    // forcecolor
    black: makeColor('black'),
    red: makeColor('red'),
    grey: makeColor('grey'),
    cyan: makeColor('cyan'),
    green: makeColor('green'),
    blue: makeColor('blue'),
    yellow: makeColor('yellow'),
    inverse: makeColor('inverse'),
    magenta: makeColor('magenta'),

    // backcolor
    bgBlack: makeColor('bgBlack'),
    blackBG: makeColor('blackBG'),
    bgRed: makeColor('bgRed'),
    redBG: makeColor('redBG'),
    bgGreen: makeColor('bgGreen'),
    greenBG: makeColor('greenBG'),
    bgYellow: makeColor('bgYellow'),
    yellowBG: makeColor('yellowBG'),
    bgBlue: makeColor('bgBlue'),
    blueBG: makeColor('blueBG'),
    bgMagenta: makeColor('bgMagenta'),
    magentaBG: makeColor('magentaBG'),
    bgCyan: makeColor('bgCyan'),
    cyanBG: makeColor('cyanBG'),
    bgWhite: makeColor('bgWhite'),
    whiteBG: makeColor('whiteBG'),

    // stylecolor
    bold: makeColor('bold'),
    dim: makeColor('dim'),
    italic: makeColor('italic'),
    underline: makeColor('underline'),
    hidden: makeColor('hidden'),
    original: makeColor()
};


/**********************************************
 styles
 **********************************************/
/**
 * 格式化
 * @returns {string}
 */
console.format = function (/*arguments*/) {
    return access.args(arguments).map(format).join(' ');
};


/**
 * 输出美化
 * @param _out
 * @param _colors {Array}
 * @returns {String}
 */
console.pretty = function (_out/*arguments*/, _colors) {
    var args = access.args(arguments);
    var colors = args.pop();
    var out = console.format.apply(console, args);

    colors = typeis.Array(colors) ? colors : [colors];

    collection.each(colors, function (index, color) {
        color = String(color);

        if (typeis.Function(console.colors[color])) {
            out = console.colors[color](out);
        }
    });

    return out;
};


/**********************************************
 out
 **********************************************/
var configs = {
    // 是否颜色输出
    // PM2 环境不建议输出颜色，否则日志文件内有很多颜色代码
    color: true,
    // 日志级别
    // 生产环境建议只打印出 warn、error 日志
    level: [
        'log',
        'info',
        'warn',
        'error'
    ],
    // 内容部变量
    _levelMap: {}
};


// 生成配置日志级别 map
var buildConfigLevelMap = function () {
    configs._levelMap = {};
    collection.each(configs.level, function (index, type) {
        configs._levelMap[type] = true;
    });
};


/**
 * 配置
 * @returns {*}
 */
console.config = function () {
    return access.getSet({
        get: function (key) {
            return configs[key];
        },
        set: function (key, val) {
            configs[key] = val;
            buildConfigLevelMap();
        },
        setLength: 2
    }, arguments);
};
buildConfigLevelMap();


/**
 * 打印日志
 * @param msg
 */
var printOut = function (msg) {
    process.stdout.write(msg + '\n');
};


/**
 * 普通日志
 */
console.log = function () {
    if (!configs._levelMap.log) {
        return;
    }

    oldLog.apply(console, access.args(arguments).map(format));
};


/**
 * 消息日志
 */
console.info = function () {
    if (!configs._levelMap.info) {
        return;
    }

    var out = console.format.apply(global, arguments);

    if (configs.color) {
        out = console.pretty(out, ['green', 'bold']);
    }

    printOut(out);
};


/**
 * 警告日志
 */
console.warn = function () {
    if (!configs._levelMap.warn) {
        return;
    }

    var out = console.format.apply(global, arguments);

    if (configs.color) {
        out = console.pretty(out, ['yellow', 'bold']);
    }

    printOut(out);
};


/**
 * 错误日志
 */
console.error = function () {
    if (!configs._levelMap.error) {
        return;
    }

    var out = console.format.apply(global, arguments);

    if (configs.color) {
        out = console.pretty(out, ['red', 'bold']);
    }

    printOut(out);
};


/**
 * 右填充字符串
 * @param str {String} 字符串
 * @param [maxLength] {Number} 最大长度，默认为字符串长度
 * @param [padding=" "] {String} 填充字符串
 * @returns {String}
 */
var padRight = 

/**
 * 表格
 * @param trs
 * @param options
 * @returns {string}
 */
console.table = function (trs, options) {
    options = object.assign({
        padding: 1,
        thead: false,
        border: false,
        styles: []
    }, options);
    var maxTrLength = 0;
    var maxTdsLength = [];
    var ret = [];
    var padding = new Array(options.padding + 1).join(' ');

    collection.each(trs, function (i, tds) {
        collection.each(tds, function (j, td) {
            tds[j] = td = format(td);
            var tdLength = td.length
            tdLength += options.padding * 2;
            maxTdsLength[j] = maxTdsLength[j] || 0;
            maxTdsLength[j] = Math.max(maxTdsLength[j], tdLength);
        });
    });

    var trTopCenters = [];
    var trMiddleCenters = [];
    var trBottomCenters = [];
    collection.each(maxTdsLength, function (k, max) {
        maxTrLength += max;
        var border = new Array(max + 1).join('─');

        if (k) {
            trTopCenters.push('┬' + border);
            trMiddleCenters.push('┼' + border);
            trBottomCenters.push('┴' + border);
        } else {
            trTopCenters.push(border);
            trMiddleCenters.push(border);
            trBottomCenters.push(border);
        }
    });

    maxTrLength += maxTdsLength.length - 2;
    ret.push('┌' + trTopCenters.join('') + '┐');

    collection.each(trs, function (i, tds) {
        var tr = [];

        if (options.border && i > 0) {
            ret.push('├' + trMiddleCenters.join('') + '┤');
        }

        collection.each(tds, function (j, td) {
            td = padding + td;
            td = string.padEnd(td, maxTdsLength[j] - options.padding, ' ');
            tr.push(td + padding);
        });

        ret.push('│' + tr.join('│') + '│');

        if (options.thead && !options.border && i === 0) {
            ret.push('├' + trMiddleCenters.join('') + '┤');
        }
    });

    ret.push('└' + trBottomCenters.join('') + '┘');

    var out = ret.join('\n');

    printOut(console.pretty(out, options.colors));
};


/**
 * 打点
 * @param str
 */
console.point = function (str) {
    str = String(str) || '.';
    try {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
    } catch (err) {
        // ignore
    }
    process.stdout.write(str);
};
console.pointEnd = function () {
    try {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
    } catch (err) {
        // ignore
    }
};


var lineCursor = 0;
console.lineStart = function () {
    lineCursor = 0;
};
/**
 * 打线
 * @param str
 */
console.line = function (str) {
    str = String(str) || '=';
    try {
        process.stdout.cursorTo(lineCursor);
    } catch (err) {
        // ignore
    }
    process.stdout.write(str);
    lineCursor += str.length;
};
console.lineEnd = function (clear) {
    lineCursor = 0;

    if (clear) {
        global.console.pointEnd();
    } else {
        process.stdout.write('\n');
    }
};

var dictionaries = ['-', '\\', '|', '/', '-', '\\', '|', '/'];
var timer = 0;
console.loading = function (interval, _dictionaries) {
    if (timer) {
        global.console.loadingEnd();
    }

    var args = access.args(arguments);
    var times = 0;

    if (args.length === 1 && typeis.Array(args[0])) {
        _dictionaries = args[0];
        interval = null;
    }

    interval = interval || 80;
    _dictionaries = _dictionaries || dictionaries;
    var length = _dictionaries.length - 1;
    timer = setInterval(function () {
        var index = times % length;
        global.console.point(_dictionaries[index]);
        times++;
    }, interval);
};
console.loadingEnd = function () {
    clearInterval(timer);
    timer = 0;
    global.console.pointEnd();
};


module.exports = console;
