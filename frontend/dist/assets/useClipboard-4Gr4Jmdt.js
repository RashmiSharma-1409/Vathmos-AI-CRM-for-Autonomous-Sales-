import{c as l,j as e,e as x,h as m,i as u,r as y,z as f}from"./index-BO-Uhd5N.js";import{C as j}from"./card-s0Dn0NK0.js";/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=[["path",{d:"M18 6 7 17l-5-5",key:"116fxf"}],["path",{d:"m22 10-7.5 7.5L13 16",key:"ke71qq"}]],k=l("check-check",N);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]],b=l("copy",w);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=[["path",{d:"M12 20h9",key:"t2du7b"}],["path",{d:"M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z",key:"1ykcvy"}],["path",{d:"m15 5 3 3",key:"1w25hb"}]],g=l("pencil-line",v);function C({className:t="",...s}){return e.jsx("textarea",{className:x("min-h-[140px] w-full rounded-2xl border border-line bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-accent-cyan/60 focus:bg-white/[0.08]",t),...s})}function A({title:t,subtitle:s,content:i,badges:c=[],editableValue:n,onEditableChange:r,onCopy:o,copied:d,className:p=""}){const h=typeof n=="string"&&typeof r=="function";return e.jsxs(j,{className:x("h-full",p),children:[e.jsxs("div",{className:"flex flex-wrap items-start justify-between gap-4",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-xs uppercase tracking-[0.28em] text-slate-500",children:"AI Output"}),e.jsx("h3",{className:"mt-2 font-display text-xl font-semibold text-white",children:t}),s?e.jsx("p",{className:"mt-2 text-sm text-slate-400",children:s}):null]}),e.jsxs("div",{className:"flex items-center gap-2",children:[c.map(a=>e.jsx(m,{tone:a.tone,children:a.label},a.label)),o?e.jsxs(u,{variant:"secondary",size:"sm",onClick:o,children:[d?e.jsx(k,{className:"mr-2 h-4 w-4"}):e.jsx(b,{className:"mr-2 h-4 w-4"}),d?"Copied":"Copy"]}):null]})]}),e.jsx("div",{className:"mt-5 rounded-[24px] border border-line bg-slate-950/40 p-4",children:h?e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-500",children:[e.jsx(g,{className:"h-4 w-4"}),"Editable version"]}),e.jsx(C,{value:n,onChange:a=>r(a.target.value)})]}):e.jsx("div",{className:"prose-ai whitespace-pre-wrap text-sm leading-7 text-slate-200",children:i||"No AI output yet."})})]})}function I(){const[t,s]=y.useState("");async function i(c,n="Copied to clipboard"){await navigator.clipboard.writeText(c),s(c),f.success(n),window.setTimeout(()=>s(""),1600)}return{copy:i,copiedValue:t}}export{A,I as u};
