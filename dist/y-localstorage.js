!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(require("yjs"),require("lib0/observable")):"function"==typeof define&&define.amd?define(["yjs","lib0/observable"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).Y,e.observable)}(this,(function(e,t){"use strict";function s(e){if(e&&e.__esModule)return e;var t=Object.create(null);return e&&Object.keys(e).forEach((function(s){if("default"!==s){var i=Object.getOwnPropertyDescriptor(e,s);Object.defineProperty(t,s,i.get?i:{enumerable:!0,get:function(){return e[s]}})}})),t.default=e,Object.freeze(t)}var i,r=s(e);!function(e){class s extends t.Observable{constructor(e,t,s=5){super(),this._UpdateCounter=0,this._CounterLimit=5,this._pendingUpdates=0,this._completedUpdates=0,this._DocPrefix=e+"-",this._sharedDoc=t,this._UpdateCounter=0,this._CounterLimit=s,this._applyStoredUpdates(),this._storeUpdate=this._storeUpdate.bind(this),t.on("update",this._storeUpdate),this.destroy=this.destroy.bind(this),t.on("destroy",this.destroy)}_applyStoredUpdates(){const e=this._DocPrefix.length,t=this._StorageKeys();t.length>0?(this._pendingUpdates+=t.length,this._reportProgress(),t.forEach((t=>{let s=parseInt(t.slice(e),10);s>this._UpdateCounter&&(this._UpdateCounter=s);const i=new Uint8Array(JSON.parse(localStorage.getItem(t)));r.applyUpdate(this._sharedDoc,i),this._completedUpdates++,this._reportProgress()}))):this._reportProgress()}_storeUpdate(e,t){null!=this._sharedDoc&&t!==this&&(this._pendingUpdates++,this._reportProgress(),this._UpdateCounter<this._CounterLimit-1?localStorage.setItem(this._DocPrefix+this._UpdateCounter,JSON.stringify(Array.from(e))):(this._removeStoredUpdates(),localStorage.setItem(this._DocPrefix+this._UpdateCounter,JSON.stringify(Array.from(r.encodeStateAsUpdate(this._sharedDoc))))),this._UpdateCounter++,this._completedUpdates++,this._reportProgress())}_removeStoredUpdates(){this._StorageKeys().forEach((e=>{localStorage.removeItem(e)})),this._UpdateCounter=0}destroy(){this._removeStoredUpdates(),this._sharedDoc.off("update",this._storeUpdate),this._sharedDoc.off("destroy",this.destroy),this._sharedDoc=void 0}get isSynced(){return 0===this._pendingUpdates}_reportProgress(){switch(!0){case 0===this._pendingUpdates:this._completedUpdates=0,this.emit("synced",[this]);break;case 0===this._completedUpdates:this.emit("sync-started",[this,0]);break;case this._completedUpdates===this._pendingUpdates:this.emit("sync-finished",[this,1]),this._pendingUpdates=this._completedUpdates=0,this.emit("synced",[this]);break;default:const e=this._completedUpdates/this._pendingUpdates;this.emit("sync-continued",[this,e])}}_StorageKeys(){const e=this._DocPrefix.length,t=[];for(let s=0,i=localStorage.length;s<i;s++){const i=localStorage.key(s);i.startsWith(this._DocPrefix)&&!0===/^\d+$/.test(i.slice(e))&&t.push(i)}return t}}e.LocalStorageProvider=s}(i||(i={}))}));
//# sourceMappingURL=y-localstorage.js.map
