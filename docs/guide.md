# Guide

**Table of contents**

- [Overview](#overview)
- [Setup](#setup)
- [Basics](#basics)
- [Iterating](#iterating)
- [Comparison](#comparison)
- [Importing and exporting](#importing-and-exporting)
  - [Exporting to native object](#exporting-to-native-object)
  - [Importing from native object](#importing-from-native-object)

## Overview

A [tree] [node-based][m-ary tree] implementation in [JavaScript].

[Tree]: https://en.wikipedia.org/wiki/Tree_(data_structure)
[m-ary tree]: https://en.wikipedia.org/wiki/M-ary_tree
[JavaScript]: https://developer.mozilla.org/en-US/docs/Web/JavaScript

## Setup

Set an initial structure.

``` text
╭─────╮
│  0  │
╰─────╯
   ↓
╭─────╮   ╭─────╮
│  1  │ → │  2  │
╰─────╯   ╰─────╯
             ↓
╭─────╮   ╭─────╮
│  3  │ → │  4  │
╰─────╯   ╰─────╯
```

Create and connect nodes.

``` javascript
const nodes = [
  new Node({ id: 0, content: 'zero' }),
  new Node({ id: 1, content: 'one' }),
  new Node({ id: 2, content: 'two' }),
  new Node({ id: 3, content: 'three' }),
  new Node({ id: 4, content: 'four' })
]

nodes[0].push(
  nodes[1],
  nodes[2].push(
    nodes[3],
    nodes[4]
  )
)

const node = nodes[0]
```

## Basics

Some actions.

``` javascript
nodes[4].root() // Node(id: 0)
```

``` javascript
nodes[0].leaves() // [Node(id: 1), Node(id: 3), Node(id: 4)]
```

``` javascript
nodes[1].siblings() // [Node(id: 2)]
```

``` javascript
nodes[1].index() // 0
```

``` javascript
nodes[1].next() // Node(id: 2)
```

``` javascript
nodes[4].lineage() // [Node(id: 4), Node(id: 2), Node(id: 0)]
```

``` javascript
nodes[4].depth() // 2
```

``` javascript
nodes[0].height() // 2
```

``` javascript
nodes[1].breadth() // 2
```

## Iterating

``` javascript
Array.from(node) // [Node(id: 0), Node(id: 1), Node(id: 2), Node(id: 3), Node(id: 4)]
```

See [Iterators and generators] for more details.

[Iterators and generators]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators

## Comparison

``` javascript
Array.from(node).sort(Node.compare())
// ⇒ [
//   Node(id: 4, content: "four"),
//   Node(id: 1, content: "one"),
//   Node(id: 3, content: "three"),
//   Node(id: 2, content: "two"),
//   Node(id: 0, content: "zero")
// ]
```

Using a custom `compareFunction` and `mapNode` function:

``` javascript
const compareFunction = (value, otherValue) => {
  return value > otherValue ? -1 : 1
}

const mapNode = (node) => {
  return node.content
}

Array.from(node).sort(Node.compare(compareFunction, mapNode))
// ⇒ [
//   Node(id: 0, content: "zero"),
//   Node(id: 2, content: "two"),
//   Node(id: 3, content: "three"),
//   Node(id: 1, content: "one"),
//   Node(id: 4, content: "four")
// ]
```

See [Comparison operators] for more details.

[Comparison operators]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Comparison_Operators

## Importing and exporting

###### Node representation

``` javascript
{
  id,
  content,
  nodes
}
```

Each node has an *ID*, a *content* and a list of *nodes*.

[`Object`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object

### Exporting to native object

Converts `Node` to [`Object`].
Builds an [`Object`] from a tree representation.

``` javascript
const object = node.encode()
```

**Output**:

``` javascript
{
  id: 0,
  content: "zero",
  nodes: [
    {
      id: 1,
      content: "one",
      nodes: []
    },
    {
      id: 2,
      content: "two",
      nodes: [
        {
          id: 3,
          content: "three",
          nodes: []
        },
        {
          id: 4,
          content: "four",
          nodes: []
        }
      ]
    }
  ]
}
```

The method has an optional constructor parameter to build an [`Object`] with a different pattern than the [internal representation](#node-representation).

``` javascript
const customObject = node.encode((node, encode) => ({
  customId: node.id,
  customContent: node.content,
  customNodes: encode()
}))
```

**Output**:

``` javascript
{
  customId: 0,
  customContent: "zero",
  customNodes: [
    {
      customId: 1,
      customContent: "one",
      customNodes: []
    },
    {
      customId: 2,
      customContent: "two",
      customNodes: [
        {
          customId: 3,
          customContent: "three",
          customNodes: []
        },
        {
          customId: 4,
          customContent: "four",
          customNodes: []
        }
      ]
    }
  ]
}
```

### Importing from native object

Converts [`Object`] to `Node`.
Builds a tree from an [`Object`] representation.

``` javascript
const nodeFromObject = Node.parse(object)
```

The method has an optional constructor parameter to build a tree with a different pattern than the [internal representation](#node-representation).

``` javascript
const nodeFromCustomObject = Node.parse(customObject, (object) => ({
  id: object.customId,
  content: object.customContent,
  nodes: object.customNodes
}))
```

We’re back to the initial node representation.
