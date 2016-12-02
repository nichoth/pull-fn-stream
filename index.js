var S = require('pull-stream/pull')
S.map = require('pull-stream/throughs/map')
S.once = require('pull-stream/sources/once')
S.asyncMap = require('pull-stream/throughs/async-map')
var cat = require('pull-cat')
var flatMerge = require('pull-flat-merge')

function toStream (fn, key) {
    return S(
        S.map(function (args) {
            var _args = [].concat(args)
            var startEv = { type: 'start', op: key, args: _args }
            return startEv
        }),

        S.map(function (startEv) {
            var requestStream = cat([
                S.once({
                    type: 'start',
                    op: startEv.op
                }),
                S(
                    S.once(startEv),
                    S.asyncMap(function (ev, cb) {
                        fn.apply(null, ev.args.concat(
                            function onResp (err, resp) {
                                if (err) return cb(err)
                                cb(null, {
                                    type: ev.op,
                                    resp: resp
                                })
                            })
                        )
                    })
                )
            ])
            return requestStream
        })
    )
}

// args in the stream should include the key of the function
toStream.fromObject = function (fnMap) {
    var ss = Object.keys(fnMap).reduce(function (acc, k) {
        acc[k] = toStream(fnMap[k], k)
        return acc
    }, {})

    return S.map(function (args) {
        var _args = [].concat(args)
        var key = _args[0]
        return S(
            S(S.once(_args.slice(1)), ss[key]),
            flatMerge()
        )
    })
}

module.exports = toStream

// // take a map from names to fns
// // return a transform stream mapping keys to streams,
// // where each stream emits
// //  { type: 'start', op: key }
// //  { type: key, resp: apiResponse }
// module.exports = function (fnMap) {
//     return S(
//         S.map(function (args) {
//             var _args = [].concat(args)
//             var key = _args[0]
//             var startEv = { type: 'start', op: key, args: _args.slice(1) }
//             return startEv
//         }),

//         S.map(function (startEv) {
//             var requestStream = cat([
//                 S.once({
//                     type: 'start',
//                     op: startEv.op
//                 }),
//                 S(
//                     S.once(startEv),
//                     S.asyncMap(function (ev, cb) {
//                         fnMap[ev.op].apply(null, ev.args.concat(
//                             function (err, resp) {
//                                 if (err) return cb(err)
//                                 cb(null, {
//                                     type: ev.op,
//                                     resp: resp
//                                 })
//                             })
//                         )
//                     })
//                 )
//             ])
//             return requestStream
//         })
//     )
// }
