# y-localstorage #

a simple [Yjs](https://docs.yjs.dev/) storage provider persisting in [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) (for educational purposes only!)

[Yjs](https://github.com/yjs/yjs) provides a complete ecosystem for (persisting and) sharing "Conflict-free replicated data types" (CRDT) among multiple clients using a variety of persistence and communication providers. 

This module implements a simple Yjs storage provider for browser-based applications which uses [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) for persistance. In addition to other database providers it

* contains an `isSynced` property which reflects the current synchronization status and
* emits additional events (`sync-started`, `sync-continued` and `sync-finished`) which informs about synchronization progress.

Like other providers, however, it also lacks any error handling - which should normally exist in _every_ "database" implementation...

**NPM users**: please consider the [Github README](https://github.com/rozek/y-localstorage/blob/main/README.md) for the latest description of this package (as updating the docs would otherwise always require a new NPM package version)

> Nota bene: do not use this provider in production - it has solely be written for educational purposes!

## Installation ##

`y-localstorage` may be used as an ECMAScript module (ESM), a CommonJS or AMD module or from a global variable.

You may either install the package into your build environment using [NPM](https://docs.npmjs.com/) with the command

```
npm install y-localstorage
```

or load the plain script file directly

```html
<script src="https://unpkg.com/y-localstorage"></script>
```

## Access ##

How to access the package depends on the type of module you prefer

* ESM (or Svelte): `import { LocalStorageProvider } from 'y-localstorage'`
* CommonJS: `const LocalStorageProvider = require('y-localstorage')`
* AMD: `require(['y-localstorage'], (LocalStorageProvider) => {...})`

Alternatively, you may access the global variable `LocalStorageProvider` directly.

Note for ECMAScript module users: all module functions and values are exported individually, thus allowing your bundler to perform some "tree-shaking" in order to include actually used functions or values (together with their dependencies) only.

## Usage within Svelte ##

For Svelte, it is recommended to import the package in a module context. From then on, its exports may be used as usual:

```html
<script context="module">
  import * as Y     from 'yjs'
  import { LocalStorageProvider } from 'y-localstorage'
</script>

<script>
  const sharedDoc   = new Y.Doc()
  const Persistence = new LocalStorageProvider('local-persistence', sharedDoc)
  ...
</script>
```

## Usage as ECMAscript, CommonJS or AMD Module (or as a global Variable) ##

Let's assume that you already "required" or "imported" (or simply loaded) the module according to your local environment. In that case, you may use it as follows:

```javascript
  ...
  const Persistence = new LocalStorageProvider('local-persistence', sharedDoc)
  ...
```

## API Reference ##

The following documentation shows method signatures as used by TypeScript - if you prefer plain JavaScript, just ignore the type annotations.

### Constructor ###

* **`LocalStorageProvider (DocName:string, sharedDoc:Y.Doc, CounterLimit:number = 5)`**<br>

### Properties ###

* **`isSynced`**<br>returns `true` while the initially given `Y.Doc` and this provider are in sync - or `false` otherwise

### Events ###

* **`on('sync-started', Handler:(Provider:LocalStorageProvider, Progress:number) => void`**<br>
* **`on('sync-continued', Handler:(Provider:LocalStorageProvider, Progress:number) => void`**<br>
* **`on('sync-finished', Handler:(Provider:LocalStorageProvider, Progress:number) => void`**<br>
* **`on('synced', Handler:(Provider:LocalStorageProvider) => void`**<br>

## Build Instructions ##

You may easily build this package yourself.

Just install [NPM](https://docs.npmjs.com/) according to the instructions for your platform and follow these steps:

1. either clone this repository using [git](https://git-scm.com/) or [download a ZIP archive](https://github.com/rozek/y-localstorage/archive/refs/heads/main.zip) with its contents to your disk and unpack it there 
2. open a shell and navigate to the root directory of this repository
3. run `npm install` in order to install the complete build environment
4. execute `npm run build` to create a new build

You may also look into the author's [build-configuration-study](https://github.com/rozek/build-configuration-study) for a general description of his build environment.

## License ##

[MIT License](LICENSE.md)
