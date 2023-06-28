# y-localstorage #

a simple [Yjs](https://docs.yjs.dev/) storage provider persisting in [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) (for educational purposes only!)

[Yjs](https://github.com/yjs/yjs) provides a complete ecosystem for (persisting and) sharing "Conflict-free replicated data types" (CRDT) among multiple clients using a variety of persistence and communication providers. 

This module implements a simple Yjs storage provider for browser-based applications which uses [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) for persistance. In addition to other database providers it

* contains an `isSynced` property which reflects the current synchronization status and
* emits additional events (`sync-started`, `sync-continued` and `sync-finished`) which informs about synchronization progress.

Like other providers, however, it also lacks any error handling - which should normally exist in _any_ "database" implementation...

> Nota bene: do not use this provider in production - it has solely be written for educational purposes!






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
