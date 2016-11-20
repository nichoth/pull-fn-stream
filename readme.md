# pull fn stream

Model an async function call with a pull stream. This is a transform stream that takes arrays and emits streams. Each returned stream emits a start event and a response event.

## install
    
    $ npm install pull-fn-stream

## example

```js
var S = require('pull-stream')
var flatMerge = require('pull-flat-merge')
var test = require('tape')
var toStreams = require('../')

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
    }
}

test('call async functions', function (t) {
    t.plan(1)
    var expected = [
        { type: 'start', op: 'b' },
        { type: 'start', op: 'a' },
        { type: 'a', resp: 'a' },
        { type: 'b', resp: 'b' }
    ]

    S(
        S.values(['b', 'a']),
        toStreams(fns),
        flatMerge(),
        S.collect(function (err, evs) {
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
        toStreams(fns),
        flatMerge(),
        S.collect(function (err, evs) {
            t.deepEqual(evs, expected, 'should pass args in array')
        })
    )
})
```
