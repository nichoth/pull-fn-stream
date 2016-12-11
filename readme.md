# pull fn stream

Model an async function call with a pull stream. This is a transform stream that takes arrays and emits streams. Each returned stream emits a start event and a response event.

## install
    
    $ npm install pull-fn-stream

## example

```js
var S = require('pull-stream')
var flatMerge = require('pull-flat-merge')
var test = require('tape')
var toStream = require('../')

var fns = {
    a: function (cb) {
        setTimeout(function () {
            cb(null, 'a')
        }, 50)
    },
    b: function (cb) {
        setTimeout(function () {
            cb(null, 'b')
        }, 100)
    },
    error: function (cb) {
        setTimeout(function () {
            cb(new Error('test error'))
        }, 0)
    }
}

function asyncOk (arg, cb) {
    process.nextTick(function () {
        cb(null, arg)
    })
}

function asyncErr (msg, cb) {
    process.nextTick(function () {
        cb(new Error(msg))
    })
}

test('call async function', function (t) {
    t.plan(2)
    var stream = toStream(asyncOk, 'key')
    var expected = [
        { type: 'start', op: 'key' },
        { type: 'start', op: 'key' },
        { type: 'key', resp: 'arg' },
        { type: 'key', resp: 'arg2' }
    ]
    S(
        S.values(['arg', 'arg2']),
        stream(),
        flatMerge(),
        S.collect(function (err, res) {
            t.error(err, 'error')
            t.deepEqual(res, expected, 'should emit events')
        })
    )
})

test('async error', function (t) {
    t.plan(1)
    var stream = toStream(asyncErr, 'key')
    S(
        S.once('test msg'),
        stream(),
        flatMerge(),
        S.collect(function (err, res) {
            t.equal(err.message, 'test msg', 'should end with error')
        })
    )
})

test('from object', function (t) {
    t.plan(2)
    var expected = [
        { type: 'start', op: 'b' },
        { type: 'start', op: 'a' },
        { type: 'start', op: 'b' },
        { type: 'a', resp: 'a' },
        { type: 'b', resp: 'b' },
        { type: 'b', resp: 'b' }
    ]
    S(
        S.values(['b', 'a', 'b']),
        toStream.fromObject(fns)(),
        flatMerge(),
        S.collect(function (err, evs) {
            t.error(err, 'error')
            t.deepEqual(evs, expected, 'should emit events in order')
        })
    )
})

test('pass arguments', function (t) {
    var fns = {
        a: function (a,b,c,cb) {
            setTimeout(function () {
                cb(null, [a,b,c])
            }, 50)
        },
        b: function (d,cb) {
            setTimeout(function () {
                cb(null, d)
            }, 100)
        }
    }

    var expected = [
        { type: 'start', op: 'b' },
        { type: 'start', op: 'a' },
        { type: 'a', resp: [1,2,3] },
        { type: 'b', resp: 4 }
    ]

    t.plan(1)
    S(
        S.values([ ['b',4], ['a',1,2,3] ]),
        toStream.fromObject(fns)(),
        flatMerge(),
        S.collect(function (err, evs) {
            t.deepEqual(evs, expected, 'should pass args in array')
        })
    )
})

test('error from object', function (t) {
    t.plan(1)
    S(
        S.values(['error']),
        toStream.fromObject(fns)(),
        flatMerge(),
        S.collect(function (err, res) {
            t.equal(err.message, 'test error', 'should pass error in stream')
        })
    )
})
```
