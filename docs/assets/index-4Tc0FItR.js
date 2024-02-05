var lt=Object.defineProperty;var ut=(n,e,t)=>e in n?lt(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t;var y=(n,e,t)=>(ut(n,typeof e!="symbol"?e+"":e,t),t);(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))t(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&t(r)}).observe(document,{childList:!0,subtree:!0});function e(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function t(s){if(s.ep)return;s.ep=!0;const i=e(s);fetch(s.href,i)}})();function x(n){return Array.isArray?Array.isArray(n):st(n)==="[object Array]"}const ft=1/0;function dt(n){if(typeof n=="string")return n;let e=n+"";return e=="0"&&1/n==-ft?"-0":e}function pt(n){return n==null?"":dt(n)}function E(n){return typeof n=="string"}function tt(n){return typeof n=="number"}function gt(n){return n===!0||n===!1||_t(n)&&st(n)=="[object Boolean]"}function et(n){return typeof n=="object"}function _t(n){return et(n)&&n!==null}function _(n){return n!=null}function D(n){return!n.trim().length}function st(n){return n==null?n===void 0?"[object Undefined]":"[object Null]":Object.prototype.toString.call(n)}const mt="Incorrect 'index' type",Lt=n=>`Invalid value for key ${n}`,bt=n=>`Pattern length exceeds max of ${n}.`,yt=n=>`Missing ${n} property in key`,Et=n=>`Property 'weight' in key '${n}' must be a positive integer`,X=Object.prototype.hasOwnProperty;class It{constructor(e){this._keys=[],this._keyMap={};let t=0;e.forEach(s=>{let i=it(s);this._keys.push(i),this._keyMap[i.id]=i,t+=i.weight}),this._keys.forEach(s=>{s.weight/=t})}get(e){return this._keyMap[e]}keys(){return this._keys}toJSON(){return JSON.stringify(this._keys)}}function it(n){let e=null,t=null,s=null,i=1,r=null;if(E(n)||x(n))s=n,e=J(n),t=j(n);else{if(!X.call(n,"name"))throw new Error(yt("name"));const o=n.name;if(s=o,X.call(n,"weight")&&(i=n.weight,i<=0))throw new Error(Et(o));e=J(o),t=j(o),r=n.getFn}return{path:e,id:t,weight:i,src:s,getFn:r}}function J(n){return x(n)?n:n.split(".")}function j(n){return x(n)?n.join("."):n}function xt(n,e){let t=[],s=!1;const i=(r,o,c)=>{if(_(r))if(!o[c])t.push(r);else{let h=o[c];const a=r[h];if(!_(a))return;if(c===o.length-1&&(E(a)||tt(a)||gt(a)))t.push(pt(a));else if(x(a)){s=!0;for(let l=0,f=a.length;l<f;l+=1)i(a[l],o,c+1)}else o.length&&i(a,o,c+1)}};return i(n,E(e)?e.split("."):e,0),s?t:t[0]}const Mt={includeMatches:!1,findAllMatches:!1,minMatchCharLength:1},At={isCaseSensitive:!1,includeScore:!1,keys:[],shouldSort:!0,sortFn:(n,e)=>n.score===e.score?n.idx<e.idx?-1:1:n.score<e.score?-1:1},vt={location:0,threshold:.6,distance:100},wt={useExtendedSearch:!1,getFn:xt,ignoreLocation:!1,ignoreFieldNorm:!1,fieldNormWeight:1};var u={...At,...Mt,...vt,...wt};const kt=/[^ ]+/g;function St(n=1,e=3){const t=new Map,s=Math.pow(10,e);return{get(i){const r=i.match(kt).length;if(t.has(r))return t.get(r);const o=1/Math.pow(r,.5*n),c=parseFloat(Math.round(o*s)/s);return t.set(r,c),c},clear(){t.clear()}}}class z{constructor({getFn:e=u.getFn,fieldNormWeight:t=u.fieldNormWeight}={}){this.norm=St(t,3),this.getFn=e,this.isCreated=!1,this.setIndexRecords()}setSources(e=[]){this.docs=e}setIndexRecords(e=[]){this.records=e}setKeys(e=[]){this.keys=e,this._keysMap={},e.forEach((t,s)=>{this._keysMap[t.id]=s})}create(){this.isCreated||!this.docs.length||(this.isCreated=!0,E(this.docs[0])?this.docs.forEach((e,t)=>{this._addString(e,t)}):this.docs.forEach((e,t)=>{this._addObject(e,t)}),this.norm.clear())}add(e){const t=this.size();E(e)?this._addString(e,t):this._addObject(e,t)}removeAt(e){this.records.splice(e,1);for(let t=e,s=this.size();t<s;t+=1)this.records[t].i-=1}getValueForItemAtKeyId(e,t){return e[this._keysMap[t]]}size(){return this.records.length}_addString(e,t){if(!_(e)||D(e))return;let s={v:e,i:t,n:this.norm.get(e)};this.records.push(s)}_addObject(e,t){let s={i:t,$:{}};this.keys.forEach((i,r)=>{let o=i.getFn?i.getFn(e):this.getFn(e,i.path);if(_(o)){if(x(o)){let c=[];const h=[{nestedArrIndex:-1,value:o}];for(;h.length;){const{nestedArrIndex:a,value:l}=h.pop();if(_(l))if(E(l)&&!D(l)){let f={v:l,i:a,n:this.norm.get(l)};c.push(f)}else x(l)&&l.forEach((f,d)=>{h.push({nestedArrIndex:d,value:f})})}s.$[r]=c}else if(E(o)&&!D(o)){let c={v:o,n:this.norm.get(o)};s.$[r]=c}}}),this.records.push(s)}toJSON(){return{keys:this.keys,records:this.records}}}function nt(n,e,{getFn:t=u.getFn,fieldNormWeight:s=u.fieldNormWeight}={}){const i=new z({getFn:t,fieldNormWeight:s});return i.setKeys(n.map(it)),i.setSources(e),i.create(),i}function Nt(n,{getFn:e=u.getFn,fieldNormWeight:t=u.fieldNormWeight}={}){const{keys:s,records:i}=n,r=new z({getFn:e,fieldNormWeight:t});return r.setKeys(s),r.setIndexRecords(i),r}function $(n,{errors:e=0,currentLocation:t=0,expectedLocation:s=0,distance:i=u.distance,ignoreLocation:r=u.ignoreLocation}={}){const o=e/n.length;if(r)return o;const c=Math.abs(s-t);return i?o+c/i:c?1:o}function Ot(n=[],e=u.minMatchCharLength){let t=[],s=-1,i=-1,r=0;for(let o=n.length;r<o;r+=1){let c=n[r];c&&s===-1?s=r:!c&&s!==-1&&(i=r-1,i-s+1>=e&&t.push([s,i]),s=-1)}return n[r-1]&&r-s>=e&&t.push([s,r-1]),t}const S=32;function Tt(n,e,t,{location:s=u.location,distance:i=u.distance,threshold:r=u.threshold,findAllMatches:o=u.findAllMatches,minMatchCharLength:c=u.minMatchCharLength,includeMatches:h=u.includeMatches,ignoreLocation:a=u.ignoreLocation}={}){if(e.length>S)throw new Error(bt(S));const l=e.length,f=n.length,d=Math.max(0,Math.min(s,f));let p=r,g=d;const m=c>1||h,w=m?Array(f):[];let I;for(;(I=n.indexOf(e,g))>-1;){let L=$(e,{currentLocation:I,expectedLocation:d,distance:i,ignoreLocation:a});if(p=Math.min(L,p),g=I+l,m){let M=0;for(;M<l;)w[I+M]=1,M+=1}}g=-1;let O=[],k=1,C=l+f;const at=1<<l-1;for(let L=0;L<l;L+=1){let M=0,A=C;for(;M<A;)$(e,{errors:L,currentLocation:d+A,expectedLocation:d,distance:i,ignoreLocation:a})<=p?M=A:C=A,A=Math.floor((C-M)/2+M);C=A;let G=Math.max(1,d-A+1),K=o?f:Math.min(d+A,f)+l,T=Array(K+2);T[K+1]=(1<<L)-1;for(let b=K;b>=G;b-=1){let R=b-1,Y=t[n.charAt(R)];if(m&&(w[R]=+!!Y),T[b]=(T[b+1]<<1|1)&Y,L&&(T[b]|=(O[b+1]|O[b])<<1|1|O[b+1]),T[b]&at&&(k=$(e,{errors:L,currentLocation:R,expectedLocation:d,distance:i,ignoreLocation:a}),k<=p)){if(p=k,g=R,g<=d)break;G=Math.max(1,2*d-g)}}if($(e,{errors:L+1,currentLocation:d,expectedLocation:d,distance:i,ignoreLocation:a})>p)break;O=T}const F={isMatch:g>=0,score:Math.max(.001,k)};if(m){const L=Ot(w,c);L.length?h&&(F.indices=L):F.isMatch=!1}return F}function Ct(n){let e={};for(let t=0,s=n.length;t<s;t+=1){const i=n.charAt(t);e[i]=(e[i]||0)|1<<s-t-1}return e}class rt{constructor(e,{location:t=u.location,threshold:s=u.threshold,distance:i=u.distance,includeMatches:r=u.includeMatches,findAllMatches:o=u.findAllMatches,minMatchCharLength:c=u.minMatchCharLength,isCaseSensitive:h=u.isCaseSensitive,ignoreLocation:a=u.ignoreLocation}={}){if(this.options={location:t,threshold:s,distance:i,includeMatches:r,findAllMatches:o,minMatchCharLength:c,isCaseSensitive:h,ignoreLocation:a},this.pattern=h?e:e.toLowerCase(),this.chunks=[],!this.pattern.length)return;const l=(d,p)=>{this.chunks.push({pattern:d,alphabet:Ct(d),startIndex:p})},f=this.pattern.length;if(f>S){let d=0;const p=f%S,g=f-p;for(;d<g;)l(this.pattern.substr(d,S),d),d+=S;if(p){const m=f-S;l(this.pattern.substr(m),m)}}else l(this.pattern,0)}searchIn(e){const{isCaseSensitive:t,includeMatches:s}=this.options;if(t||(e=e.toLowerCase()),this.pattern===e){let g={isMatch:!0,score:0};return s&&(g.indices=[[0,e.length-1]]),g}const{location:i,distance:r,threshold:o,findAllMatches:c,minMatchCharLength:h,ignoreLocation:a}=this.options;let l=[],f=0,d=!1;this.chunks.forEach(({pattern:g,alphabet:m,startIndex:w})=>{const{isMatch:I,score:O,indices:k}=Tt(e,g,m,{location:i+w,distance:r,threshold:o,findAllMatches:c,minMatchCharLength:h,includeMatches:s,ignoreLocation:a});I&&(d=!0),f+=O,I&&k&&(l=[...l,...k])});let p={isMatch:d,score:d?f/this.chunks.length:1};return d&&s&&(p.indices=l),p}}class v{constructor(e){this.pattern=e}static isMultiMatch(e){return Q(e,this.multiRegex)}static isSingleMatch(e){return Q(e,this.singleRegex)}search(){}}function Q(n,e){const t=n.match(e);return t?t[1]:null}class Rt extends v{constructor(e){super(e)}static get type(){return"exact"}static get multiRegex(){return/^="(.*)"$/}static get singleRegex(){return/^=(.*)$/}search(e){const t=e===this.pattern;return{isMatch:t,score:t?0:1,indices:[0,this.pattern.length-1]}}}class $t extends v{constructor(e){super(e)}static get type(){return"inverse-exact"}static get multiRegex(){return/^!"(.*)"$/}static get singleRegex(){return/^!(.*)$/}search(e){const s=e.indexOf(this.pattern)===-1;return{isMatch:s,score:s?0:1,indices:[0,e.length-1]}}}class Pt extends v{constructor(e){super(e)}static get type(){return"prefix-exact"}static get multiRegex(){return/^\^"(.*)"$/}static get singleRegex(){return/^\^(.*)$/}search(e){const t=e.startsWith(this.pattern);return{isMatch:t,score:t?0:1,indices:[0,this.pattern.length-1]}}}class Ft extends v{constructor(e){super(e)}static get type(){return"inverse-prefix-exact"}static get multiRegex(){return/^!\^"(.*)"$/}static get singleRegex(){return/^!\^(.*)$/}search(e){const t=!e.startsWith(this.pattern);return{isMatch:t,score:t?0:1,indices:[0,e.length-1]}}}class Kt extends v{constructor(e){super(e)}static get type(){return"suffix-exact"}static get multiRegex(){return/^"(.*)"\$$/}static get singleRegex(){return/^(.*)\$$/}search(e){const t=e.endsWith(this.pattern);return{isMatch:t,score:t?0:1,indices:[e.length-this.pattern.length,e.length-1]}}}class Dt extends v{constructor(e){super(e)}static get type(){return"inverse-suffix-exact"}static get multiRegex(){return/^!"(.*)"\$$/}static get singleRegex(){return/^!(.*)\$$/}search(e){const t=!e.endsWith(this.pattern);return{isMatch:t,score:t?0:1,indices:[0,e.length-1]}}}class ct extends v{constructor(e,{location:t=u.location,threshold:s=u.threshold,distance:i=u.distance,includeMatches:r=u.includeMatches,findAllMatches:o=u.findAllMatches,minMatchCharLength:c=u.minMatchCharLength,isCaseSensitive:h=u.isCaseSensitive,ignoreLocation:a=u.ignoreLocation}={}){super(e),this._bitapSearch=new rt(e,{location:t,threshold:s,distance:i,includeMatches:r,findAllMatches:o,minMatchCharLength:c,isCaseSensitive:h,ignoreLocation:a})}static get type(){return"fuzzy"}static get multiRegex(){return/^"(.*)"$/}static get singleRegex(){return/^(.*)$/}search(e){return this._bitapSearch.searchIn(e)}}class ot extends v{constructor(e){super(e)}static get type(){return"include"}static get multiRegex(){return/^'"(.*)"$/}static get singleRegex(){return/^'(.*)$/}search(e){let t=0,s;const i=[],r=this.pattern.length;for(;(s=e.indexOf(this.pattern,t))>-1;)t=s+r,i.push([s,t-1]);const o=!!i.length;return{isMatch:o,score:o?0:1,indices:i}}}const B=[Rt,ot,Pt,Ft,Dt,Kt,$t,ct],Z=B.length,jt=/ +(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/,Bt="|";function Ut(n,e={}){return n.split(Bt).map(t=>{let s=t.trim().split(jt).filter(r=>r&&!!r.trim()),i=[];for(let r=0,o=s.length;r<o;r+=1){const c=s[r];let h=!1,a=-1;for(;!h&&++a<Z;){const l=B[a];let f=l.isMultiMatch(c);f&&(i.push(new l(f,e)),h=!0)}if(!h)for(a=-1;++a<Z;){const l=B[a];let f=l.isSingleMatch(c);if(f){i.push(new l(f,e));break}}}return i})}const Ht=new Set([ct.type,ot.type]);class Vt{constructor(e,{isCaseSensitive:t=u.isCaseSensitive,includeMatches:s=u.includeMatches,minMatchCharLength:i=u.minMatchCharLength,ignoreLocation:r=u.ignoreLocation,findAllMatches:o=u.findAllMatches,location:c=u.location,threshold:h=u.threshold,distance:a=u.distance}={}){this.query=null,this.options={isCaseSensitive:t,includeMatches:s,minMatchCharLength:i,findAllMatches:o,ignoreLocation:r,location:c,threshold:h,distance:a},this.pattern=t?e:e.toLowerCase(),this.query=Ut(this.pattern,this.options)}static condition(e,t){return t.useExtendedSearch}searchIn(e){const t=this.query;if(!t)return{isMatch:!1,score:1};const{includeMatches:s,isCaseSensitive:i}=this.options;e=i?e:e.toLowerCase();let r=0,o=[],c=0;for(let h=0,a=t.length;h<a;h+=1){const l=t[h];o.length=0,r=0;for(let f=0,d=l.length;f<d;f+=1){const p=l[f],{isMatch:g,indices:m,score:w}=p.search(e);if(g){if(r+=1,c+=w,s){const I=p.constructor.type;Ht.has(I)?o=[...o,...m]:o.push(m)}}else{c=0,r=0,o.length=0;break}}if(r){let f={isMatch:!0,score:c/r};return s&&(f.indices=o),f}}return{isMatch:!1,score:1}}}const U=[];function Wt(...n){U.push(...n)}function H(n,e){for(let t=0,s=U.length;t<s;t+=1){let i=U[t];if(i.condition(n,e))return new i(n,e)}return new rt(n,e)}const P={AND:"$and",OR:"$or"},V={PATH:"$path",PATTERN:"$val"},W=n=>!!(n[P.AND]||n[P.OR]),zt=n=>!!n[V.PATH],Gt=n=>!x(n)&&et(n)&&!W(n),q=n=>({[P.AND]:Object.keys(n).map(e=>({[e]:n[e]}))});function ht(n,e,{auto:t=!0}={}){const s=i=>{let r=Object.keys(i);const o=zt(i);if(!o&&r.length>1&&!W(i))return s(q(i));if(Gt(i)){const h=o?i[V.PATH]:r[0],a=o?i[V.PATTERN]:i[h];if(!E(a))throw new Error(Lt(h));const l={keyId:j(h),pattern:a};return t&&(l.searcher=H(a,e)),l}let c={children:[],operator:r[0]};return r.forEach(h=>{const a=i[h];x(a)&&a.forEach(l=>{c.children.push(s(l))})}),c};return W(n)||(n=q(n)),s(n)}function Yt(n,{ignoreFieldNorm:e=u.ignoreFieldNorm}){n.forEach(t=>{let s=1;t.matches.forEach(({key:i,norm:r,score:o})=>{const c=i?i.weight:null;s*=Math.pow(o===0&&c?Number.EPSILON:o,(c||1)*(e?1:r))}),t.score=s})}function Xt(n,e){const t=n.matches;e.matches=[],_(t)&&t.forEach(s=>{if(!_(s.indices)||!s.indices.length)return;const{indices:i,value:r}=s;let o={indices:i,value:r};s.key&&(o.key=s.key.src),s.idx>-1&&(o.refIndex=s.idx),e.matches.push(o)})}function Jt(n,e){e.score=n.score}function Qt(n,e,{includeMatches:t=u.includeMatches,includeScore:s=u.includeScore}={}){const i=[];return t&&i.push(Xt),s&&i.push(Jt),n.map(r=>{const{idx:o}=r,c={item:e[o],refIndex:o};return i.length&&i.forEach(h=>{h(r,c)}),c})}class N{constructor(e,t={},s){this.options={...u,...t},this.options.useExtendedSearch,this._keyStore=new It(this.options.keys),this.setCollection(e,s)}setCollection(e,t){if(this._docs=e,t&&!(t instanceof z))throw new Error(mt);this._myIndex=t||nt(this.options.keys,this._docs,{getFn:this.options.getFn,fieldNormWeight:this.options.fieldNormWeight})}add(e){_(e)&&(this._docs.push(e),this._myIndex.add(e))}remove(e=()=>!1){const t=[];for(let s=0,i=this._docs.length;s<i;s+=1){const r=this._docs[s];e(r,s)&&(this.removeAt(s),s-=1,i-=1,t.push(r))}return t}removeAt(e){this._docs.splice(e,1),this._myIndex.removeAt(e)}getIndex(){return this._myIndex}search(e,{limit:t=-1}={}){const{includeMatches:s,includeScore:i,shouldSort:r,sortFn:o,ignoreFieldNorm:c}=this.options;let h=E(e)?E(this._docs[0])?this._searchStringList(e):this._searchObjectList(e):this._searchLogical(e);return Yt(h,{ignoreFieldNorm:c}),r&&h.sort(o),tt(t)&&t>-1&&(h=h.slice(0,t)),Qt(h,this._docs,{includeMatches:s,includeScore:i})}_searchStringList(e){const t=H(e,this.options),{records:s}=this._myIndex,i=[];return s.forEach(({v:r,i:o,n:c})=>{if(!_(r))return;const{isMatch:h,score:a,indices:l}=t.searchIn(r);h&&i.push({item:r,idx:o,matches:[{score:a,value:r,norm:c,indices:l}]})}),i}_searchLogical(e){const t=ht(e,this.options),s=(c,h,a)=>{if(!c.children){const{keyId:f,searcher:d}=c,p=this._findMatches({key:this._keyStore.get(f),value:this._myIndex.getValueForItemAtKeyId(h,f),searcher:d});return p&&p.length?[{idx:a,item:h,matches:p}]:[]}const l=[];for(let f=0,d=c.children.length;f<d;f+=1){const p=c.children[f],g=s(p,h,a);if(g.length)l.push(...g);else if(c.operator===P.AND)return[]}return l},i=this._myIndex.records,r={},o=[];return i.forEach(({$:c,i:h})=>{if(_(c)){let a=s(t,c,h);a.length&&(r[h]||(r[h]={idx:h,item:c,matches:[]},o.push(r[h])),a.forEach(({matches:l})=>{r[h].matches.push(...l)}))}}),o}_searchObjectList(e){const t=H(e,this.options),{keys:s,records:i}=this._myIndex,r=[];return i.forEach(({$:o,i:c})=>{if(!_(o))return;let h=[];s.forEach((a,l)=>{h.push(...this._findMatches({key:a,value:o[l],searcher:t}))}),h.length&&r.push({idx:c,item:o,matches:h})}),r}_findMatches({key:e,value:t,searcher:s}){if(!_(t))return[];let i=[];if(x(t))t.forEach(({v:r,i:o,n:c})=>{if(!_(r))return;const{isMatch:h,score:a,indices:l}=s.searchIn(r);h&&i.push({score:a,key:e,value:r,idx:o,norm:c,indices:l})});else{const{v:r,n:o}=t,{isMatch:c,score:h,indices:a}=s.searchIn(r);c&&i.push({score:h,key:e,value:r,norm:o,indices:a})}return i}}N.version="7.0.0";N.createIndex=nt;N.parseIndex=Nt;N.config=u;N.parseQuery=ht;Wt(Vt);class Zt extends HTMLElement{constructor(){super(...arguments);y(this,"_input",null);y(this,"_list",null);y(this,"_originalList",null);y(this,"_isAltModifierPressed",!1);y(this,"_forceValue",!1);y(this,"_lastValue");y(this,"_limit",1/0);y(this,"_fuse",null);y(this,"_fuseOptions",{includeScore:!0,keys:["dataset.display","dataset.value","innerText"]})}static get observedAttributes(){return["data-value","data-fuse-options","data-listbox","data-limit"]}attributeChangedCallback(t,s,i){if(s!==i)switch(t){case"data-value":this.selectItemByValue(i,!1);break;case"data-fuse-options":this._originalList||this.fetchOriginalList(),this._fuseOptions=JSON.parse(i),this._fuse=new N(Array.from(this._originalList.cloneNode(!0).children),this._fuseOptions),this.searchList();break;case"data-listbox":this._forceValue=!!i;break;case"data-limit":this._limit=parseInt(i);break}}connectedCallback(){const t=this.attachShadow({mode:"open"});t.innerHTML=`
        <slot name="input"></slot>
        <slot name="list"></slot>
        `,this.fetchInput(),this.fetchList(),this.setBasicAttribbutes(),this.fetchOriginalList(),this._fuse=new N(Array.from(this._originalList.cloneNode(!0).children),this._fuseOptions),this.searchList(),this.addEventListeners(),this.forceValue()}disconnectedCallback(){this.removeEventListener("focusout",this.handleBlur.bind(this)),this._input||this.fetchList(),this._input.removeEventListener("input",this.searchList.bind(this,!0,!0)),this._input.removeEventListener("focus",this.toggleList.bind(this,!0)),this._input.removeEventListener("keydown",this.handleComboBoxKeyPress.bind(this)),this._input.removeEventListener("keyup",this.handleKeyUp.bind(this)),this.removeEventListenersFromListItems()}fetchList(){if(this._list=this.querySelector('[slot="list"] [data-list]'),this._list||(this._list=this.querySelector('[slot="list"]')),!this._list)throw new Error("List element not found")}fetchInput(){if(this._input=this.querySelector('[slot="input"]'),!this._input)throw new Error("Input element not found")}fetchOriginalList(){this._list||this.fetchList(),this._originalList=this._list.cloneNode(!0)}removeEventListenersFromListItems(){this._list||this.fetchList();const t=this._list.children;for(let s=0;s<t.length;s++){const i=t[s];i.removeEventListener("keydown",this.handleListKeyPress.bind(this)),i.removeEventListener("keyup",this.handleKeyUp.bind(this)),i.removeEventListener("click",this.selectItem.bind(this,i,!0))}}setBasicAttribbutes(){this._input.id=this._input.id.length!==0?this._input.id:`input-${crypto.randomUUID()}`,this._list.id=this._list.id.length!==0?this._list.id:`list-${crypto.randomUUID()}`,this._input.setAttribute("role","combobox"),this._input.setAttribute("aria-controls",this._list.id),this._input.setAttribute("aria-expanded","false"),this._input.setAttribute("aria-autocomplete","list"),this._input.setAttribute("autocomplete","off"),this._list.setAttribute("role","listbox"),this._list.setAttribute("aria-multiselectable","false"),this._list.setAttribute("anchor",this._input.id),this._list.tabIndex=-1;const t=this._list.children;for(let s=0;s<t.length;s++){const i=t[s];i.setAttribute("role","option"),i.setAttribute("aria-selected","false"),i.tabIndex=-1}}addEventListeners(){this.addEventListener("focusout",this.handleBlur.bind(this)),this._input||this.fetchInput(),this._input.addEventListener("input",this.searchList.bind(this,!0,!0)),this._input.addEventListener("focus",this.toggleList.bind(this,!0)),this._input.addEventListener("keydown",this.handleComboBoxKeyPress.bind(this)),this._input.addEventListener("keyup",this.handleKeyUp.bind(this)),this.addEventListenersToListItems()}addEventListenersToListItems(){this._list||this.fetchList();const t=this._list.children;for(let s=0;s<t.length;s++){const i=t[s];i.addEventListener("keydown",this.handleListKeyPress.bind(this)),i.addEventListener("keyup",this.handleKeyUp.bind(this)),i.addEventListener("click",this.selectItem.bind(this,i,!0))}}searchList(t=!0,s=!0){if(!this._fuse)throw new Error("Fuse object not found");if(this._list||this.fetchList(),this._input||this.fetchInput(),s&&(this.dataset.value="",this.sendChangeEvent()),this._input.value===""){this._list.innerHTML="",this._list.append(...Array.from(this._originalList.cloneNode(!0).children).slice(0,this._limit).sort((c,h)=>Number(h.dataset.weight)-Number(c.dataset.weight))),this.addEventListenersToListItems();return}let i=this._fuse.search(this._input.value).slice(0,this._limit);i=i.map(c=>({item:c.item,score:c.score??1,weight:Number(c.item.dataset.weight??1),refIndex:c.refIndex})).sort((c,h)=>c.score*(h.weight/c.weight)-h.score*(c.weight/h.weight)).map(c=>({item:c.item,score:c.score,weight:c.weight,refIndex:c.refIndex}));const r=i.map(c=>c.item);this._list.innerHTML="",this._list.append(...r.map(c=>c.cloneNode(!0)));const o=c=>{var h,a;if(c.nodeType===Node.TEXT_NODE&&((h=c.textContent)==null?void 0:h.trim())!==""&&((a=c.textContent)==null?void 0:a.trim())!==`
`){const l=c.textContent??"",f=document.createElement("template");f.innerHTML=this.highlightText(l,this._input.value),c.replaceWith(f.content)}else for(const l of c.childNodes)o(l)};for(const c of this._list.children)o(c);this.addEventListenersToListItems(),this.toggleList(t)}highlightText(t,s){const i=new RegExp(`[${s}]+`,"gmi");return t.replace(i,"<strong>$&</strong>")}toggleList(t=this._input.getAttribute("aria-expanded")==="true"){this._input.setAttribute("aria-expanded",`${t}`),t||this.unfocusAllItems()}focusItem(t){t&&(t.focus(),this.unfocusAllItems(),t.setAttribute("aria-selected","true"))}unfocusAllItems(){this._list||this.fetchList();for(const t of this._list.querySelectorAll("[aria-selected]"))t.removeAttribute("aria-selected")}selectItem(t,s=!0){this._input||this.fetchInput(),t.dataset.display?this._input.value=t.dataset.display:t.children.length||Array.from(t.children).every(i=>i.nodeName==="STRONG")?this._input.value=t.innerText:t.dataset.value?this._input.value=t.dataset.value:this._input.value="",t.dataset.value&&(this.dataset.value=t.dataset.value),s&&this._input.focus(),this.toggleList(!1),this.searchList(!1,!1),this.sendChangeEvent()}sendChangeEvent(){if(this.dataset.value===this._lastValue)return;const t=new Event("change");this.dispatchEvent(t),this._lastValue=this.dataset.value}selectItemByValue(t,s=!0){if(!t)return;this._list||this.fetchList();const i=this._list.querySelector(`[data-value="${t}"]`);i&&this.selectItem(i,s)}clearInput(t=!0){this._input||this.fetchInput(),this._input.value="",t&&this._input.focus(),this.toggleList(!1)}handleBlur(){setTimeout(()=>{this.querySelector(":focus")||(this.forceValue(),this.toggleList(!1))},0)}forceValue(){var t;if(this._input||this.fetchInput(),this._list||this.fetchList(),this._forceValue&&((t=this._input)!=null&&t.value)&&!this.dataset.value){const s=this._list.children[0];s?this.selectItem(s,!1):(this.clearInput(!1),this.dataset.value="",this.sendChangeEvent())}}handleComboBoxKeyPress(t){switch(this._input||this.fetchInput(),this._list||this.fetchList(),t.key){case"ArrowDown":this._input.getAttribute("aria-expanded")!=="true"?(this.toggleList(!0),this._isAltModifierPressed||this.focusItem(this._list.children[0])):this.focusItem(this._list.children[0]),t.preventDefault();break;case"UpArrow":this._input.getAttribute("aria-expanded")!=="true"&&(this.toggleList(!0),this.focusItem(this._list.children[this._list.children.length-1])),t.preventDefault();break;case"Escape":this._input.getAttribute("aria-expanded")==="true"?this.toggleList(!1):this._input.value="",this._input.focus();break;case"Enter":this._input.getAttribute("aria-expanded")==="true"&&this.selectItem(this._list.children[0]);break;case"Alt":this._isAltModifierPressed=!0;break}}handleListKeyPress(t){this._input||this.fetchInput(),this._list||this.fetchList();const s=t.target;switch(t.key){case"Enter":this.selectItem(s);break;case"Escape":this.clearInput();break;case"ArrowDown":{const i=s.nextElementSibling;i?this.focusItem(i):this.focusItem(this._list.children[0]),t.preventDefault();break}case"ArrowUp":{if(this._isAltModifierPressed){this._input.focus(),this.toggleList(!1),t.preventDefault();break}const i=s.previousElementSibling;i?this.focusItem(i):this.focusItem(this._list.children[this._list.children.length-1]),t.preventDefault();break}case"ArrowRight":this._input.focus();break;case"ArrowLeft":this._input.focus();break;case"Home":this._input.focus();break;case"End":this._input.focus();break;case"Backspace":this._input.focus();break;case"Delete":this._input.focus();break;case"Alt":this._isAltModifierPressed=!0;break;default:this._input.focus();break}}handleKeyUp(t){switch(t.key){case"Alt":this._isAltModifierPressed=!1;break}}}customElements.define("combobox-framework",Zt);
