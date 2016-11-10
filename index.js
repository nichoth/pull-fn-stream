var S = require('pull-stream')
// var Pushable = require('pull-pushable')
var cat = require('pull-cat')
// var paramap = require('pull-paramap')
var many = require('pull-many')

var api = {
    get: (arg, cb) => setTimeout(() => cb(null, arg), 100),
    update: async
}

function async (arg, cb) {
    process.nextTick(() => cb(null, arg))
}

// function request (fn) {
//     var p = Pushable()
//     p.push('start')
//     fn((err, resp) => {
//         if (err) return p.end(err)
//         p.push(resp)
//         p.end()
//     })
//     return p
// }

function flatMerge () {
    return function sink (source) {
        var m = many()
        S(source, S.drain(function onEvent (s) {
            m.add(s)
        }, function onEnd (err) {
        }))
        return m
    }
}

S(
    S.values(['get', 'update']),
    S.map(ev => api[ev].bind(null, ev)),
    S.map(fn => {
        return cat([
            S.once('start'),
            S(S.once(''), S.asyncMap((ev, cb) => fn(cb)))
        ])
    }),
    flatMerge(),
    S.log()
)




// S(
//     S.values([api.get.bind(null, 'get'), api.update.bind(null, 'update')]),
//     S.map(function (fn) {
//         return S(
//             S.values(['start', fn]),
//             paramap(function (ev, cb) {
//                 if (typeof ev === 'string') return cb(null, ev)
//                 fn(cb)
//             })
//         )
//     }),
//     S.flatten(),
//     S.log()
// )


// take stream of streams, return stream of contents
// function asap () {
//     return function sink (read) {
//         return function source (abort, cb) {
//             read(abort, function onNext (end, data) {
//                 if (end) return
//             })
//         }
//     }
// }

// S(
//     S.values([api.get.bind(null, 'get'), api.update.bind(null, 'update')]),
//     S.map(request),
//     S.flatten(),
//     S.log()
// )

// S(
//     S.values(['get', 'update']),
//     paramap((ev, cb) => {
//         api[ev](ev, cb)
//     }, null, false),
//     S.log()
// )

// S(
//     S.values(['get', 'update']),

//     paramap((ev, cb) => {
//         var s = cat([
//             S.values([{ type: 'start' }]),
//             S(S.values([ev]), S.asyncMap((ev, cb) => api[ev](ev, cb)))
//         ])
//         cb(null, s)
//         // api[ev](ev, cb)
//     }, null, false),

//     S.flatten(),
//     S.log()
// )

// S(S.values(['get', 'update']),
//     S.map((ev) => {
//         return cat([S.values([{ type: 'start' }]),
//             S(
//                 S.values([ev]),
//                 S.asyncMap((ev, cb) => {
//                     api[ev](ev, cb)
//                 })
//             )]
//         )
//     }),
//     S.flatten(),
// S.log())

// function fromCb (fn, selector) {
//     var p = Pushable()
//     p.push({ type: 'asyncStart' })
//     fn(function onResp (err, data) {
//         if (err) return p.end(err)
//         p.push(selector ? selector(data) : data)
//         p.end()
//     })
//     return p
// }
