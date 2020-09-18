module.exports = bundler => ([
  ['proto', './ProtoAsset'],
].forEach(a => bundler.addAssetType(a[0], require.resolve(a[1]))),[
  ['proto', './ProtoPackager'],
].forEach(a => bundler.addPackager(a[0], require.resolve(a[1]))))
