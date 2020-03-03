class Node {

  // Creating ──────────────────────────────────────────────────────────────────

  // Creates a new node with an ID and optional content.
  constructor({ id, content = null }) {
    this.properties = {
      id,
      content,
      parent: null,
      children: []
    }
  }

  // Properties ────────────────────────────────────────────────────────────────

  // Returns ID.
  get id() {
    return this.properties.id
  }

  // Returns content.
  get content() {
    return this.properties.content
  }

  // Sets content.
  set content(content) {
    this.properties.content = content
  }

  // Returns parent node.
  // Returns `null` if root.
  get parent() {
    return this.properties.parent
  }

  // Sets parent node without verification.
  set parent(parent) {
    this.properties.parent = parent
  }

  // Returns an array of immediate child nodes.
  get children() {
    return this.properties.children
  }

  // Alias to `#children`.
  get nodes() {
    return this.children
  }

  // Sets children.
  set children(children) {
    this.properties.children = children
  }

  // Alias to `#children=`.
  set nodes(nodes) {
    this.children = nodes
  }

  // Duplicating ───────────────────────────────────────────────────────────────

  // Returns a copy of the node.
  // Copies content.
  // Removes parent and children links.
  detach() {
    return new Node({
      id: this.id,
      content: Node.clone(this.content)
    })
  }

  // Returns a copy of the node and descendants.
  // Copies ID and content.
  clone() {
    const detachedNode = this.detach()
    for (const node of this.nodes) {
      detachedNode.push(node.clone())
    }
    return detachedNode
  }

  // Parent ────────────────────────────────────────────────────────────────────

  // Retrieves parent node.
  // Returns `null` if root.
  // Accepts a *count* argument.
  getParent(count = 1) {
    return count < 1
      ? this
      : this.isRoot()
      ? null
      : this.parent.getParent(count - 1)
  }

  // Sets parent node.
  setParent(parentNode) {
    if (this.parent) {
      Node.remove(this.parent.nodes, this)
    }
    if (parentNode) {
      parentNode.nodes.push(this)
    }
    this.parent = parentNode
  }

  // Alias to `#ancestors()`.
  parents() {
    return this.ancestors()
  }

  // Lineage ───────────────────────────────────────────────────────────────────

  // Returns an array of ancestors from the current node.
  lineage() {
    return this.ancestors([this])
  }

  // Returns an array of ancestors.
  ancestors(ancestors = []) {
    if (this.isRoot()) {
      return ancestors
    }
    return this.parent.ancestors(ancestors.concat(this.parent))
  }

  // Children ──────────────────────────────────────────────────────────────────

  // Retrieves immediate child corresponding to the ID.
  // Returns `null` if not found.
  child(key) {
    return this.children.find((child) => child.id === key)
  }

  // Alias to `#child(key)`.
  node(key) {
    return this.child(key)
  }

  // Returns whether the node has any child node.
  hasChildren() {
    return this.children.length > 0
  }

  // Alias to `#hasChildren()`.
  hasNodes() {
    return this.hasChildren()
  }

  // Root ──────────────────────────────────────────────────────────────────────

  // Returns root node.
  root() {
    return this.isRoot()
      ? this
      : this.parent.root()
  }

  // Detaches the node from its parent.
  setRoot() {
    this.setParent(null)
  }

  // Returns whether the node is rooted.
  isRoot() {
    return this.parent === null
  }

  // Leaves ────────────────────────────────────────────────────────────────────

  // Returns whether the node is leafed.
  isLeaf() {
    return ! this.hasNodes()
  }

  // Returns an array of leaves.
  leaves() {
    return Array.from(this).filter((node) => node.isLeaf())
  }

  // Siblings ──────────────────────────────────────────────────────────────────

  // Returns an array of sibling nodes.
  // An empty array is returned if the node has no parent.
  siblings() {
    return ! this.parent
      ? []
      : this.parent.nodes.filter((node) => node !== this)
  }

  // Returns next sibling node.
  // Accepts a *count* argument.
  next(count = 1) {
    return this.parent.nodes[this.index() + count]
  }

  // Returns previous sibling node.
  // Accepts a *count* argument.
  previous(count = 1) {
    return this.next(-count)
  }

  // Adding ────────────────────────────────────────────────────────────────────

  // Appends the given child nodes.
  // Returns the node itself.
  push(...nodes) {
    for (const node of nodes) {
      this.add(node)
    }
    return this
  }

  // Appends the given child node.
  // Returns the linked child node.
  add(node) {
    node.setParent(this)
    return node
  }

  // Iterating ─────────────────────────────────────────────────────────────────

  // Returns a new [iterator][Iterators and generators].
  // Traverses each node, including the current node.
  //
  // [Iterators and generators]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators
  *[Symbol.iterator]() {
    function* generator() {
      yield this
      for (const node of this.nodes) {
        yield* generator.apply(node)
      }
    }
    yield* generator.apply(this)
  }

  // Comparison ────────────────────────────────────────────────────────────────

  // Returns a `compareFunction` to compare nodes by their content.
  // Accepts a custom *compareFunction* and *mapNode* function that takes the node being compared.
  //
  // See [Comparison operators] for more details.
  //
  // [Comparison operators]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Comparison_Operators
  static compare(
    compareFunction = (value, otherValue) => {
      return value < otherValue ? -1 : 1
    },
    mapNode = (node) => node.content
  ) {
    return (node, otherNode) => {
      return compareFunction(mapNode(node), mapNode(otherNode))
    }
  }

  // Metrics ───────────────────────────────────────────────────────────────────

  // Returns index among sibling nodes.
  // Returns `null` if root.
  index() {
    return this.isRoot()
      ? null
      : this.parent.nodes.indexOf(this)
  }

  // Returns the number of ancestors.
  // A root node has a depth of zero.
  depth() {
    return this.isRoot()
      ? 0
      : 1 + this.parent.depth()
  }

  // Returns the height of the node.
  // A leaf node has a height of zero.
  height() {
    return this.isLeaf()
      ? 0
      : 1 + Math.max(...this.nodes.map((node) => node.height()))
  }

  // Returns the number of sibling nodes.
  // A root node has a breadth of one.
  breadth() {
    return this.isRoot()
      ? 1
      : this.parent.nodes.length
  }

  // Encoder and Parser ────────────────────────────────────────────────────────

  // Converts `Node` to `Object`.
  // Builds an `Object` from a tree representation.
  // The method has an optional constructor parameter to build an `Object` with a different pattern than the internal representation.
  encode(
    constructor = (node, encode) => ({
      id: node.id,
      content: node.content,
      nodes: encode()
    })
  ) {
    const encode = () => {
      return this.nodes.map((node) => {
        return node.encode(constructor)
      })
    }
    return constructor(this, encode)
  }

  // Converts `Object` to `Node`.
  // Builds a tree from an `Object` representation.
  // The method has an optional constructor parameter to build a tree with a different pattern than the internal representation.
  static parse(
    object,
    constructor = (object) => ({
      id: object.id,
      content: object.content,
      nodes: object.nodes
    })
  ) {
    const { id, content, nodes } = constructor(object)
    const node = new Node({ id, content })
    for (const object of nodes) {
      node.add(Node.parse(object, constructor))
    }
    return node
  }

  // Helpers ───────────────────────────────────────────────────────────────────

  static clone(object) {
    switch (Node.typeOf(object)) {
      case 'Array':
        return Object.assign([], object)
        break
      case 'Object':
        return Object.assign({}, object)
        break
      default:
        return object
    }
  }

  static typeOf(object) {
    return object
      ? object.constructor.name
      : null
  }

  static remove(array, ...elements) {
    for (let index = array.length - 1; index >= 0; index--) {
      const element = array[index]
      if (elements.includes(element)) {
        array.splice(index, 1)
      }
    }
  }

}
