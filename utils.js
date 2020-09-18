const Pbf = require('pbf')
const compile = require('pbf/compile')
const {parse} = require('protocol-buffers-schema')

const pbf = new Pbf()
function makeProto(proto) {
  for (const [name, prop] of Object.entries(proto)) {
    if (prop._readField) {
      // Message Prop
      const msg = Object.assign(function(o = {}) {
        if (o instanceof Uint8Array) return msg.decode(o)
        Object.setPrototypeOf(o, msg.prototype)
        const c = msg.constructor
        if (c) c.call(o, o)
        return o
      }, makeProto(prop), {
        read: (pbf, end) => msg(prop.read(pbf, end)),
        decode: bin => msg(prop.read(new Pbf(bin))),
        encode: obj => {
          prop.write(obj, pbf)
          const bin = pbf.buf.subarray(0, pbf.pos)
          pbf.pos = 0
          return bin
        },
        prototype: {
          encode() { return msg.encode(this) }
        }
      })
      Object.defineProperty(msg, 'name', {
        value: name, writable: false
      })
      proto[name] = msg
    } else if (typeof prop !== 'function') {
      // Enum Prop
      const strToInt = Object.entries(prop).map(([k, {value}]) => [k, value])
      const intToStr = strToInt.map(e => e.slice().reverse())
      proto[name] = Object.fromEntries([...intToStr, ...strToInt])
    }
  }
  return proto
}

const compileProto = p => compile(parse(`syntax="proto3";${p}`))
module.exports = {
  makeRoot: (...protos) => makeProto(Object.assign({}, ...protos.map(compileProto))),
  extend: (f, ...e) => Object.assign(f.prototype, ...e),
}
