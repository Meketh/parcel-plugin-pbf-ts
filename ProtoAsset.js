const {Asset} = require('parcel')
const {parse} = require('protocol-buffers-schema')

module.exports = class ProtoAsset extends Asset {
  collectDependencies() {
    const imports = this.contents.match(/(?<=import[^"]*")(?=[^"]*")[^"]*/g) || []
    for (const dependency of imports)
      this.addDependency(dependency)
  }
  generate () {
    const dependencies = [...this.dependencies.keys()]
    .map(d => `require("${d}")+`).join('')
    const proto = this.contents
    .replace(/\s+/g, ' ')
    .replace(/ ?([;:=()<>{}[\]]) ?/g, '$1')
    .replace(/(?:syntax|import)[^;]*;/g, '')
    return {proto, js:`module.exports=${dependencies}${JSON.stringify(proto)}`}
  }
  getSchema(assetMap) {
    const getProto = protoAsset =>
      [...protoAsset.dependencies.values()]
      .map(d => d.resolved ? getProto(assetMap.get(d.resolved)) : '')
      .join('') + protoAsset.generated.proto
    return parse(`syntax="proto3";${getProto(this)}`)
  }
}
