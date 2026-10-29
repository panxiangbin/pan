import * as THREE from "./vendor/three.module.js";
import {OrbitControls} from "./vendor/OrbitControls.js";

// 可重复生成的近似20°渐开线轮廓；为演示几何和运动，非加工级CAD齿形。
const METAL={
  driver:0xcf9355,
  idler:0x65a8ab,
  output:0x4d75a5,
  compound:0x83aa75,
};
const radians=Math.PI/180;
function inv(r,rb){
  if(r<=rb)return 0;
  const alpha=Math.acos(Math.min(1,rb/r));
  return Math.tan(alpha)-alpha;
}
function polar(r,a){return [r*Math.cos(a),r*Math.sin(a)];}
function outline(z,m=2){
  const pitch=z*m/2,root=pitch-1.25*m,base=pitch*Math.cos(20*radians),tip=pitch+m;
  const startr=Math.max(root,base),pitchInv=inv(pitch,base),halfp=Math.PI/(2*z);
  const shape=new THREE.Shape();
  let first=true;
  const point=(r,a)=>{
    const [x,y]=polar(r,a);
    if(first){shape.moveTo(x,y);first=false;}else shape.lineTo(x,y);
  };
  for(let i=0;i<z;i++){
    const phi=i*2*Math.PI/z;
    const atRoot=halfp-(inv(startr,base)-pitchInv);
    point(root,phi-atRoot-.009);
    for(let j=0;j<=5;j++){
      const rr=startr+(tip-startr)*j/5;
      const a=phi-halfp+(inv(rr,base)-pitchInv);
      point(rr,a);
    }
    const atTip=halfp-(inv(tip,base)-pitchInv);
    for(let j=1;j<=3;j++)point(tip,phi-atTip+2*atTip*j/3);
    for(let j=5;j>=0;j--){
      const rr=startr+(tip-startr)*j/5;
      point(rr,phi+halfp-(inv(rr,base)-pitchInv));
    }
    point(root,phi+atRoot+.009);
    point(root,phi+Math.PI/z);
  }
  shape.closePath();return shape;
}
function makeText(label){
  const c=document.createElement("canvas");c.width=360;c.height=86;
  const ctx=c.getContext("2d");ctx.fillStyle="rgba(16,41,45,.93)";
  const x=0,y=4,w=360,h=72,r=15;
  ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();
  ctx.fillStyle="#fff";
  ctx.font="bold 29px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(label,180,40);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
  const mat=new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true});
  const spr=new THREE.Sprite(mat);
  spr.scale.set(49,11.7,1);return spr;
}
function cylinder(radius,height,material,x,y,z){
  const o=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,32),material);
  o.rotation.x=Math.PI/2;o.position.set(x,y,z);return o;
}
function line(a,b,color=0xc6d6d4){
  const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a),new THREE.Vector3(...b)]);
  return new THREE.Line(g,new THREE.LineBasicMaterial({color,transparent:true,opacity:.42}));
}
function gear(z,m,color,role,label){
  const group=new THREE.Group();
  const mat=new THREE.MeshStandardMaterial({color,metalness:.7,roughness:.29,flatShading:false,side:THREE.DoubleSide});
  const sh=outline(z,m);
  const geom=new THREE.ExtrudeGeometry(sh,{depth:5.8,steps:1,bevelEnabled:true,bevelThickness:.24,bevelSize:.24,bevelSegments:2,curveSegments:5});
  geom.computeVertexNormals();
  const body=new THREE.Mesh(geom,mat);
  body.castShadow=true;body.receiveShadow=true;group.add(body);
  const hubMat=new THREE.MeshStandardMaterial({color:0xdbe7e7,roughness:.21,metalness:.75});
  const hub=cylinder(Math.max(6,z*m*.1),8.4,hubMat,0,0,3);hub.castShadow=true;group.add(hub);
  const top=cylinder(Math.max(3,z*m*.052),.9,new THREE.MeshStandardMaterial({color:0x233b43,roughness:.22,metalness:.75}),0,0,7.4);
  group.add(top);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(z*m/2,.21,5,90),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.43}));
  ring.position.z=6.23;group.add(ring);
  const boltMat=new THREE.MeshStandardMaterial({color:0x3e5055,metalness:.6,roughness:.33});
  for(let j=0;j<5;j++){
    const a=j*Math.PI*2/5,rr=Math.max(7,z*m*.075);
    group.add(cylinder(1.05,.9,boltMat,rr*Math.cos(a),rr*Math.sin(a),7.6));
  }
  group.userData={teeth:z,role,label};return group;
}
export class GearViewer{
 constructor(host, {onError}={}){
   this.host=host;this.onError=onError||(()=>{});
   this.ready=false;this.running=false;this.parts=[];this.refs=[];this.shafts=[];
   this.clock=new THREE.Clock();this.frame=0;
   try{
     this.scene=new THREE.Scene();
     this.scene.background=new THREE.Color(0xf0f6f3);
     this.scene.fog=new THREE.Fog(0xf0f6f3,410,650);
     this.camera=new THREE.PerspectiveCamera(35,1,1,1200);
     this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:"high-performance"});
     this.renderer.outputColorSpace=THREE.SRGBColorSpace;
     this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.32;
     this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
     this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
     this.renderer.domElement.setAttribute("aria-label","可用鼠标拖动自由旋转的三维齿轮传动装置");
     host.appendChild(this.renderer.domElement);
     this.controls=new OrbitControls(this.camera,this.renderer.domElement);
     this.controls.enableDamping=true;this.controls.dampingFactor=.08;
     this.controls.enablePan=false;this.controls.minDistance=130;this.controls.maxDistance=520;
     this.controls.minPolarAngle=.18;this.controls.maxPolarAngle=Math.PI/2.02;
     this.controls.autoRotate=false;
     const ambient=new THREE.HemisphereLight(0xffffff,0x729a98,2.25);this.scene.add(ambient);
     const light=new THREE.DirectionalLight(0xfff6e8,3.3);
     light.position.set(-95,-125,230);light.castShadow=true;
     light.shadow.mapSize.set(1024,1024);
     light.shadow.camera.left=-235;light.shadow.camera.right=235;
     light.shadow.camera.top=235;light.shadow.camera.bottom=-235;
     light.shadow.camera.near=10;light.shadow.camera.far=500;
     light.shadow.bias=-.00008;this.scene.add(light);
     const fill=new THREE.DirectionalLight(0xd5edf7,1.55);
     fill.position.set(130,100,130);this.scene.add(fill);
     this.world=new THREE.Group();this.scene.add(this.world);
     this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(host);
     this.ready=true;this.resize();this.animate();
   }catch(error){
     this.host.innerHTML='<div class="webgl-fallback">当前设备无法打开三维视图。可以继续使用下方控制器排故；三维视图仅用于辅助理解。</div>';
     this.onError(String(error));this.ready=false;
   }
 }
 resetWorld(){
   for(const child of [...this.world.children]){
     this.world.remove(child);
     child.traverse(o=>{
       if(o.geometry)o.geometry.dispose();
       if(o.material){
         const mats=Array.isArray(o.material)?o.material:[o.material];
         for(const m of mats){m.map?.dispose();m.dispose();}
       }
     });
   }
   this.parts=[];this.refs=[];this.shafts=[];
 }
 setConfig(task,config){
   this.task=task;this.config={...config};this.metrics=null;this.running=false;
   if(!this.ready)return;
   this.resetWorld();
   const m=2,zA=task.inputZ,compound=task.kind==="compound";
   const teeth=compound?[zA,config.zB,config.zC,config.zOut]:
     config.idler?[zA,config.zMid,config.zOut]:[zA,config.zOut];
   const meshes=teeth.length;
   const xPositions=[];
   if(compound){
     const ab=(zA+config.zB)*m/2,cd=(config.zC+config.zOut)*m/2;
     xPositions.push(0,ab,ab,ab+cd);
   }else{
     xPositions.push(0);
     for(let i=1;i<teeth.length;i++)xPositions.push(xPositions[i-1]+(teeth[i-1]+teeth[i])*m/2);
   }
   const zs=compound?[16,16,38,38]:teeth.map(()=>19);
   const colors=compound?[METAL.driver,METAL.idler,METAL.compound,METAL.output]:
     meshes===3?[METAL.driver,METAL.idler,METAL.output]:[METAL.driver,METAL.output];
   const width=xPositions[xPositions.length-1];
   const steel=new THREE.MeshStandardMaterial({color:0x233d49,metalness:.65,roughness:.35});
   const plateMat=new THREE.MeshStandardMaterial({color:0xc4d4d5,metalness:.4,roughness:.65});
   const base=new THREE.Mesh(new THREE.BoxGeometry(Math.max(170,width+68),117,5.5),plateMat);
   base.position.set(width/2,0,-5.2);base.receiveShadow=true;this.world.add(base);
   // In the housing, shafts are allowed to move along linear slots.
   const slotMat=new THREE.MeshStandardMaterial({color:0x7b9c9b,metalness:.4,roughness:.55});
   const slot=new THREE.Mesh(new THREE.BoxGeometry(Math.max(150,width+42),2,1),slotMat);
   slot.position.set(width/2,-43,-1.8);this.world.add(slot);
   const slot2=slot.clone();slot2.position.y=43;this.world.add(slot2);
   const uniqueX=[...new Set(xPositions.map(x=>Math.round(x*1e6)/1e6))];
   const ringMat=new THREE.MeshStandardMaterial({color:0x3d6264,metalness:.77,roughness:.32});
   for(const x of uniqueX){
     const bearing=cylinder(9,6,ringMat,x,0,1.5);
     bearing.receiveShadow=true;this.world.add(bearing);
     const support=cylinder(5.2,46,steel,x,0,13);
     support.castShadow=true;this.world.add(support);
     this.shafts.push(support);
   }
   // Gears are drawn from an approximate involute 20° profile.
   const names=compound?["A · 输入","B · 从动","C · 共轴","D · 输出"]:
     meshes===3?["A · 输入","I · 惰轮","B · 输出"]:["A · 输入","B · 输出"];
   for(let i=0;i<meshes;i++){
     const group=gear(teeth[i],m,colors[i],"gear",names[i]);
     const x=xPositions[i],z=zs[i];
     group.position.set(x,0,z);
     // alternating half a pitch improves tooth-to-tooth visual meshing.
     if(i%2)group.rotation.z=Math.PI/teeth[i];
     this.world.add(group);
     this.parts.push({object:group,z:teeth[i],role:names[i],base:group.rotation.z});
     const label=makeText(names[i]+" · "+teeth[i]+"T");
     label.position.set(x,-(teeth[i]*m/2+18),z+3);
     this.world.add(label);
   }
   this.world.add(line([-35,0,10],[width+35,0,10],0x86b3a3));
   const center=width/2;
   this.controls.target.set(center,0,15);
   const distance=Math.max(210,width*1.65);
   this.camera.position.set(center+distance*.55,-distance*1.05,distance*.72);
   this.camera.lookAt(this.controls.target);
   this.controls.minDistance=Math.max(100,width*.6);
   this.controls.maxDistance=Math.max(350,width*3.1);
   this.controls.update();this.resize();
 }
 setRunning(yes,metrics){
   this.running=!!yes;
   this.metrics=metrics||this.metrics;
 }
 animate(){
   if(!this.ready)return;
   const delta=Math.min(this.clock.getDelta(),.045);
   if(this.running && this.metrics?.levels){
     // 统一减速演示：角速度严格按齿数反比与正负方向转动。
     for(let i=0;i<this.parts.length;i++){
       const lev=this.metrics.levels[i];
       if(!lev)continue;
       this.parts[i].object.rotation.z+=-lev.dir*lev.rpm*(Math.PI*2/60)*delta*.11;
     }
   }
   this.controls.update();
   this.renderer.render(this.scene,this.camera);
   this.frame=requestAnimationFrame(()=>this.animate());
 }
 resize(){
   if(!this.ready)return;
   const w=Math.max(40,this.host.clientWidth),h=Math.max(200,this.host.clientHeight);
   this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();
 }
 dispose(){
   if(this.frame)cancelAnimationFrame(this.frame);
   this.observer?.disconnect();this.controls?.dispose();if(this.world)this.resetWorld();
   this.renderer?.dispose();
 }
}
