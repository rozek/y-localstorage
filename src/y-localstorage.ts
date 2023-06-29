import * as Y         from 'yjs'
import { Observable } from 'lib0/observable'

namespace LocalStorageProvider {
  const GUIDPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  type SubDocChanges = {
    added:Set<Y.Doc>, removed:Set<Y.Doc>, loaded:Set<Y.Doc>
  }

  export class LocalStorageProvider extends Observable<any> {
    private _DocPrefix:string
    private _sharedDoc:Y.Doc

    private _UpdateCounter:number = 1    // index "0" is reserved for compaction
    private _CounterLimit:number  = 5

    private _pendingUpdates:number   = 0
    private _completedUpdates:number = 0

    private _SubDocMap:WeakMap<Y.Doc,LocalStorageProvider> = new WeakMap()

    constructor (DocName:string, sharedDoc:Y.Doc, CounterLimit:number = 5) {
      super()

      this._DocPrefix = DocName + '-'
      this._sharedDoc = sharedDoc

      this._UpdateCounter = 0        // will be updated by "_applyStoredUpdates"
      this._CounterLimit  = CounterLimit

      try {
        this._applyStoredUpdates()         // also updates "this._UpdateCounter"
      } catch (Signal:any) {
        this._breakdownWith(
          'could not restore document from persistence', Signal
        )
      }

      this._storeUpdate = this._storeUpdate.bind(this)
      sharedDoc.on('update', this._storeUpdate)

      this._manageSubDocs = this._manageSubDocs.bind(this)
      sharedDoc.on('subdocs', this._manageSubDocs)

      this.destroy = this.destroy.bind(this)
      sharedDoc.on('destroy', this.destroy)
    }

  /**** isSynced - is true while this provider and its sharedDoc are in-sync ****/

    public get isSynced ():boolean {
      return (this._pendingUpdates === 0)
    }

  /**** destroy - destroys persistence, invalidates provider ****/

    public destroy ():void {
      if (this._sharedDoc == null) { return }    // persistence no longer exists

      this._removeStoredUpdatesStartingWith(0)
      this._removeStoredSubDocs()

      this._sharedDoc.off('update',  this._storeUpdate)
      this._sharedDoc.off('subdocs', this._manageSubDocs)
      this._sharedDoc.off('destroy', this.destroy)

      if (! this.isSynced) {
        this._pendingUpdates = 0
        this.emit('sync-aborted',[this,1.0])
      }

// @ts-ignore allow clearing of "this._sharedDoc"
      this._sharedDoc = undefined
    }

  /**** _applyStoredUpdates - applies all stored (incremental) updates to sharedDoc ****/

    private _applyStoredUpdates ():void {
      const PrefixLength = this._DocPrefix.length

      const StorageKeys = this._StorageKeys()
      if (StorageKeys.length > 0) {
        this._pendingUpdates += StorageKeys.length; this._reportProgress()

        StorageKeys.forEach((Key) => {
          let UpdateIndex = parseInt(Key.slice(PrefixLength),10)
          if (UpdateIndex > this._UpdateCounter) {
            this._UpdateCounter = UpdateIndex
          }

          const Update = new Uint8Array(JSON.parse(localStorage.getItem(Key) as string))
          Y.applyUpdate(this._sharedDoc, Update)  // can be applied in any order

          this._completedUpdates++; this._reportProgress()
        })
      } else {
        this._UpdateCounter = 1                // keep "0" for compacted updates
        this._reportProgress()
      }
    }

  /**** _storeUpdate - stores a given (incremental) update ****/

    private _storeUpdate (Update:Uint8Array, Origin?:any):void {
      if (this._sharedDoc == null) { return }    // persistence no longer exists

      if (Origin !== this) {          // ignore updates applied by this provider
        this._pendingUpdates++; this._reportProgress()
          try {
            if (this._UpdateCounter < this._CounterLimit-1) {   // append update
              localStorage.setItem(                                  // may fail
                this._DocPrefix + this._UpdateCounter,
                JSON.stringify(Array.from(Update))
              )

              this._UpdateCounter++
            } else {                     // compact previous and current updates
              localStorage.setItem(                                  // may fail
                this._DocPrefix + 0,
                JSON.stringify(Array.from(Y.encodeStateAsUpdate(this._sharedDoc)))
              )

              this._removeStoredUpdatesStartingWith(1)
            }
          } catch (Signal:any) {
            this._breakdownWith(
              'could not persist document update', Signal
            )
          }
        this._completedUpdates++; this._reportProgress()
      }
    }

  /**** _removeStoredUpdatesStartingWith - removes stored (incremental) updates ****/

    private _removeStoredUpdatesStartingWith (minimalIndex:number):void {
      const PrefixLength = this._DocPrefix.length

      let lastFailure:any = undefined
        this._StorageKeys().forEach((Key) => {
          let UpdateIndex = parseInt(Key.slice(PrefixLength),10)
          if (UpdateIndex >= minimalIndex) {
            try {
              localStorage.removeItem(Key)                           // may fail
            } catch (Signal:any) {
              lastFailure = Signal
            }
          }
        })
      if (lastFailure != null) {
        console.warn(
          'y-localstorage: could not clean-up localstorage, reason: ' + lastFailure
        )
      }

      this._UpdateCounter = minimalIndex
    }

  /**** _removeStoredSubDocs - removes any stored subdocs ****/

    private _removeStoredSubDocs ():void {
      this._removeStoredSubDoc()                      // avoids duplicating code
    }

  /**** _removeStoredSubDoc - removes a single stored subdoc ****/

    private _removeStoredSubDoc (SubDoc?:Y.Doc):void {
      let lastFailure:any = undefined
        const StorageKeys = (
          SubDoc == null
          ? this._StorageSubKeys()
          : this._StorageSubKeysFor(SubDoc)
        )

        StorageKeys.forEach((Key) => {
          try {
            localStorage.removeItem(Key)                             // may fail
          } catch (Signal:any) {
            lastFailure = Signal
          }
        })
      if (lastFailure != null) {
        console.warn(
          'y-localstorage: could not clean-up localstorage, reason: ' + lastFailure
        )
      }
    }

  /**** _breakdownWith - breaks down this provider after failure ****/

    private _breakdownWith (Message:string, Reason?:any):never {
// @ts-ignore allow clearing of "this._sharedDoc"
      this._sharedDoc = undefined

      if (! this.isSynced) {
        this._pendingUpdates = 0
        this.emit('sync-aborted',[this,1.0])
      }

      throw new Error(
        Message + (Reason == null ? '' : ', reason: ' + Reason)
      )
    }

  /**** _manageSubDocs - manages subdoc persistences ****/

    private _manageSubDocs (Changes:SubDocChanges):void {
      const providePersistenceFor = (SubDoc:Y.Doc) => {
        if (! this._SubDocMap.has(SubDoc)) {
          const SubDocProvider = new LocalStorageProvider(
            this._DocPrefix.slice(0,-1) + '.' + SubDoc.guid, SubDoc,
            this._CounterLimit
          )
          this._SubDocMap.set(SubDoc,SubDocProvider)
        }
      }

      const { added, removed, loaded } = Changes

      if (added != null) {
        added.forEach((SubDoc:Y.Doc) => {
console.log('SubDoc added',SubDoc.guid)
          providePersistenceFor(SubDoc)
        })
      }

      if (removed != null) {
        removed.forEach((SubDoc:Y.Doc) => {
console.log('SubDoc removed',SubDoc.guid)
          this._removeStoredSubDoc(SubDoc)
          this._SubDocMap.delete(SubDoc)
        })
      }

      if (loaded != null) {
        loaded.forEach((SubDoc:Y.Doc) => {
console.log('SubDoc loaded',SubDoc.guid)
          providePersistenceFor(SubDoc)
        })
      }
    }

  /**** _reportProgress - emits events reporting synchronization progress ****/

    private _reportProgress ():void {
      switch (true) {
        case (this._pendingUpdates === 0):
          this._completedUpdates = 0
          this.emit('synced',[this])
          break
        case (this._completedUpdates === 0):
          this.emit('sync-started',[this,0.0])
          break
        case (this._completedUpdates === this._pendingUpdates):
          this.emit('sync-finished',[this,1.0])
          this._pendingUpdates = this._completedUpdates = 0
          this.emit('synced',[this])
          break
        default:
          const Progress = this._completedUpdates/this._pendingUpdates
          this.emit('sync-continued',[this,Progress])
      }
    }

  /**** _StorageKeys - lists all keys used for sharedDoc itself ****/

    private _StorageKeys ():string[] {
      return this._StorageSubKeysFor()                // avoids duplicating code
    }

  /**** _StorageSubKeys - lists all keys used for subdocs of sharedDoc ****/

    private _StorageSubKeys ():string[] {
      const DocPrefix    = this._DocPrefix.slice(0,-1) + '.'
      const PrefixLength = DocPrefix.length

      const Result:string[] = []
        for (let i = 0, l = localStorage.length; i < l; i++) {
          const Key = localStorage.key(i) as string
          if (
            Key.startsWith(DocPrefix) &&
            (GUIDPattern.test(Key.slice(PrefixLength)) === true)
          ) { Result.push(Key) }
        }
      return Result
    }

  /**** _StorageSubKeysFor - lists all keys used for a given subdoc ****/

    private _StorageSubKeysFor (SubDoc?:Y.Doc):string[] {
      const DocPrefix = (
        SubDoc == null
        ? this._DocPrefix
        : this._DocPrefix.slice(0,-1) + '.' + SubDoc.guid + '-'
      )
      const PrefixLength = DocPrefix.length

      const Result:string[] = []
        for (let i = 0, l = localStorage.length; i < l; i++) {
          const Key = localStorage.key(i) as string
          if (
            Key.startsWith(DocPrefix) &&
            (/^\d+$/.test(Key.slice(PrefixLength)) === true)
          ) { Result.push(Key) }
        }
      return Result
    }
  }
}
