import assert from 'node:assert/strict';
import {Thermal} from '../reactor_engine.mjs';
import {ALL_FIELDS,REACTOR_EXAMPLE,calculateReactorFull} from '../reactor_full.mjs';
import {VERSION} from '../core.mjs';

function near(actual,expected,label){
 assert.ok(Number.isFinite(actual)&&Math.abs(actual-expected)<1e-6,label+': '+actual+' vs '+expected);
}
assert.equal(VERSION,'0.6.0');
assert.equal(ALL_FIELDS.length,32);
assert.equal(REACTOR_EXAMPLE.heatLossFactor,20);
assert.deepEqual(ALL_FIELDS.slice(0,1),['vesselVolume']);
assert.ok(ALL_FIELDS.includes('heatLossFactor'));
const prev=Thermal.calculate(Thermal.defaults);
assert.equal(prev.ok,true);
const cur=calculateReactorFull(REACTOR_EXAMPLE);
assert.equal(cur.state,'ready');
near(cur.reactor.r.referenceMinutes,prev.referenceMinutes,'design time preserved');
near(cur.reactor.r.totalMJ,prev.totalMJ,'physical heat preserved');
near(cur.reactor.designHeatMJ,prev.totalMJ*1.2,'design heat default');
near(cur.reactor.heatLossMJ,prev.totalMJ*.2,'heat loss default');
const r10=calculateReactorFull({...REACTOR_EXAMPLE,heatLossFactor:10});
near(r10.reactor.heatLossMJ,prev.totalMJ*.1,'heat loss changed');
near(r10.reactor.designHeatMJ,prev.totalMJ*1.1,'total heat changed');
near(r10.reactor.r.referenceMinutes,prev.referenceMinutes,'budget time unchanged');
near(r10.reactor.r.lossMJ,prev.lossMJ,'physics unaffected');
const r0=calculateReactorFull({...REACTOR_EXAMPLE,heatLossFactor:0});
near(r0.reactor.heatLossMJ,0,'zero loss');
near(r0.reactor.designHeatMJ,prev.totalMJ,'total equal base when 0');
assert.equal(calculateReactorFull({...REACTOR_EXAMPLE,heatLossFactor:''}).state,'incomplete');
assert.equal(calculateReactorFull({...REACTOR_EXAMPLE,heatLossFactor:-1}).state,'blocked');
assert.equal(calculateReactorFull({...REACTOR_EXAMPLE,heatLossFactor:101}).state,'blocked');
assert.equal(cur.metrics.find(x=>x.label==='设计总热量').value,Number(cur.reactor.designHeatMJ.toPrecision(6)));
console.log('FUSUAN_V06_CORE: PASS 17 checks');
