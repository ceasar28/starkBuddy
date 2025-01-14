[@ai16z/eliza v0.1.4-alpha.3](../index.md) / State

# Interface: State

Represents the current state/context of a conversation

## Indexable

 \[`key`: `string`\]: `unknown`

## Properties

### userId?

> `optional` **userId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

ID of user who sent current message

#### Defined in

packages/core/src/types.ts:240

***

### agentId?

> `optional` **agentId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

ID of agent in conversation

#### Defined in

packages/core/src/types.ts:243

***

### bio

> **bio**: `string`

Agent's biography

#### Defined in

packages/core/src/types.ts:246

***

### lore

> **lore**: `string`

Agent's background lore

#### Defined in

packages/core/src/types.ts:249

***

### messageDirections

> **messageDirections**: `string`

Message handling directions

#### Defined in

packages/core/src/types.ts:252

***

### postDirections

> **postDirections**: `string`

Post handling directions

#### Defined in

packages/core/src/types.ts:255

***

### roomId

> **roomId**: \`$\{string\}-$\{string\}-$\{string\}-$\{string\}-$\{string\}\`

Current room/conversation ID

#### Defined in

packages/core/src/types.ts:258

***

### agentName?

> `optional` **agentName**: `string`

Optional agent name

#### Defined in

packages/core/src/types.ts:261

***

### senderName?

> `optional` **senderName**: `string`

Optional message sender name

#### Defined in

packages/core/src/types.ts:264

***

### actors

> **actors**: `string`

String representation of conversation actors

#### Defined in

packages/core/src/types.ts:267

***

### actorsData?

> `optional` **actorsData**: [`Actor`](Actor.md)[]

Optional array of actor objects

#### Defined in

packages/core/src/types.ts:270

***

### goals?

> `optional` **goals**: `string`

Optional string representation of goals

#### Defined in

packages/core/src/types.ts:273

***

### goalsData?

> `optional` **goalsData**: [`Goal`](Goal.md)[]

Optional array of goal objects

#### Defined in

packages/core/src/types.ts:276

***

### recentMessages

> **recentMessages**: `string`

Recent message history as string

#### Defined in

packages/core/src/types.ts:279

***

### recentMessagesData

> **recentMessagesData**: [`Memory`](Memory.md)[]

Recent message objects

#### Defined in

packages/core/src/types.ts:282

***

### actionNames?

> `optional` **actionNames**: `string`

Optional valid action names

#### Defined in

packages/core/src/types.ts:285

***

### actions?

> `optional` **actions**: `string`

Optional action descriptions

#### Defined in

packages/core/src/types.ts:288

***

### actionsData?

> `optional` **actionsData**: [`Action`](Action.md)[]

Optional action objects

#### Defined in

packages/core/src/types.ts:291

***

### actionExamples?

> `optional` **actionExamples**: `string`

Optional action examples

#### Defined in

packages/core/src/types.ts:294

***

### providers?

> `optional` **providers**: `string`

Optional provider descriptions

#### Defined in

packages/core/src/types.ts:297

***

### responseData?

> `optional` **responseData**: [`Content`](Content.md)

Optional response content

#### Defined in

packages/core/src/types.ts:300

***

### recentInteractionsData?

> `optional` **recentInteractionsData**: [`Memory`](Memory.md)[]

Optional recent interaction objects

#### Defined in

packages/core/src/types.ts:303

***

### recentInteractions?

> `optional` **recentInteractions**: `string`

Optional recent interactions string

#### Defined in

packages/core/src/types.ts:306

***

### formattedConversation?

> `optional` **formattedConversation**: `string`

Optional formatted conversation

#### Defined in

packages/core/src/types.ts:309

***

### knowledge?

> `optional` **knowledge**: `string`

Optional formatted knowledge

#### Defined in

packages/core/src/types.ts:312

***

### knowledgeData?

> `optional` **knowledgeData**: [`KnowledgeItem`](../type-aliases/KnowledgeItem.md)[]

Optional knowledge data

#### Defined in

packages/core/src/types.ts:314
