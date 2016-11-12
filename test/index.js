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

test('flat merge', function (t) {
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
