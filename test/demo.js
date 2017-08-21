/**
 * 文件描述
 * @author ydr.me
 * @create 2017-08-21 10:46
 * @update 2017-08-21 10:46
 */


'use strict';

var console = require('../src/index');


// console.log('console', 'log');
// console.info('console', 'info');
// console.warn('console', 'warn');
// console.error('console', 'error');
// console.logWithTime('console', 'log', 'withTime');
// console.infoWithTime('console', 'info', 'withTime');
// console.warnWithTime('console', 'warn', 'withTime');
// console.errorWithTime('console', 'error', 'withTime');

var points = ['-', '=', '>', '|', '<', '='];
var times = 0;
var time = setInterval(function () {
    var index = times % (points.length - 1);
    console.point(points[index]);

    if (times === 30) {
        clearInterval(time);
        console.pointEnd();
    }

    times++;
}, 300);
