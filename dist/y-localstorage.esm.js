import * as Y from 'yjs';
import { Observable } from 'lib0/observable';

var LocalStorageProvider;
(function (LocalStorageProvider_1) {
    class LocalStorageProvider extends Observable {
        constructor(DocName, sharedDoc, CounterLimit = 5) {
            super();
            this._UpdateCounter = 0;
            this._CounterLimit = 5;
            this._pendingUpdates = 0;
            this._completedUpdates = 0;
            this._DocPrefix = DocName + '-';
            this._sharedDoc = sharedDoc;
            this._UpdateCounter = 0; // will be updated by "_applyStoredUpdates"
            this._CounterLimit = CounterLimit;
            this._applyStoredUpdates(); // also updates "this._UpdateCounter"
            this._storeUpdate = this._storeUpdate.bind(this);
            sharedDoc.on('update', this._storeUpdate);
            this.destroy = this.destroy.bind(this);
            sharedDoc.on('destroy', this.destroy);
        }
        /**** _applyStoredUpdates - applies all stored (incremental) updates to sharedDoc ****/
        _applyStoredUpdates() {
            const PrefixLength = this._DocPrefix.length;
            const StorageKeys = this._StorageKeys();
            if (StorageKeys.length > 0) {
                this._pendingUpdates += StorageKeys.length;
                this._reportProgress();
                StorageKeys.forEach((Key) => {
                    let UpdateIndex = parseInt(Key.slice(PrefixLength), 10);
                    if (UpdateIndex > this._UpdateCounter) {
                        this._UpdateCounter = UpdateIndex;
                    }
                    const Update = new Uint8Array(JSON.parse(localStorage.getItem(Key)));
                    Y.applyUpdate(this._sharedDoc, Update); // can be applied in any order
                    this._completedUpdates++;
                    this._reportProgress();
                });
            }
            else {
                this._reportProgress();
            }
        }
        /**** _storeUpdate - stores a given (incremental) update ****/
        _storeUpdate(Update, Origin) {
            if (this._sharedDoc == null) {
                return;
            } // persistence no longer exists
            if (Origin !== this) { // ignore updates applied by this provider
                this._pendingUpdates++;
                this._reportProgress();
                if (this._UpdateCounter < this._CounterLimit - 1) {
                    localStorage.setItem(this._DocPrefix + this._UpdateCounter, JSON.stringify(Array.from(Update)));
                }
                else {
                    this._removeStoredUpdates();
                    localStorage.setItem(this._DocPrefix + this._UpdateCounter, JSON.stringify(Array.from(Y.encodeStateAsUpdate(this._sharedDoc))));
                }
                this._UpdateCounter++;
                this._completedUpdates++;
                this._reportProgress();
            }
        }
        /**** _removeStoredUpdates - removes any stored (incremental) updates ****/
        _removeStoredUpdates() {
            this._StorageKeys().forEach((Key) => {
                localStorage.removeItem(Key);
            });
            this._UpdateCounter = 0;
        }
        /**** destroy - destroys persistence, invalidates provider ****/
        destroy() {
            if (this._sharedDoc == null) {
                return;
            } // persistence no longer exists
            this._removeStoredUpdates();
            this._sharedDoc.off('update', this._storeUpdate);
            this._sharedDoc.off('destroy', this.destroy);
            if (!this.isSynced) {
                this._pendingUpdates = 0;
                this.emit('sync-aborted', [this, 1.0]);
            }
            // @ts-ignore allow clearing of "this._sharedDoc"
            this._sharedDoc = undefined;
        }
        /**** isSynced - is true while this provider and its sharedDoc are in-sync ****/
        get isSynced() {
            return (this._pendingUpdates === 0);
        }
        /**** _reportProgress - emits events reporting synchronization progress ****/
        _reportProgress() {
            switch (true) {
                case (this._pendingUpdates === 0):
                    this._completedUpdates = 0;
                    this.emit('synced', [this]);
                    break;
                case (this._completedUpdates === 0):
                    this.emit('sync-started', [this, 0.0]);
                    break;
                case (this._completedUpdates === this._pendingUpdates):
                    this.emit('sync-finished', [this, 1.0]);
                    this._pendingUpdates = this._completedUpdates = 0;
                    this.emit('synced', [this]);
                    break;
                default:
                    const Progress = this._completedUpdates / this._pendingUpdates;
                    this.emit('sync-continued', [this, Progress]);
            }
        }
        /**** _StorageKeys - lists all keys used by this provider ****/
        _StorageKeys() {
            const PrefixLength = this._DocPrefix.length;
            const Result = [];
            for (let i = 0, l = localStorage.length; i < l; i++) {
                const Key = localStorage.key(i);
                if (Key.startsWith(this._DocPrefix) &&
                    (/^\d+$/.test(Key.slice(PrefixLength)) === true)) {
                    Result.push(Key);
                }
            }
            return Result;
        }
    }
    LocalStorageProvider_1.LocalStorageProvider = LocalStorageProvider;
})(LocalStorageProvider || (LocalStorageProvider = {}));
//# sourceMappingURL=y-localstorage.esm.js.map
