!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(require("yjs"),require("lib0/observable")):"function"==typeof define&&define.amd?define(["yjs","lib0/observable"],e):e((t="undefined"!=typeof globalThis?globalThis:t||self).Y,t.observable)}(this,(function(t,e){"use strict";function s(t){if(t&&t.__esModule)return t;var e=Object.create(null);return t&&Object.keys(t).forEach((function(s){if("default"!==s){var i=Object.getOwnPropertyDescriptor(t,s);Object.defineProperty(e,s,i.get?i:{enumerable:!0,get:function(){return t[s]}})}})),e.default=t,Object.freeze(e)}var i,r=s(t);!function(t){class s extends e.Observable{constructor(t,e,s=5){super(),this._UpdateCounter=1,this._CounterLimit=5,this._pendingUpdates=0,this._completedUpdates=0,this._DocPrefix=t+"-",this._sharedDoc=e,this._UpdateCounter=0,this._CounterLimit=s;try{this._applyStoredUpdates()}catch(t){this._breakdownWith("could not restore document from persistence",t)}this._storeUpdate=this._storeUpdate.bind(this),e.on("update",this._storeUpdate),this.destroy=this.destroy.bind(this),e.on("destroy",this.destroy)}get isSynced(){return 0===this._pendingUpdates}destroy(){null!=this._sharedDoc&&(this._removeStoredUpdatesStartingWith(0),this._sharedDoc.off("update",this._storeUpdate),this._sharedDoc.off("destroy",this.destroy),this.isSynced||(this._pendingUpdates=0,this.emit("sync-aborted",[this,1])),this._sharedDoc=void 0)}_applyStoredUpdates(){const t=this._DocPrefix.length,e=this._StorageKeys();e.length>0?(this._pendingUpdates+=e.length,this._reportProgress(),e.forEach((e=>{let s=parseInt(e.slice(t),10);s>this._UpdateCounter&&(this._UpdateCounter=s);const i=new Uint8Array(JSON.parse(localStorage.getItem(e)));r.applyUpdate(this._sharedDoc,i),this._completedUpdates++,this._reportProgress()}))):(this._UpdateCounter=1,this._reportProgress())}_storeUpdate(t,e){if(null!=this._sharedDoc&&e!==this){this._pendingUpdates++,this._reportProgress();try{this._UpdateCounter<this._CounterLimit-1?(localStorage.setItem(this._DocPrefix+this._UpdateCounter,JSON.stringify(Array.from(t))),this._UpdateCounter++):(localStorage.setItem(this._DocPrefix+0,JSON.stringify(Array.from(r.encodeStateAsUpdate(this._sharedDoc)))),this._removeStoredUpdatesStartingWith(1))}catch(t){this._breakdownWith("could not persist document update",t)}this._completedUpdates++,this._reportProgress()}}_removeStoredUpdatesStartingWith(t){const e=this._DocPrefix.length;try{this._StorageKeys().forEach((s=>{parseInt(s.slice(e),10)>=t&&localStorage.removeItem(s)}))}catch(t){console.warn("y-localstorage: could not clean-up localstorage, reason: "+t)}this._UpdateCounter=t}_breakdownWith(t,e){throw this._sharedDoc=void 0,this.isSynced||(this._pendingUpdates=0,this.emit("sync-aborted",[this,1])),new Error(t+(null==e?"":", reason: "+e))}_reportProgress(){switch(!0){case 0===this._pendingUpdates:this._completedUpdates=0,this.emit("synced",[this]);break;case 0===this._completedUpdates:this.emit("sync-started",[this,0]);break;case this._completedUpdates===this._pendingUpdates:this.emit("sync-finished",[this,1]),this._pendingUpdates=this._completedUpdates=0,this.emit("synced",[this]);break;default:const t=this._completedUpdates/this._pendingUpdates;this.emit("sync-continued",[this,t])}}_StorageKeys(){const t=this._DocPrefix.length,e=[];for(let s=0,i=localStorage.length;s<i;s++){const i=localStorage.key(s);i.startsWith(this._DocPrefix)&&!0===/^\d+$/.test(i.slice(t))&&e.push(i)}return e}}t.LocalStorageProvider=s}(i||(i={}))}));
//# sourceMappingURL=y-localstorage.js.map
