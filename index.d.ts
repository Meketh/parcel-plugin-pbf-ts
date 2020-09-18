/// <reference types='./root' />
declare module '*.proto' {
  const content: string
  export default content
}
declare module 'pbf/compile' {
  type Schema = import('@types/protocol-buffers-schema/types').Schema
  const compile: {raw: (schema: Schema) => string} & ((schema: Schema) => Proto.Root)
  export default compile
}
declare module 'parcel-plugin-pbf-ts/utils' {
  export function makeRoot(...protos: string[]): Proto.Root
  export function extend<O, M extends Proto.Message>(f: Proto.Factory<O, M>, ...e: ThisType<M>[]): Proto.Factory<O, M>
}
declare namespace Proto {
  type Message = {encode(): Uint8Array}
  type Factory<Obj, Msg> = ((obj?: Obj | Uint8Array) => Msg) & {
    new(obj?: Obj | Uint8Array): Msg
    init(this: Msg, obj: Msg)
    read(pbf: Pbf, end?: number): Msg
    write(obj: Obj, pbf: Pbf): void
    decode(buf: Uint8Array): Msg
    encode(obj: Obj): Uint8Array
  }
}
