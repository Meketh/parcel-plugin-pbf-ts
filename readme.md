# parcel-plugin-pbf-ts

[Protocol Buffers](https://developers.google.com/protocol-buffers/) support in [Parcel](https://parceljs.org/) via [Pbf](https://npmjs.com/package/pbf) with [Typescript](https://www.typescriptlang.org/)

Inspired by [parcel-plugin-pbf](https://github.com/jabher/parcel-plugin-pbf) with some diferencies

- Declares missing types
- Generates types for your `.proto` on bundle
- Imports `.protos` as a string and compile them in runtime
- Adds extra functionality to the proto `factories`
- Lets you extend your `messages` to add custom `methods` or `constructor`

## How to install

```shell
yarn add parcel-plugin-pbf-ts
# or
npm install parcel-plugin-pbf-ts
```

Parcel will detect `parcel-plugin-pbf-ts` and bundle your `.proto` files.

## How to use

You can `import` the `.proto` files from different `.ts` files but you need to compile them somewhere.

You can have multiple `roots` but the bundler will define everything under the namespace `Proto.Root`, be aware of that.

### Example:

```
project/
|-protos/
  |-Some.proto
  |-Other.proto
  |-Moar.proto
  |-index.ts <-- Root
  |-index.d.ts <-- extension definitions
```

#### project/protos/index.ts

```ts
/// <reference path='./index.d.ts' />
import { makeRoot, extend } from "parcel-plugin-pbf-ts/utils";
import Some from "./Some.proto";
import Other from "./Other.proto";

const root = makeRoot(Some, Other);
root.Some.constructor = (o) => (o.magicNumber = 42);
extend(root.Some, {
  print() {
    console.log({ text: this.text });
    return this.text;
  },
});

export = root;
```

#### project/protos/index.d.ts

```ts
namespace Proto.Root {
  interface Some {
    magicNumber: number;
    print(): string;
  }
}
```

#### project/protos/Some.proto

```protobuf
syntax = "proto3";

message Some {
  string text = 1;
}
```

## API

Types are under `@types/` folder in the module.

The compiled objects from `makeRoot` are a little different from the ones in `Pbf`. In fact they are `factory` functions.

Thanks to that you can do the following:

```ts
import { ok, strictEqual, deepStrictEqual } from "assert";
import Protos from "./protos";
const { Some } = Protos;

const text = Math.random().toString(16).slice(2);
const some = new Some({ text });
ok(some instanceof Some);
strictEqual(some.magicNumber, 42);
strictEqual(some.print(), text); // logs text

const bin = some.encode();
ok(bin instanceof Uint8Array);
deepStrictEqual(bin, Some.encode(some));
deepStrictEqual(some, Some.decode(bin));
deepStrictEqual(some, Some(bin));
```

Internally `encode` reuses the same `Pbf` instance for better performance.
