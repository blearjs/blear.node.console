/**
 * mocha 测试 文件
 * @author ydr.me
 * @create 2016-05-17 12:13
 */


'use strict';

var expect = require('chai').expect;
var console = require('../src/index.js');
var object = require('blear.utils.object');
var howdo = require('blear.utils.howdo');

describe('测试文件', function () {
    it('color', function () {
        object.each(console.colors, function (color) {
            console.log(console.colors[color](color));
        });
    });


    it('out colorful:true', function () {
        console.config({
            colorful: true
        });
        console.log('--------------------');
        console.log();
        console.log();
        console.log('--------------------');
        console.log('log 日志', {a: 1}, new Error('b'));
        console.info('info 日志', {a: 1}, new Error('b'));
        console.warn('warn 日志', {a: 1}, new Error('b'));
        console.error('error 日志', {a: 1}, new Error('b'));
        var err = new Error('xxx');
        err.xx = 123;
        console.error(err);
        console.table([
            ['#', 'dqwd', 'dqw'],
            ['1', 'dqw', '99'],
            ['2', 'dqwdqwdqwdqw', '919'],
            ['3', 'english', '91119']
        ], {
            colors: ['red', 'bold', 'inverse']
        });
    });


    it('out colorful:false, level: []', function () {
        console.config({
            colorful: false,
            level: []
        });
        expect(console.config('colorful')).to.equal(false);
        console.log('--------------------');
        console.log();
        console.log();
        console.log('--------------------');
        console.log('log 日志', {a: 1}, new Error('b'));
        console.info('info 日志', {a: 1}, new Error('b'));
        console.warn('warn 日志', {a: 1}, new Error('b'));
        console.error('error 日志', {a: 1}, new Error('b'));
        var err = new Error('xxx');
        err.xx = 123;
        console.error(err);
        console.table([
            ['#', 'dqwd', 'dqw'],
            ['1', 'dqw', '99'],
            ['2', 'dqwdqwdqwdqw', '919'],
            ['3', 'english', '91119']
        ], {
            colors: ['red', 'bold', 'inverse'],
            border: false,
            thead: false
        });
        console.table([
            ['#', 'dqwd', 'dqw'],
            ['1', 'dqw', '99'],
            ['2', 'dqwdqwdqwdqw', '919'],
            ['3', 'english', '91119']
        ], {
            colors: ['red', 'bold', 'inverse'],
            border: false,
            thead: true
        });
        console.table([
            ['#', 'dqwd', 'dqw'],
            ['1', 'dqw', '99'],
            ['2', 'dqwdqwdqwdqw', '919'],
            ['3', 'english', '91119']
        ], {
            colors: ['red', 'bold', 'inverse'],
            border: true,
            thead: true
        });
        console.table([
            ['#', 'dqwd', 'dqw'],
            ['1', 'dqw', '99'],
            ['2', 'dqwdqwdqwdqw', '919'],
            ['3', 'english', '91119']
        ], {
            colors: ['red', 'bold', 'inverse'],
            border: true,
            thead: false
        });
    });


    it('串行', function (done) {
        howdo
            .task(function (done) {
                var points = ['-', '=', '>', '|', '<', '='];
                var times = 0;
                var time = setInterval(function () {
                    var index = times % (points.length - 1);
                    console.point(points[index]);

                    if (times === 30) {
                        clearInterval(time);
                        console.pointEnd();
                        done();
                    }

                    times++;
                }, 100);
            })
            .task(function (done) {
                console.loading();
                console.loading();
                setTimeout(function () {
                    console.loadingEnd();
                    done();
                }, 5000);
            })
            .task(function (done) {
                console.loading(['.', '..', '...', '..']);
                setTimeout(function () {
                    console.loadingEnd();
                    done();
                }, 5000);
            })
            .task(function (done) {
                var times = 0;
                console.lineStart();
                var timer = setInterval(function () {
                    console.line('=');
                    times++;

                    if (times === 20) {
                        console.lineEnd(true);
                        clearInterval(timer);
                        done();
                    }
                }, 100);
            })
            .task(function (done) {
                var times = 0;
                console.lineStart();
                var timer = setInterval(function () {
                    console.line('=');
                    times++;

                    if (times === 20) {
                        console.lineEnd();
                        clearInterval(timer);
                        done();
                    }
                }, 100);
            })
            .follow(done);
    });
});

