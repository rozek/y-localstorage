!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(require("yjs"),require("lib0/observable")):"function"==typeof define&&define.amd?define(["yjs","lib0/observable"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).Y,e.observable)}(this,(function(e,t){"use strict";function s(e){if(e&&e.__esModule)return e;var t=Object.create(null);return e&&Object.keys(e).forEach((function(s){if("default"!==s){var o=Object.getOwnPropertyDescriptor(e,s);Object.defineProperty(t,s,o.get?o:{enumerable:!0,get:function(){return e[s]}})}})),t.default=e,Object.freeze(t)}var o,r=s(e);!function(e){const s=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;class o extends t.Observable{constructor(e,t,s=5){super(),this._UpdateCounter=1,this._CounterLimit=5,this._pendingUpdates=0,this._completedUpdates=0,this._SubDocMap=new WeakMap,this._DocPrefix=e+"-",this._sharedDoc=t,this._UpdateCounter=0,this._CounterLimit=s;try{this._applyStoredUpdates()}catch(e){this._breakdownWith("could not restore document from persistence",e)}this._storeUpdate=this._storeUpdate.bind(this),t.on("update",this._storeUpdate),this._manageSubDocs=this._manageSubDocs.bind(this),t.on("subdocs",this._manageSubDocs),this.destroy=this.destroy.bind(this),t.on("destroy",this.destroy)}get isSynced(){return 0===this._pendingUpdates}destroy(){null!=this._sharedDoc&&(this._removeStoredUpdatesStartingWith(0),this._removeStoredSubDocs(),this._sharedDoc.off("update",this._storeUpdate),this._sharedDoc.off("subdocs",this._manageSubDocs),this._sharedDoc.off("destroy",this.destroy),this.isSynced||(this._pendingUpdates=0,this.emit("sync-aborted",[this,1])),this._sharedDoc=void 0)}_applyStoredUpdates(){const e=this._DocPrefix.length,t=this._StorageKeys();t.length>0?(this._pendingUpdates+=t.length,this._reportProgress(),t.forEach((t=>{let s=parseInt(t.slice(e),10);s>this._UpdateCounter&&(this._UpdateCounter=s);const o=new Uint8Array(JSON.parse(localStorage.getItem(t)));r.applyUpdate(this._sharedDoc,o),this._completedUpdates++,this._reportProgress()}))):(this._UpdateCounter=1,this._reportProgress())}_storeUpdate(e,t){if(null!=this._sharedDoc&&t!==this){this._pendingUpdates++,this._reportProgress();try{this._UpdateCounter<this._CounterLimit-1?(localStorage.setItem(this._DocPrefix+this._UpdateCounter,JSON.stringify(Array.from(e))),this._UpdateCounter++):(localStorage.setItem(this._DocPrefix+0,JSON.stringify(Array.from(r.encodeStateAsUpdate(this._sharedDoc)))),this._removeStoredUpdatesStartingWith(1))}catch(e){this._breakdownWith("could not persist document update",e)}this._completedUpdates++,this._reportProgress()}}_removeStoredUpdatesStartingWith(e){const t=this._DocPrefix.length;let s;this._StorageKeys().forEach((o=>{if(parseInt(o.slice(t),10)>=e)try{localStorage.removeItem(o)}catch(e){s=e}})),null!=s&&console.warn("y-localstorage: could not clean-up localstorage, reason: "+s),this._UpdateCounter=e}_removeStoredSubDocs(){this._removeStoredSubDoc()}_removeStoredSubDoc(e){let t;(null==e?this._StorageSubKeys():this._StorageSubKeysFor(e)).forEach((e=>{try{localStorage.removeItem(e)}catch(e){t=e}})),null!=t&&console.warn("y-localstorage: could not clean-up localstorage, reason: "+t)}_breakdownWith(e,t){throw this._sharedDoc=void 0,this.isSynced||(this._pendingUpdates=0,this.emit("sync-aborted",[this,1])),new Error(e+(null==t?"":", reason: "+t))}_manageSubDocs(e){const t=e=>{if(!this._SubDocMap.has(e)){const t=new o(this._DocPrefix.slice(0,-1)+"."+e.guid,e,this._CounterLimit);this._SubDocMap.set(e,t)}},{added:s,removed:r,loaded:i}=e;null!=s&&s.forEach((e=>{console.log("SubDoc added",e.guid),t(e)})),null!=r&&r.forEach((e=>{console.log("SubDoc removed",e.guid),this._removeStoredSubDoc(e),this._SubDocMap.delete(e)})),null!=i&&i.forEach((e=>{console.log("SubDoc loaded",e.guid),t(e)}))}_reportProgress(){switch(!0){case 0===this._pendingUpdates:this._completedUpdates=0,this.emit("synced",[this]);break;case 0===this._completedUpdates:this.emit("sync-started",[this,0]);break;case this._completedUpdates===this._pendingUpdates:this.emit("sync-finished",[this,1]),this._pendingUpdates=this._completedUpdates=0,this.emit("synced",[this]);break;default:const e=this._completedUpdates/this._pendingUpdates;this.emit("sync-continued",[this,e])}}_StorageKeys(){return this._StorageSubKeysFor()}_StorageSubKeys(){const e=this._DocPrefix.slice(0,-1)+".",t=e.length,o=[];for(let r=0,i=localStorage.length;r<i;r++){const i=localStorage.key(r);i.startsWith(e)&&!0===s.test(i.slice(t))&&o.push(i)}return o}_StorageSubKeysFor(e){const t=null==e?this._DocPrefix:this._DocPrefix.slice(0,-1)+"."+e.guid+"-",s=t.length,o=[];for(let e=0,r=localStorage.length;e<r;e++){const r=localStorage.key(e);r.startsWith(t)&&!0===/^\d+$/.test(r.slice(s))&&o.push(r)}return o}}e.LocalStorageProvider=o}(o||(o={}))}));
//# sourceMappingURL=y-localstorage.js.map
