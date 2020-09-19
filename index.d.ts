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
}
declare namespace Proto {
  type Oneof<Obj> = Record<string, keyof Obj>
  type Message<Obj, Oof extends Oneof<Obj>> = Obj & Oof & {
    encode(): Uint8Array
    whichOneof:<
      K extends keyof Oof,
      N extends Oof[K] = Oof[K],
      V extends Obj[N] = Obj[N]
    >(oneof: K) => NonNullable<V>
  }
  type Init<Obj, Oof extends Oneof<Obj> = {}>
    = Omit<Obj, Oof[keyof Oof]>
    & OnlyOneOf<Obj, Oof[keyof Oof]>
  type Factory<
    Obj, Oof extends Oneof<Obj>,
    Msg extends Message<Obj, Oof>
  > = ((obj: Init<Obj, Oof> | Uint8Array) => Msg) & {
    new(obj: Init<Obj, Oof> | Uint8Array): Msg
    init(this: Msg, obj: Msg)
    read(pbf: Pbf, end?: number): Msg
    write(obj: Init<Obj, Oof>, pbf: Pbf): void
    decode(buf: Uint8Array): Msg
    encode(obj: Init<Obj, Oof>): Uint8Array
    extend(...exs: ThisType<Msg>[]): void
  }
}
