var gt=Object.defineProperty;var _t=(s,t,e)=>t in s?gt(s,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[t]=e;var M=(s,t,e)=>(_t(s,typeof t!="symbol"?t+"":t,e),e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function e(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function r(i){if(i.ep)return;i.ep=!0;const n=e(i);fetch(i.href,n)}})();function y(s){return Array.isArray?Array.isArray(s):ot(s)==="[object Array]"}const mt=1/0;function bt(s){if(typeof s=="string")return s;let t=s+"";return t=="0"&&1/s==-mt?"-0":t}function Et(s){return s==null?"":bt(s)}function x(s){return typeof s=="string"}function nt(s){return typeof s=="number"}function At(s){return s===!0||s===!1||Mt(s)&&ot(s)=="[object Boolean]"}function ct(s){return typeof s=="object"}function Mt(s){return ct(s)&&s!==null}function m(s){return s!=null}function U(s){return!s.trim().length}function ot(s){return s==null?s===void 0?"[object Undefined]":"[object Null]":Object.prototype.toString.call(s)}const xt="Incorrect 'index' type",Lt=s=>`Invalid value for key ${s}`,It=s=>`Pattern length exceeds max of ${s}.`,yt=s=>`Missing ${s} property in key`,wt=s=>`Property 'weight' in key '${s}' must be a positive integer`,Z=Object.prototype.hasOwnProperty;class vt{constructor(t){this._keys=[],this._keyMap={};let e=0;t.forEach(r=>{let i=at(r);this._keys.push(i),this._keyMap[i.id]=i,e+=i.weight}),this._keys.forEach(r=>{r.weight/=e})}get(t){return this._keyMap[t]}keys(){return this._keys}toJSON(){return JSON.stringify(this._keys)}}function at(s){let t=null,e=null,r=null,i=1,n=null;if(x(s)||y(s))r=s,t=q(s),e=W(s);else{if(!Z.call(s,"name"))throw new Error(yt("name"));const o=s.name;if(r=o,Z.call(s,"weight")&&(i=s.weight,i<=0))throw new Error(wt(o));t=q(o),e=W(o),n=s.getFn}return{path:t,id:e,weight:i,src:r,getFn:n}}function q(s){return y(s)?s:s.split(".")}function W(s){return y(s)?s.join("."):s}function St(s,t){let e=[],r=!1;const i=(n,o,c)=>{if(m(n))if(!o[c])e.push(n);else{let a=o[c];const l=n[a];if(!m(l))return;if(c===o.length-1&&(x(l)||nt(l)||At(l)))e.push(Et(l));else if(y(l)){r=!0;for(let h=0,f=l.length;h<f;h+=1)i(l[h],o,c+1)}else o.length&&i(l,o,c+1)}};return i(s,x(t)?t.split("."):t,0),r?e:e[0]}const kt={includeMatches:!1,findAllMatches:!1,minMatchCharLength:1},Nt={isCaseSensitive:!1,includeScore:!1,keys:[],shouldSort:!0,sortFn:(s,t)=>s.score===t.score?s.idx<t.idx?-1:1:s.score<t.score?-1:1},Ot={location:0,threshold:.6,distance:100},Rt={useExtendedSearch:!1,getFn:St,ignoreLocation:!1,ignoreFieldNorm:!1,fieldNormWeight:1};var u={...Nt,...kt,...Ot,...Rt};const Tt=/[^ ]+/g;function Ct(s=1,t=3){const e=new Map,r=Math.pow(10,t);return{get(i){const n=i.match(Tt).length;if(e.has(n))return e.get(n);const o=1/Math.pow(n,.5*s),c=parseFloat(Math.round(o*r)/r);return e.set(n,c),c},clear(){e.clear()}}}class J{constructor({getFn:t=u.getFn,fieldNormWeight:e=u.fieldNormWeight}={}){this.norm=Ct(e,3),this.getFn=t,this.isCreated=!1,this.setIndexRecords()}setSources(t=[]){this.docs=t}setIndexRecords(t=[]){this.records=t}setKeys(t=[]){this.keys=t,this._keysMap={},t.forEach((e,r)=>{this._keysMap[e.id]=r})}create(){this.isCreated||!this.docs.length||(this.isCreated=!0,x(this.docs[0])?this.docs.forEach((t,e)=>{this._addString(t,e)}):this.docs.forEach((t,e)=>{this._addObject(t,e)}),this.norm.clear())}add(t){const e=this.size();x(t)?this._addString(t,e):this._addObject(t,e)}removeAt(t){this.records.splice(t,1);for(let e=t,r=this.size();e<r;e+=1)this.records[e].i-=1}getValueForItemAtKeyId(t,e){return t[this._keysMap[e]]}size(){return this.records.length}_addString(t,e){if(!m(t)||U(t))return;let r={v:t,i:e,n:this.norm.get(t)};this.records.push(r)}_addObject(t,e){let r={i:e,$:{}};this.keys.forEach((i,n)=>{let o=i.getFn?i.getFn(t):this.getFn(t,i.path);if(m(o)){if(y(o)){let c=[];const a=[{nestedArrIndex:-1,value:o}];for(;a.length;){const{nestedArrIndex:l,value:h}=a.pop();if(m(h))if(x(h)&&!U(h)){let f={v:h,i:l,n:this.norm.get(h)};c.push(f)}else y(h)&&h.forEach((f,d)=>{a.push({nestedArrIndex:d,value:f})})}r.$[n]=c}else if(x(o)&&!U(o)){let c={v:o,n:this.norm.get(o)};r.$[n]=c}}}),this.records.push(r)}toJSON(){return{keys:this.keys,records:this.records}}}function lt(s,t,{getFn:e=u.getFn,fieldNormWeight:r=u.fieldNormWeight}={}){const i=new J({getFn:e,fieldNormWeight:r});return i.setKeys(s.map(at)),i.setSources(t),i.create(),i}function $t(s,{getFn:t=u.getFn,fieldNormWeight:e=u.fieldNormWeight}={}){const{keys:r,records:i}=s,n=new J({getFn:t,fieldNormWeight:e});return n.setKeys(r),n.setIndexRecords(i),n}function D(s,{errors:t=0,currentLocation:e=0,expectedLocation:r=0,distance:i=u.distance,ignoreLocation:n=u.ignoreLocation}={}){const o=t/s.length;if(n)return o;const c=Math.abs(r-e);return i?o+c/i:c?1:o}function Pt(s=[],t=u.minMatchCharLength){let e=[],r=-1,i=-1,n=0;for(let o=s.length;n<o;n+=1){let c=s[n];c&&r===-1?r=n:!c&&r!==-1&&(i=n-1,i-r+1>=t&&e.push([r,i]),r=-1)}return s[n-1]&&n-r>=t&&e.push([r,n-1]),e}const R=32;function Ft(s,t,e,{location:r=u.location,distance:i=u.distance,threshold:n=u.threshold,findAllMatches:o=u.findAllMatches,minMatchCharLength:c=u.minMatchCharLength,includeMatches:a=u.includeMatches,ignoreLocation:l=u.ignoreLocation}={}){if(t.length>R)throw new Error(It(R));const h=t.length,f=s.length,d=Math.max(0,Math.min(r,f));let p=n,g=d;const b=c>1||a,N=b?Array(f):[];let L;for(;(L=s.indexOf(t,g))>-1;){let E=D(t,{currentLocation:L,expectedLocation:d,distance:i,ignoreLocation:l});if(p=Math.min(E,p),g=L+h,b){let w=0;for(;w<h;)N[L+w]=1,w+=1}}g=-1;let C=[],O=1,P=h+f;const pt=1<<h-1;for(let E=0;E<h;E+=1){let w=0,v=P;for(;w<v;)D(t,{errors:E,currentLocation:d+v,expectedLocation:d,distance:i,ignoreLocation:l})<=p?w=v:P=v,v=Math.floor((P-w)/2+w);P=v;let X=Math.max(1,d-v+1),H=o?f:Math.min(d+v,f)+h,$=Array(H+2);$[H+1]=(1<<E)-1;for(let A=H;A>=X;A-=1){let F=A-1,Q=e[s.charAt(F)];if(b&&(N[F]=+!!Q),$[A]=($[A+1]<<1|1)&Q,E&&($[A]|=(C[A+1]|C[A])<<1|1|C[A+1]),$[A]&pt&&(O=D(t,{errors:E,currentLocation:F,expectedLocation:d,distance:i,ignoreLocation:l}),O<=p)){if(p=O,g=F,g<=d)break;X=Math.max(1,2*d-g)}}if(D(t,{errors:E+1,currentLocation:d,expectedLocation:d,distance:i,ignoreLocation:l})>p)break;C=$}const B={isMatch:g>=0,score:Math.max(.001,O)};if(b){const E=Pt(N,c);E.length?a&&(B.indices=E):B.isMatch=!1}return B}function Dt(s){let t={};for(let e=0,r=s.length;e<r;e+=1){const i=s.charAt(e);t[i]=(t[i]||0)|1<<r-e-1}return t}class ht{constructor(t,{location:e=u.location,threshold:r=u.threshold,distance:i=u.distance,includeMatches:n=u.includeMatches,findAllMatches:o=u.findAllMatches,minMatchCharLength:c=u.minMatchCharLength,isCaseSensitive:a=u.isCaseSensitive,ignoreLocation:l=u.ignoreLocation}={}){if(this.options={location:e,threshold:r,distance:i,includeMatches:n,findAllMatches:o,minMatchCharLength:c,isCaseSensitive:a,ignoreLocation:l},this.pattern=a?t:t.toLowerCase(),this.chunks=[],!this.pattern.length)return;const h=(d,p)=>{this.chunks.push({pattern:d,alphabet:Dt(d),startIndex:p})},f=this.pattern.length;if(f>R){let d=0;const p=f%R,g=f-p;for(;d<g;)h(this.pattern.substr(d,R),d),d+=R;if(p){const b=f-R;h(this.pattern.substr(b),b)}}else h(this.pattern,0)}searchIn(t){const{isCaseSensitive:e,includeMatches:r}=this.options;if(e||(t=t.toLowerCase()),this.pattern===t){let g={isMatch:!0,score:0};return r&&(g.indices=[[0,t.length-1]]),g}const{location:i,distance:n,threshold:o,findAllMatches:c,minMatchCharLength:a,ignoreLocation:l}=this.options;let h=[],f=0,d=!1;this.chunks.forEach(({pattern:g,alphabet:b,startIndex:N})=>{const{isMatch:L,score:C,indices:O}=Ft(t,g,b,{location:i+N,distance:n,threshold:o,findAllMatches:c,minMatchCharLength:a,includeMatches:r,ignoreLocation:l});L&&(d=!0),f+=C,L&&O&&(h=[...h,...O])});let p={isMatch:d,score:d?f/this.chunks.length:1};return d&&r&&(p.indices=h),p}}class k{constructor(t){this.pattern=t}static isMultiMatch(t){return tt(t,this.multiRegex)}static isSingleMatch(t){return tt(t,this.singleRegex)}search(){}}function tt(s,t){const e=s.match(t);return e?e[1]:null}class jt extends k{constructor(t){super(t)}static get type(){return"exact"}static get multiRegex(){return/^="(.*)"$/}static get singleRegex(){return/^=(.*)$/}search(t){const e=t===this.pattern;return{isMatch:e,score:e?0:1,indices:[0,this.pattern.length-1]}}}class Bt extends k{constructor(t){super(t)}static get type(){return"inverse-exact"}static get multiRegex(){return/^!"(.*)"$/}static get singleRegex(){return/^!(.*)$/}search(t){const r=t.indexOf(this.pattern)===-1;return{isMatch:r,score:r?0:1,indices:[0,t.length-1]}}}class Ht extends k{constructor(t){super(t)}static get type(){return"prefix-exact"}static get multiRegex(){return/^\^"(.*)"$/}static get singleRegex(){return/^\^(.*)$/}search(t){const e=t.startsWith(this.pattern);return{isMatch:e,score:e?0:1,indices:[0,this.pattern.length-1]}}}class Ut extends k{constructor(t){super(t)}static get type(){return"inverse-prefix-exact"}static get multiRegex(){return/^!\^"(.*)"$/}static get singleRegex(){return/^!\^(.*)$/}search(t){const e=!t.startsWith(this.pattern);return{isMatch:e,score:e?0:1,indices:[0,t.length-1]}}}class Wt extends k{constructor(t){super(t)}static get type(){return"suffix-exact"}static get multiRegex(){return/^"(.*)"\$$/}static get singleRegex(){return/^(.*)\$$/}search(t){const e=t.endsWith(this.pattern);return{isMatch:e,score:e?0:1,indices:[t.length-this.pattern.length,t.length-1]}}}class Vt extends k{constructor(t){super(t)}static get type(){return"inverse-suffix-exact"}static get multiRegex(){return/^!"(.*)"\$$/}static get singleRegex(){return/^!(.*)\$$/}search(t){const e=!t.endsWith(this.pattern);return{isMatch:e,score:e?0:1,indices:[0,t.length-1]}}}class ut extends k{constructor(t,{location:e=u.location,threshold:r=u.threshold,distance:i=u.distance,includeMatches:n=u.includeMatches,findAllMatches:o=u.findAllMatches,minMatchCharLength:c=u.minMatchCharLength,isCaseSensitive:a=u.isCaseSensitive,ignoreLocation:l=u.ignoreLocation}={}){super(t),this._bitapSearch=new ht(t,{location:e,threshold:r,distance:i,includeMatches:n,findAllMatches:o,minMatchCharLength:c,isCaseSensitive:a,ignoreLocation:l})}static get type(){return"fuzzy"}static get multiRegex(){return/^"(.*)"$/}static get singleRegex(){return/^(.*)$/}search(t){return this._bitapSearch.searchIn(t)}}class ft extends k{constructor(t){super(t)}static get type(){return"include"}static get multiRegex(){return/^'"(.*)"$/}static get singleRegex(){return/^'(.*)$/}search(t){let e=0,r;const i=[],n=this.pattern.length;for(;(r=t.indexOf(this.pattern,e))>-1;)e=r+n,i.push([r,e-1]);const o=!!i.length;return{isMatch:o,score:o?0:1,indices:i}}}const V=[jt,ft,Ht,Ut,Vt,Wt,Bt,ut],et=V.length,zt=/ +(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/,Kt="|";function Gt(s,t={}){return s.split(Kt).map(e=>{let r=e.trim().split(zt).filter(n=>n&&!!n.trim()),i=[];for(let n=0,o=r.length;n<o;n+=1){const c=r[n];let a=!1,l=-1;for(;!a&&++l<et;){const h=V[l];let f=h.isMultiMatch(c);f&&(i.push(new h(f,t)),a=!0)}if(!a)for(l=-1;++l<et;){const h=V[l];let f=h.isSingleMatch(c);if(f){i.push(new h(f,t));break}}}return i})}const Yt=new Set([ut.type,ft.type]);class Jt{constructor(t,{isCaseSensitive:e=u.isCaseSensitive,includeMatches:r=u.includeMatches,minMatchCharLength:i=u.minMatchCharLength,ignoreLocation:n=u.ignoreLocation,findAllMatches:o=u.findAllMatches,location:c=u.location,threshold:a=u.threshold,distance:l=u.distance}={}){this.query=null,this.options={isCaseSensitive:e,includeMatches:r,minMatchCharLength:i,findAllMatches:o,ignoreLocation:n,location:c,threshold:a,distance:l},this.pattern=e?t:t.toLowerCase(),this.query=Gt(this.pattern,this.options)}static condition(t,e){return e.useExtendedSearch}searchIn(t){const e=this.query;if(!e)return{isMatch:!1,score:1};const{includeMatches:r,isCaseSensitive:i}=this.options;t=i?t:t.toLowerCase();let n=0,o=[],c=0;for(let a=0,l=e.length;a<l;a+=1){const h=e[a];o.length=0,n=0;for(let f=0,d=h.length;f<d;f+=1){const p=h[f],{isMatch:g,indices:b,score:N}=p.search(t);if(g){if(n+=1,c+=N,r){const L=p.constructor.type;Yt.has(L)?o=[...o,...b]:o.push(b)}}else{c=0,n=0,o.length=0;break}}if(n){let f={isMatch:!0,score:c/n};return r&&(f.indices=o),f}}return{isMatch:!1,score:1}}}const z=[];function Xt(...s){z.push(...s)}function K(s,t){for(let e=0,r=z.length;e<r;e+=1){let i=z[e];if(i.condition(s,t))return new i(s,t)}return new ht(s,t)}const j={AND:"$and",OR:"$or"},G={PATH:"$path",PATTERN:"$val"},Y=s=>!!(s[j.AND]||s[j.OR]),Qt=s=>!!s[G.PATH],Zt=s=>!y(s)&&ct(s)&&!Y(s),st=s=>({[j.AND]:Object.keys(s).map(t=>({[t]:s[t]}))});function dt(s,t,{auto:e=!0}={}){const r=i=>{let n=Object.keys(i);const o=Qt(i);if(!o&&n.length>1&&!Y(i))return r(st(i));if(Zt(i)){const a=o?i[G.PATH]:n[0],l=o?i[G.PATTERN]:i[a];if(!x(l))throw new Error(Lt(a));const h={keyId:W(a),pattern:l};return e&&(h.searcher=K(l,t)),h}let c={children:[],operator:n[0]};return n.forEach(a=>{const l=i[a];y(l)&&l.forEach(h=>{c.children.push(r(h))})}),c};return Y(s)||(s=st(s)),r(s)}function qt(s,{ignoreFieldNorm:t=u.ignoreFieldNorm}){s.forEach(e=>{let r=1;e.matches.forEach(({key:i,norm:n,score:o})=>{const c=i?i.weight:null;r*=Math.pow(o===0&&c?Number.EPSILON:o,(c||1)*(t?1:n))}),e.score=r})}function te(s,t){const e=s.matches;t.matches=[],m(e)&&e.forEach(r=>{if(!m(r.indices)||!r.indices.length)return;const{indices:i,value:n}=r;let o={indices:i,value:n};r.key&&(o.key=r.key.src),r.idx>-1&&(o.refIndex=r.idx),t.matches.push(o)})}function ee(s,t){t.score=s.score}function se(s,t,{includeMatches:e=u.includeMatches,includeScore:r=u.includeScore}={}){const i=[];return e&&i.push(te),r&&i.push(ee),s.map(n=>{const{idx:o}=n,c={item:t[o],refIndex:o};return i.length&&i.forEach(a=>{a(n,c)}),c})}class T{constructor(t,e={},r){this.options={...u,...e},this.options.useExtendedSearch,this._keyStore=new vt(this.options.keys),this.setCollection(t,r)}setCollection(t,e){if(this._docs=t,e&&!(e instanceof J))throw new Error(xt);this._myIndex=e||lt(this.options.keys,this._docs,{getFn:this.options.getFn,fieldNormWeight:this.options.fieldNormWeight})}add(t){m(t)&&(this._docs.push(t),this._myIndex.add(t))}remove(t=()=>!1){const e=[];for(let r=0,i=this._docs.length;r<i;r+=1){const n=this._docs[r];t(n,r)&&(this.removeAt(r),r-=1,i-=1,e.push(n))}return e}removeAt(t){this._docs.splice(t,1),this._myIndex.removeAt(t)}getIndex(){return this._myIndex}search(t,{limit:e=-1}={}){const{includeMatches:r,includeScore:i,shouldSort:n,sortFn:o,ignoreFieldNorm:c}=this.options;let a=x(t)?x(this._docs[0])?this._searchStringList(t):this._searchObjectList(t):this._searchLogical(t);return qt(a,{ignoreFieldNorm:c}),n&&a.sort(o),nt(e)&&e>-1&&(a=a.slice(0,e)),se(a,this._docs,{includeMatches:r,includeScore:i})}_searchStringList(t){const e=K(t,this.options),{records:r}=this._myIndex,i=[];return r.forEach(({v:n,i:o,n:c})=>{if(!m(n))return;const{isMatch:a,score:l,indices:h}=e.searchIn(n);a&&i.push({item:n,idx:o,matches:[{score:l,value:n,norm:c,indices:h}]})}),i}_searchLogical(t){const e=dt(t,this.options),r=(c,a,l)=>{if(!c.children){const{keyId:f,searcher:d}=c,p=this._findMatches({key:this._keyStore.get(f),value:this._myIndex.getValueForItemAtKeyId(a,f),searcher:d});return p&&p.length?[{idx:l,item:a,matches:p}]:[]}const h=[];for(let f=0,d=c.children.length;f<d;f+=1){const p=c.children[f],g=r(p,a,l);if(g.length)h.push(...g);else if(c.operator===j.AND)return[]}return h},i=this._myIndex.records,n={},o=[];return i.forEach(({$:c,i:a})=>{if(m(c)){let l=r(e,c,a);l.length&&(n[a]||(n[a]={idx:a,item:c,matches:[]},o.push(n[a])),l.forEach(({matches:h})=>{n[a].matches.push(...h)}))}}),o}_searchObjectList(t){const e=K(t,this.options),{keys:r,records:i}=this._myIndex,n=[];return i.forEach(({$:o,i:c})=>{if(!m(o))return;let a=[];r.forEach((l,h)=>{a.push(...this._findMatches({key:l,value:o[h],searcher:e}))}),a.length&&n.push({idx:c,item:o,matches:a})}),n}_findMatches({key:t,value:e,searcher:r}){if(!m(e))return[];let i=[];if(y(e))e.forEach(({v:n,i:o,n:c})=>{if(!m(n))return;const{isMatch:a,score:l,indices:h}=r.searchIn(n);a&&i.push({score:l,key:t,value:n,idx:o,norm:c,indices:h})});else{const{v:n,n:o}=e,{isMatch:c,score:a,indices:l}=r.searchIn(n);c&&i.push({score:a,key:t,value:n,norm:o,indices:l})}return i}}T.version="7.0.0";T.createIndex=lt;T.parseIndex=$t;T.config=u;T.parseQuery=dt;Xt(Jt);function I(){if(!this._list&&(this._list=this.querySelector('[slot="list"] [data-list]'),this._list||(this._list=this.querySelector('[slot="list"]')),!this._list))throw new Error("List element not found")}function S(){if(this._input)return;const s=this.querySelector('[slot="input"]');if(!s)throw new Error("Input element not found");this._input=s}function it(){this._originalList||(I.call(this),this._originalList=this._list.cloneNode(!0))}function ie(){this._input.id=this._input.id.length!==0?this._input.id:`input-${crypto.randomUUID()}`,this._list.id=this._list.id.length!==0?this._list.id:`list-${crypto.randomUUID()}`,this._input.setAttribute("role","combobox"),this._input.setAttribute("aria-controls",this._list.id),this._input.setAttribute("aria-expanded","false"),this._input.setAttribute("aria-autocomplete","list"),this._input.setAttribute("autocomplete","off"),this._list.setAttribute("role","listbox"),this._list.setAttribute("aria-multiselectable","false"),this._list.setAttribute("anchor",this._input.id),this._list.tabIndex=-1;const s=this._list.children;for(let t=0;t<s.length;t++){const e=s[t];e.setAttribute("role","option"),e.setAttribute("aria-selected","false"),e.tabIndex=-1}}var _=(s=>(s.ArrowDown="ArrowDown",s.ArrowUp="ArrowUp",s.ArrowRight="ArrowRight",s.ArrowLeft="ArrowLeft",s.Home="Home",s.End="End",s.Backspace="Backspace",s.Delete="Delete",s.Escape="Escape",s.Enter="Enter",s.Alt="Alt",s))(_||{});function re(s){this._input||S.call(this),this._list||I.call(this);const t=()=>this._input.getAttribute("aria-expanded")==="true";switch(s.key){case _.ArrowDown:t()?this.focusItem(this._list.children[0]):(this.toggleList(!0),this._isAltModifierPressed||this.focusItem(this._list.children[0])),s.preventDefault();break;case _.ArrowUp:t()&&this.focusItem(this._list.children[this._list.children.length-1]),s.preventDefault();break;case _.Escape:t()?this.toggleList(!1):this._input.value="",this._input.focus();break;case _.Enter:t()&&this.selectItem(this._list.children[0]);break;case _.Alt:this._isAltModifierPressed=!0;break}}function ne(s){this._input||S.call(this),this._list||I.call(this);const t=s.target;switch(s.key){case _.Enter:this.selectItem(t);break;case _.Escape:this.clearInput();break;case _.ArrowDown:{const e=t.nextElementSibling;e?this.focusItem(e):this.focusItem(this._list.children[0]),s.preventDefault();break}case _.ArrowUp:{if(this._isAltModifierPressed){this._input.focus(),this.toggleList(!1),s.preventDefault();break}const e=t.previousElementSibling;e?this.focusItem(e):this.focusItem(this._list.children[this._list.children.length-1]),s.preventDefault();break}case _.ArrowRight:this._input.focus();break;case _.ArrowLeft:this._input.focus();break;case _.Home:this._input.focus();break;case _.End:this._input.focus();break;case _.Backspace:this._input.focus();break;case _.Delete:this._input.focus();break;case _.Alt:this._isAltModifierPressed=!0;break;default:this._input.focus();break}}function rt(s){switch(s.key){case"Alt":this._isAltModifierPressed=!1;break}}function ce(){setTimeout(()=>{this.querySelector(":focus")||(this.forceValue(),this.toggleList(!1))},0)}class oe extends HTMLElement{constructor(){super(...arguments);M(this,"_input",null);M(this,"_list",null);M(this,"_originalList",null);M(this,"_isAltModifierPressed",!1);M(this,"_forceValue",!1);M(this,"_lastValue");M(this,"_limit",1/0);M(this,"_fuse",null);M(this,"_fuseOptions",{includeScore:!0,keys:["dataset.display","dataset.value","innerText"]});M(this,"abortController",new AbortController)}static get observedAttributes(){return["data-value","data-fuse-options","data-listbox","data-limit"]}attributeChangedCallback(e,r,i){if(r!==i)switch(e){case"data-value":this.selectItemByValue(i,!1);break;case"data-fuse-options":if(!this._fuse){this._fuseOptions=JSON.parse(i);return}it.call(this),this._fuseOptions=JSON.parse(i),this._fuse=new T(Array.from(this._originalList.cloneNode(!0).children),this._fuseOptions),this.searchList();break;case"data-listbox":this._forceValue=!!i;break;case"data-limit":this._limit=parseInt(i);break}}connectedCallback(){const e=this.attachShadow({mode:"open"});e.innerHTML=`
        <slot name="input"></slot>
        <slot name="list"></slot>
        `,S.call(this),I.call(this),ie.call(this),it.call(this),this._fuse=new T(Array.from(this._originalList.cloneNode(!0).children),this._fuseOptions),this.searchList(),this.addEventListeners(),this.forceValue()}disconnectedCallback(){}addEventListeners(){this.addEventListener("focusout",ce.bind(this),{signal:this.abortController.signal}),this._input||S.call(this),this._input.addEventListener("input",this.searchList.bind(this,!0,!0),{signal:this.abortController.signal}),this._input.addEventListener("focus",this.toggleList.bind(this,!0),{signal:this.abortController.signal}),this._input.addEventListener("keydown",re.bind(this),{signal:this.abortController.signal}),this._input.addEventListener("keyup",rt.bind(this),{signal:this.abortController.signal}),this.addEventListenersToListItems()}addEventListenersToListItems(){this._list||I.call(this);const e=this._list.children;for(let r=0;r<e.length;r++){const i=e[r];i.addEventListener("keydown",ne.bind(this),{signal:this.abortController.signal}),i.addEventListener("keyup",rt.bind(this),{signal:this.abortController.signal}),i.addEventListener("click",this.selectItem.bind(this,i,!0),{signal:this.abortController.signal})}}searchList(e=!0,r=!0){if(!this._fuse)throw new Error("Fuse object not found");if(this._list||I.call(this),this._input||S.call(this),r&&(this.dataset.value="",this.sendChangeEvent()),this._input.value===""){this._list.innerHTML="",this._list.append(...Array.from(this._originalList.cloneNode(!0).children).slice(0,this._limit).sort((c,a)=>Number(a.dataset.weight)-Number(c.dataset.weight))),this.addEventListenersToListItems();return}let i=this._fuse.search(this._input.value).slice(0,this._limit);i=i.map(c=>({item:c.item,score:c.score??1,weight:Number(c.item.dataset.weight??1),refIndex:c.refIndex})).sort((c,a)=>c.score*(a.weight/c.weight)-a.score*(c.weight/a.weight)).map(c=>({item:c.item,score:c.score,weight:c.weight,refIndex:c.refIndex}));const n=i.map(c=>c.item);this._list.innerHTML="",this._list.append(...n.map(c=>c.cloneNode(!0)));const o=c=>{var a,l;if(c.nodeType===Node.TEXT_NODE&&((a=c.textContent)==null?void 0:a.trim())!==""&&((l=c.textContent)==null?void 0:l.trim())!==`
`){const h=c.textContent??"",f=document.createElement("template");f.innerHTML=this.highlightText(h,this._input.value),c.replaceWith(f.content)}else for(const h of c.childNodes)o(h)};for(const c of this._list.children)o(c);this.addEventListenersToListItems(),this.toggleList(e)}highlightText(e,r){const i=new RegExp(`[${r}]+`,"gmi");return e.replace(i,"<strong>$&</strong>")}toggleList(e=this._input.getAttribute("aria-expanded")!=="true"){this._input.setAttribute("aria-expanded",`${e}`),e||this.unfocusAllItems()}focusItem(e){e&&(this.unfocusAllItems(),e.focus(),e.setAttribute("aria-selected","true"))}unfocusAllItems(){this._list||I.call(this);for(const e of this._list.querySelectorAll("[aria-selected]"))e.removeAttribute("aria-selected")}selectItem(e,r=!0){this._input||S.call(this),e.dataset.display?this._input.value=e.dataset.display:e.children.length||Array.from(e.children).every(i=>i.nodeName==="STRONG")?this._input.value=e.innerText:e.dataset.value?this._input.value=e.dataset.value:this._input.value="",e.dataset.value&&(this.dataset.value=e.dataset.value),r&&this._input.focus(),this.toggleList(!1),this.searchList(!1,!1),this.sendChangeEvent()}selectItemByValue(e,r=!0){if(!e)return;this._list||I.call(this);const i=this._list.querySelector(`[data-value="${e}"]`);i&&this.selectItem(i,r)}clearInput(e=!0){this._input||S.call(this),this._input.value="",e&&this._input.focus(),this.toggleList(!1)}forceValue(){var e;if(this._input||S.call(this),this._list||I.call(this),this._forceValue&&((e=this._input)!=null&&e.value)&&!this.dataset.value){const r=this._list.children[0];r?this.selectItem(r,!1):(this.clearInput(!1),this.dataset.value="",this.sendChangeEvent())}}sendChangeEvent(){if(this.dataset.value===this._lastValue)return;const e=new Event("change");this.dispatchEvent(e),this._lastValue=this.dataset.value}}customElements.define("combobox-framework",oe);
