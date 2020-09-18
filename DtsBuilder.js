const dts = module.exports = {
  declareRoot(root) {
    const props = dts.declareProps('  ', root)
    const namespace = dts.declareNamespace('  ', root)
    return `namespace Proto {\n  interface ${root.name} {${props}}\n${namespace}}`
  },
  declareList(indent, list, declareFn, sep = '') {
    return list.map(e => declareFn('  ' + indent, e)).join(sep)
  },
  declareProps(indent, type) {
    if (!(type.enums.length || type.messages.length)) return ''
    type.path = type.path || `${type.name}.`
    const enums = dts.declareList(indent, type.enums,
      (i, e) => `${i}${e.name}: ${type.path}${e.name}\n`
    )
    const messages = dts.declareList(indent, type.messages, (indent, message) => {
      const path = type.path + message.name
      message.path = `${path}.`
      const props = dts.declareProps(indent, message)
      const propsType = props && ` & {${props}}`
      return `${indent}${message.name}: Proto.Factory<${path}Object, ${path}>${propsType}\n`
    })
    return `\n${enums}${messages}${indent}`
  },
  declareNamespace(indent, namespace) {
    if (!(namespace.enums.length || namespace.messages.length)) return ''
    const enums = dts.declareList(indent, namespace.enums, dts.declareEnum)
    const messages = dts.declareList(indent, namespace.messages, dts.declareMessage)
    return `${indent}namespace ${namespace.name} {\n${enums}${messages}${indent}}\n`
  },
  declareEnum(indent, _enum) {
    const values = dts.declareList(indent, Object.entries(_enum.values),
      (_, [name, {value}]) => `${name} = ${value}`, ', ')
    return `${indent}enum ${_enum.name} { ${values} }\n`
  },
  declareMessage(indent, message) {
    const {name} = message
    dts.setTypesAndOneofs(message)
    const oneofs = dts.declareList(indent, message.oneofs, dts.declareOneof, '\n')
    const fields = dts.declareList(indent, message.fields, dts.declareField, '\n')
    const oneofsName = oneofs && `, ${name}Oneofs`
    const oneofsInterface = oneofs && `interface ${name}Oneofs {\n${oneofs}\n${indent}}\n${indent}`
    return `${
    indent}interface ${name} extends Proto.Message${oneofsName}, ${name}Object {}\n${
    indent}${oneofsInterface}interface ${name}Object {\n${fields}\n${
    indent}}\n${dts.declareNamespace(indent, message)}`
  },
  setTypesAndOneofs(message) {
    const oneofsMap = new Map()
    for (const field of message.fields) {
      if (field.oneof) {
        const oneofFields = oneofsMap.get(field.oneof) || []
        oneofFields.push(field.name)
        oneofsMap.set(field.oneof, oneofFields)
      }
      field.type = dts.declareFieldType(message, field.type, field.map)
    }
    message.oneofs = [...oneofsMap.entries()]
  },
  declareFieldType(msg, type, map) {
    const scalar = dts.ScalarTypes[type]
    if (scalar) return type = scalar
    if (type === 'map')
      return `{ [key: ${dts.declareFieldType(msg, map.from)}]: ${dts.declareFieldType(msg, map.to)} }`
    if (msg.enums.some(e => e.name === type)
    || msg.messages.some(m => m.name === type)
    ) return `${msg.name}.${type}`
    return type
  },
  declareOneof(indent, [name, fields]) {
    return `${indent}${name}: \'${fields.join('\' | \'')}\'`
  },
  declareField(indent, field) {
    return `${indent}${field.name}${
      field.required ? '' : '?'
    }: ${field.type}${
      field.repeated ? '[]' : ''
    }`
  },
  ScalarTypes: {
    bytes: 'Uint8Array',
    string: 'string',
    bool: 'boolean',
    float: 'number',
    double: 'number',
    int32: 'number',
    uint32: 'number',
    sint32: 'number',
    fixed32: 'number',
    sfixed32: 'number',
    int64: 'number',
    uint64: 'number',
    sint64: 'number',
    fixed64: 'number',
    sfixed64: 'number',
  },
}
