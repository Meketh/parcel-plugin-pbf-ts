const {Packager} = require('parcel')
const {resolve} = require('path')
const ProtoAsset = require('./ProtoAsset')
const {declareRoot} = require('./DtsBuilder')

module.exports = class ProtoPackager extends Packager {
  constructor(bundle, bundler) {
    super(bundle, bundler)
    bundle.name = resolve(__dirname, 'root.d.ts')
  }
  addAsset() {}
  async end() {
    const assetMap = this.bundler.loadedAssets
    const roots = [...this.bundle.assets].filter(
      a => ![...a.parentDeps].every(
        p => assetMap.get(p.parent) instanceof ProtoAsset
      )
    )
    if (!roots.length) return
    const namespace = roots
    .map(p => p.getSchema(assetMap))
    .reduce((r, s) => {
      for (const e of s.enums) r.enums.set(e.name, e)
      for (const m of s.messages) r.messages.set(m.name, m)
      return r
    }, {enums: new Map(), messages: new Map()})
    return this.dest.end(declareRoot({
      name: 'Root',
      enums: [...namespace.enums.values()],
      messages: [...namespace.messages.values()],
    }))
  }
}
