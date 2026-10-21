const fs=require('fs'),vm=require('vm'),assert=require('assert');
const nodes=new Map();function node(id){if(!nodes.has(id))nodes.set(id,{value:({year:'2024',source:'All sources',sector:'All sectors',unit:'PJ',role:'Viewer'})[id]||'',innerHTML:'',textContent:'',style:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){},showModal(){},close(){}});return nodes.get(id)}
const context={document:{querySelector:node,querySelectorAll:()=>[]},location:{hash:''},window:{addEventListener(){}},console,Date,URL,Blob,setTimeout};
for(const id of ['year','source','sector','unit','role']){const n=node(id);nodes.set('#'+id,n)}
vm.createContext(context);vm.runInContext(fs.readFileSync('dist/app.js','utf8'),context);
function run(code){return vm.runInContext(code,context)}
assert.equal(run('total()'),450);assert.equal(run('bySource().reduce((s,r)=>s+r.value,0)'),450);assert.equal(run('bySector().reduce((s,r)=>s+r.value,0)'),450);
run("$('#source').value='Petroleum';$('#sector').value='Transport'");assert.equal(run('total()'),150);
run("$('#unit').value='GWh'");assert(Math.abs(run('factor()')-277.7777778)<1e-8);
run("$('#source').value='All sources';$('#sector').value='All sectors';$('#unit').value='PJ'");
for(const p of ['overview','balance','electricity','petroleum','coal','biomass','economic','emissions','buildings','submissions','review','reports','admin']){run(`page='${p}';$('#role').value='Administrator';render()`);const html=node('#content').innerHTML;assert(html.length>100,p);assert(!/NaN|undefined/.test(html),p+' invalid render')}
console.log('Passed: totals reconcile, filters, conversion, and 13 route renders. DOM stub checks; browser QA still required.');
