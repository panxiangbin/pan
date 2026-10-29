// 潜星计划 V2：机械结构探索的确定性物理模型和题本。
// 所有外啮合齿轮模数相同，简化为无打滑、忽略损失的平行轴刚体系统。
// 注意：这不是齿根强度、轴承载荷、接触应力或实际机器安全仿真。
export const MODULE_MM=2;
export const TASKS=[
  {
    id:"practice",phase:"practice",title:"检查传动装置",machine:"基础传动台",
    description:"先在三维设备中熟悉轴、齿数、传动方向和试运行按钮。这一轮不计入表现。",
    hint:"观察电机与输出轴的转向；试运行后可读取理想输出转速。",
    kind:"simple",motorRpm:120,motorDir:1,inputZ:24,
    initial:{zOut:48,zMid:24,idler:false},
    options:{zOut:[36,48,60],zMid:[18,24,30],idler:[false,true]},
    targetRpm:60,targetDir:-1,maxSpan:120,
  },
  {
    id:"baseline-speed",phase:"baseline",title:"故障一：输送线转得太慢",machine:"港区输送机构",
    description:"空载时实测输出转速偏低。输出轴安装在可调滑槽上，允许更换从动齿轮并重新定位轴心。",
    hint:"输入齿轮固定为20齿。只允许换列表中的标准齿轮，保持电机输入不变。",
    kind:"simple",motorRpm:150,motorDir:1,inputZ:20,
    initial:{zOut:50,zMid:24,idler:false},
    options:{zOut:[20,30,40,50,60],zMid:[18,24,36],idler:[false,true]},
    targetRpm:75,targetDir:-1,maxSpan:100,
  },
  {
    id:"baseline-direction",phase:"baseline",title:"故障二：出口反向",machine:"小型升降输送机",
    description:"速比已经符合要求，但执行端反向。请通过机构组合修复方向，不改变输入电机转向。",
    hint:"中间位置允许加装与主齿轮同模数的惰轮，安装位置可以随装配调整。",
    kind:"simple",motorRpm:160,motorDir:1,inputZ:24,
    initial:{zOut:48,zMid:24,idler:false},
    options:{zOut:[36,42,48,60],zMid:[18,24,30,42],idler:[false,true]},
    targetRpm:80,targetDir:1,maxSpan:145,
  },
  {
    id:"baseline-envelope",phase:"baseline",title:"故障三：机构装不进箱体",machine:"设备紧凑减速箱",
    description:"功能正常，但轴心总跨度超过壳体内滑轨长度。必须同时满足转速、转向和轴心跨度要求。",
    hint:"壳体只约束首尾轴心跨度。这里只计算理想节圆中心距，不计算真实外罩干涉。",
    kind:"simple",motorRpm:180,motorDir:1,inputZ:24,
    initial:{zOut:48,zMid:40,idler:true},
    options:{zOut:[36,42,48,54],zMid:[18,24,30,40],idler:[false,true]},
    targetRpm:90,targetDir:1,maxSpan:145,
  },
  {
    id:"after-speed",phase:"after",title:"新任务一：新的输送机",machine:"分拣输送线",
    description:"现在换成新的输入齿数和速度。需要让设备在给定方向上以目标速度输出。",
    hint:"轴心可沿直线滑轨调整。注意不要使用不必要的惰轮。",
    kind:"simple",motorRpm:210,motorDir:1,inputZ:30,
    initial:{zOut:42,zMid:24,idler:true},
    options:{zOut:[36,42,48,60],zMid:[18,24,30],idler:[false,true]},
    targetRpm:105,targetDir:-1,maxSpan:95,
  },
  {
    id:"after-compact",phase:"after",title:"新任务二：空间受限的转向调整",machine:"工件传送装置",
    description:"请同时修正速比和中间轴尺寸。装配空间较紧，试运行不能超出规定轴心跨度。",
    hint:"可以更换中间惰轮齿数，但惰轮本身不改变最终传动比。",
    kind:"simple",motorRpm:240,motorDir:1,inputZ:18,
    initial:{zOut:54,zMid:36,idler:true},
    options:{zOut:[30,36,42,54],zMid:[18,24,30,36],idler:[false,true]},
    targetRpm:120,targetDir:1,maxSpan:110,
  },
  {
    id:"after-compound",phase:"after",title:"新任务三：两级复合传动",machine:"双层减速机",
    description:"现在出现共轴齿轮：B与C装在同一中间轴上、同步转动。你要同时考虑两级传动。",
    hint:"A啮合B；与B同轴的C啮合D。两级中心距相加决定本模型的总轴心跨度。",
    kind:"compound",motorRpm:200,motorDir:1,inputZ:20,
    initial:{zB:30,zC:20,zOut:40},
    options:{zB:[30,40,50,60],zC:[18,20,24,30],zOut:[36,40,48,60]},
    targetRpm:50,targetDir:1,maxSpan:170,
  },
  {
    id:"transfer-warehouse",phase:"transfer",title:"迁移任务：仓储包装线",machine:"包装线动力站",
    description:"设备外观和工况换了，但传动规则仍成立。请在新的两级机器中配置目标输出。",
    hint:"没有唯一的替换齿数组合；只要满足全部工作约束，就是一种可接受的方案。",
    kind:"compound",motorRpm:240,motorDir:1,inputZ:24,
    initial:{zB:36,zC:20,zOut:40},
    options:{zB:[36,40,48,60],zC:[18,20,24,30],zOut:[36,40,48,60]},
    targetRpm:60,targetDir:1,maxSpan:160,
  },
  {
    id:"capstone",phase:"transfer",title:"综合任务：建立可运行的新方案",machine:"测试车间总装台",
    description:"多参数问题：中间从动齿轮、共轴驱动齿轮和最终输出齿轮可以同时更换。你需要给出经试运行验证的完整方案。",
    hint:"可能存在多个满足要求的组合。只记录约束达成、尝试次数、是否利用提示，不对人做能力排名。",
    kind:"compound",motorRpm:300,motorDir:1,inputZ:20,
    initial:{zB:40,zC:30,zOut:48},
    options:{zB:[40,50,60],zC:[20,24,30],zOut:[40,48,60]},
    targetRpm:60,targetDir:1,maxSpan:170,
  },
];
export const normZ = z=>Number.isInteger(Number(z))?Number(z):NaN;
export function calculate(task,config){
  const zA=normZ(task.inputZ),rpm=Number(task.motorRpm);
  if(!Number.isFinite(rpm)||rpm<=0||zA<18||!config)throw new Error("invalid motor or gears");
  const m=MODULE_MM;let outputRpm,outputDir,span,levels,gears,formula;
  if(task.kind==="compound"){
    const zB=normZ(config.zB),zC=normZ(config.zC),zD=normZ(config.zOut);
    if([zB,zC,zD].some(z=>!Number.isFinite(z)||z<18||z>100))throw new Error("invalid compound teeth");
    outputRpm=rpm*(zA/zB)*(zC/zD);
    outputDir=Number(task.motorDir)||1;
    span=m*(zA+zB+zC+zD)/2;
    levels=[{z:zA,rpm,dir:outputDir},
      {z:zB,rpm:rpm*zA/zB,dir:-outputDir},
      {z:zC,rpm:rpm*zA/zB,dir:-outputDir},
      {z:zD,rpm:outputRpm,dir:outputDir}];
    gears=[zA,zB,zC,zD];
    formula="nD = nA × ZA/ZB × ZC/ZD";
  }else{
    const zOut=normZ(config.zOut),zMid=normZ(config.zMid),idler=!!config.idler;
    if(!Number.isFinite(zOut)||zOut<18||zOut>100||idler&&(!Number.isFinite(zMid)||zMid<18||zMid>100))throw new Error("invalid simple teeth");
    outputRpm=rpm*(zA/zOut);
    outputDir=(Number(task.motorDir)||1)*(idler?1:-1);
    span=idler?m*(zA+2*zMid+zOut)/2:m*(zA+zOut)/2;
    gears=idler?[zA,zMid,zOut]:[zA,zOut];
    levels=idler?[{z:zA,rpm,dir:Number(task.motorDir)||1},
      {z:zMid,rpm:rpm*zA/zMid,dir:-(Number(task.motorDir)||1)},
      {z:zOut,rpm:outputRpm,dir:outputDir}]:
      [{z:zA,rpm,dir:Number(task.motorDir)||1},
       {z:zOut,rpm:outputRpm,dir:outputDir}];
    formula="n输出 = n输入 × Z输入/Z输出；惰轮不改变速比";
  }
  const speedError=Math.abs(outputRpm-Number(task.targetRpm));
  const checks={
    speed:speedError<=1.0,
    direction:outputDir===Number(task.targetDir),
    span:span<=Number(task.maxSpan)+1e-7
  };
  return {
    outputRpm:Math.round(outputRpm*1000)/1000,outputDir,span,ratio:rpm/outputRpm,
    speedError:Math.round(speedError*1000)/1000,
    checks,pass:Object.values(checks).every(Boolean),
    levels,gears,formula
  };
}
export function validTask(t){
 const labels=["zOut","zMid","idler","zB","zC"];
 for(const k of Object.keys(t.initial)){
   if(!labels.includes(k)||!t.options[k]?.includes(t.initial[k]))return false;
 }
 return Number.isInteger(t.inputZ)&&t.inputZ>=18&&t.motorRpm>0&&t.targetRpm>0&&t.maxSpan>0;
}
