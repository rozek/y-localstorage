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
            try {
                this._applyStoredUpdates(); // also updates "this._UpdateCounter"
            }
            catch (Signal) {
                this._breakdownWith('could not restore document from persistence', Signal);
            }
            this._storeUpdate = this._storeUpdate.bind(this);
            sharedDoc.on('update', this._storeUpdate);
            this.destroy = this.destroy.bind(this);
            sharedDoc.on('destroy', this.destroy);
        }
        /**** isSynced - is true while this provider and its sharedDoc are in-sync ****/
        get isSynced() {
            return (this._pendingUpdates === 0);
        }
        /**** destroy - destroys persistence, invalidates provider ****/
        destroy() {
            if (this._sharedDoc == null) {
                return;
            } // persistence no longer exists
            this._removeStoredUpdatesStartingWith(0);
            this._sharedDoc.off('update', this._storeUpdate);
            this._sharedDoc.off('destroy', this.destroy);
            if (!this.isSynced) {
                this._pendingUpdates = 0;
                this.emit('sync-aborted', [this, 1.0]);
            }
            // @ts-ignore allow clearing of "this._sharedDoc"
            this._sharedDoc = undefined;
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
                try {
                    if (this._UpdateCounter < this._CounterLimit - 1) { // append update
                        localStorage.setItem(// may fail
                        this._DocPrefix + this._UpdateCounter, JSON.stringify(Array.from(Update)));
                    }
                    else { // compact previous and current update
                        localStorage.setItem(// may fail
                        this._DocPrefix + 0, JSON.stringify(Array.from(Y.encodeStateAsUpdate(this._sharedDoc))));
                        this._removeStoredUpdatesStartingWith(1);
                    }
                }
                catch (Signal) {
                    this._breakdownWith('could not persist document update', Signal);
                }
                this._UpdateCounter++;
                this._completedUpdates++;
                this._reportProgress();
            }
        }
        /**** _removeStoredUpdatesStartingWith - removes stored (incremental) updates ****/
        _removeStoredUpdatesStartingWith(minimalIndex) {
            const PrefixLength = this._DocPrefix.length;
            try {
                this._StorageKeys().forEach((Key) => {
                    let UpdateIndex = parseInt(Key.slice(PrefixLength), 10);
                    if (UpdateIndex >= minimalIndex) {
                        localStorage.removeItem(Key); // may fail
                    }
                });
            }
            catch (Signal) {
                console.warn('y-localstorage: could not clean-up localstorage, reason: ' + Signal);
            }
            this._UpdateCounter = minimalIndex;
        }
        /**** _breakdownWith - breaks down this provider after failure ****/
        _breakdownWith(Message, Reason) {
            // @ts-ignore allow clearing of "this._sharedDoc"
            this._sharedDoc = undefined;
            if (!this.isSynced) {
                this._pendingUpdates = 0;
                this.emit('sync-aborted', [this, 1.0]);
            }
            throw new Error(Message + (Reason == null ? '' : ', reason: ' + Reason));
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
