[@ai16z/eliza v0.1.4-alpha.3](../index.md) / Action

# Interface: Action

Represents an action the agent can perform

## Properties

### similes

> **similes**: `string`[]

Similar action descriptions

#### Defined in

packages/core/src/types.ts:396

***

### description

> **description**: `string`

Detailed description

#### Defined in

packages/core/src/types.ts:399

***

### examples

> **examples**: [`ActionExample`](ActionExample.md)[][]

Example usages

#### Defined in

packages/core/src/types.ts:402

***

### handler

> **handler**: [`Handler`](../type-aliases/Handler.md)

Handler function

#### Defined in

packages/core/src/types.ts:405

***

### name

> **name**: `string`

Action name

#### Defined in

packages/core/src/types.ts:408

***

### validate

> **validate**: [`Validator`](../type-aliases/Validator.md)

Validation function

#### Defined in

packages/core/src/types.ts:411
