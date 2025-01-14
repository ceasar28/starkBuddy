[@ai16z/eliza v0.1.4-alpha.3](../index.md) / Memory

# Interface: Memory

Represents a stored memory/message

## Properties

### id?

> `optional` **id**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Optional unique identifier

#### Defined in

packages/core/src/types.ts:325

***

### userId

> **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Associated user ID

#### Defined in

packages/core/src/types.ts:328

***

### agentId

> **agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Associated agent ID

#### Defined in

packages/core/src/types.ts:331

***

### createdAt?

> `optional` **createdAt**: `number`

Optional creation timestamp

#### Defined in

packages/core/src/types.ts:334

***

### content

> **content**: [`Content`](Content.md)

Memory content

#### Defined in

packages/core/src/types.ts:337

***

### embedding?

> `optional` **embedding**: `number`[]

Optional embedding vector

#### Defined in

packages/core/src/types.ts:340

***

### roomId

> **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Associated room ID

#### Defined in

packages/core/src/types.ts:343

***

### unique?

> `optional` **unique**: `boolean`

Whether memory is unique

#### Defined in

packages/core/src/types.ts:346

***

### similarity?

> `optional` **similarity**: `number`

Embedding similarity score

#### Defined in

packages/core/src/types.ts:349
