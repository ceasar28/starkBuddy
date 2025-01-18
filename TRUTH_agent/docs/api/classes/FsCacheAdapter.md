[@ai16z/eliza v0.1.4-alpha.3](../index.md) / FsCacheAdapter

# Class: FsCacheAdapter

## Implements

- [`ICacheAdapter`](../interfaces/ICacheAdapter.md)

## Constructors

### new FsCacheAdapter()

> **new FsCacheAdapter**(`dataDir`): [`FsCacheAdapter`](FsCacheAdapter.md)

#### Parameters

• **dataDir**: `string`

#### Returns

[`FsCacheAdapter`](FsCacheAdapter.md)

#### Defined in

packages/core/src/cache.ts:37

## Methods

### get()

> **get**(`key`): `Promise`\<`string`\>

#### Parameters

• **key**: `string`

#### Returns

`Promise`\<`string`\>

#### Implementation of

[`ICacheAdapter`](../interfaces/ICacheAdapter.md).[`get`](../interfaces/ICacheAdapter.md#get)

#### Defined in

packages/core/src/cache.ts:39

***

### set()

> **set**(`key`, `value`): `Promise`\<`void`\>

#### Parameters

• **key**: `string`

• **value**: `string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ICacheAdapter`](../interfaces/ICacheAdapter.md).[`set`](../interfaces/ICacheAdapter.md#set)

#### Defined in

packages/core/src/cache.ts:48

***

### delete()

> **delete**(`key`): `Promise`\<`void`\>

#### Parameters

• **key**: `string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ICacheAdapter`](../interfaces/ICacheAdapter.md).[`delete`](../interfaces/ICacheAdapter.md#delete)

#### Defined in

packages/core/src/cache.ts:59
