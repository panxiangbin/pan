/* 釜算 V0.3 独立模块的手机分步输入架构。 */
export function configureAdvancedModules(specs,F,S,demos){
 specs.mix={
  subtitle:'依次计算工作黏度、搅拌功率，再核校已知电机/减速机额定值；不能直接选型号。',
  guidance:'没有可靠功率数/几何时只计算Re。传动校核不覆盖起动、轴强度、机械密封、防爆等安全设计。',
  groups:[
   {title:'第一步 · 物料性质',desc:'密度及动力黏度必须对应真实的工作温度。',fields:[
    S('rheology','流体类型',[['','请选择'],['newtonian','牛顿流体'],['nonnewtonian','非牛顿流体']]),
    F('rho','工作温度密度',{unit:'kg/m³'}),
    S('muUnit','黏度单位',[['mPa·s','mPa·s'],['Pa·s','Pa·s']]),
    S('viscMode','黏度获取方式',[['manual','知道工作黏度'],['temperature','两个实测点插值']])
   ]},
   {title:'工作温度动力黏度',only:v=>v.viscMode!=='temperature',fields:[
    F('mu','动力黏度',{unit:'同上',placeholder:'填真实测得值',full:true})
   ]},
   {title:'两个测量点的黏度插值',only:v=>v.viscMode==='temperature',
    desc:'仅同一种牛顿流体、两个实测温度之间；若有相变或温度范围外则拒绝。',fields:[
    F('temp1','实测温度1',{unit:'°C'}),F('mu1','该温度黏度',{unit:'同上'}),
    F('temp2','实测温度2',{unit:'°C'}),F('mu2','该温度黏度',{unit:'同上'}),
    F('tempWork','目标工作温度',{unit:'°C',full:true})
   ]},
   {title:'第二步 · 釜体、桨型与转速',fields:[
    F('vesselD','釜体内径',{unit:'mm'}),
    S('impeller','搅拌桨型',[['','请选择桨型'],['anchor','锚式'],['ribbon','螺带式'],['rushton','六直叶圆盘涡轮'],['propeller','推进式'],['other','其它/未知']]),
    F('impellerD','桨叶外径',{unit:'mm'}),
    F('rpm','搅拌速度',{unit:'rpm'})
   ]},
   {title:'第三步 · 厂家功率数 Np（可选）',advanced:true,
    desc:'只有你具有同桨型/几何/Re下可追溯的功率数时填写。',fields:[
    F('userNp','已知Np',{placeholder:'否则留空'}),
    F('npSource','Np来源与适用几何',{kind:'text',full:true,placeholder:'厂家技术文档及适用条件'})
   ]},
   {title:'第三步 · 文献锚/螺带几何（可选）',advanced:true,only:v=>v.impeller==='anchor'||v.impeller==='ribbon',
    desc:'Takahashi 1982 实验式局限于牛顿层流、小尺度平底/无挡板槽。',fields:[
    S('bottom','釜底形状',[['','请选择'],['flat','平底'],['round','圆底/椭圆底']]),
    S('baffles','是否带挡板',[['','请选择'],['none','无'],['yes','有']]),
    S('internals','其它内部构件',[['','请选择'],['no','没有'],['yes','有盘管等']]),
    F('depth','液位深度',{unit:'mm'}),F('bladeWidth','叶片宽度',{unit:'mm'}),
    F('bladeLength','叶片长度L',{unit:'mm'}),F('nBlades','叶片数',{unit:'片'}),
    F('nArms','每片叶支臂数量',{unit:'个'}),F('armDia','支臂直径',{unit:'mm'}),
    F('pitch','螺带螺距',{unit:'mm',only:v=>v.impeller==='ribbon'})
   ]},
   {title:'第四步 · 已选电机及减速机校核',advanced:true,
    desc:'输入已知电机铭牌和厂家给出的效率、服务系数、输出扭矩，只做稳态数值比较。',fields:[
    S('motorCheck','是否校核已知设备',[['no','暂不校核'],['yes','输入已有厂家参数']],{full:true}),
    F('driveEfficiency','传动总效率',{unit:'%',only:v=>v.motorCheck==='yes'}),
    F('serviceFactor','厂家服务系数',{only:v=>v.motorCheck==='yes'}),
    F('motorRatedKW','已有电机额定功率',{unit:'kW',only:v=>v.motorCheck==='yes'}),
    F('gearRatedNm','减速机额定输出扭矩',{unit:'N·m',only:v=>v.motorCheck==='yes'})
   ]}
  ]
 };
 specs.distill={
  subtitle:'按操作方式选模型。连续板式塔、填料塔和无回流间歇蒸馏不能混算。',
  guidance:'不包含严谨物性VLE数据库、非理想共沸分离、塔径/液泛、间歇回流精馏与完整设备设计。HETP、塔板效率必须依据真实工况提供。',
  groups:[
   {title:'第一步 · 精馏计算任务',desc:'选择板式、填料或者简单间歇任务，页面只显示对应输入。',fields:[
    S('task','计算任务',[['fenske','连续二元 · Fenske最小平衡级'],['mccabe','连续二元 · McCabe–Thiele逐级图解'],['tray','板式塔 · 已知效率换算塔板数'],['packing','填料塔 · 已知HETP换算填料高度'],['rayleigh','简单间歇蒸馏 · Rayleigh物料衡算']],{full:true})
   ]},
   {title:'二元组分与相对挥发度',only:v=>['fenske','mccabe'].includes(v.task||'fenske'),
    desc:'恒定α适用于列明的近似条件；缺实测物性时结果为教学假想模型。',fields:[
    F('alpha','恒定相对挥发度α',{placeholder:'请提供物性来源'}),
    F('xD','塔顶轻组分摩尔分数',{placeholder:'0到1'}),
    F('xB','塔底轻组分摩尔分数',{placeholder:'0到1'})
   ]},
   {title:'进料与回流条件',only:v=>v.task==='mccabe',fields:[
    F('zF','进料轻组分摩尔分数',{placeholder:'0到1'}),
    F('q','进料热状态q',{placeholder:'泡点液体取1'}),
    F('R','实际操作回流比R',{placeholder:'须大于最小回流比'})
   ]},
   {title:'连续板式塔 · 已知全塔效率',only:v=>v.task==='tray',fields:[
    F('towerNth','已知塔内理论级数',{unit:'级',placeholder:'不含再沸器'}),
    F('towerEff','同工况整体塔板效率',{unit:'%',placeholder:'不内置经验系数'})
   ]},
   {title:'连续填料塔 · 已知HETP',only:v=>v.task==='packing',fields:[
    F('packStages','填料段所需理论级',{unit:'级'}),
    F('hetp','同工况等板高度HETP',{unit:'m',placeholder:'厂家/实验数据'})
   ]},
   {title:'无回流二元简单间歇蒸馏',only:v=>v.task==='rayleigh',
    desc:'注意：不是有回流的间歇精馏塔；只进行简单蒸馏的物料衡算，不给完成时间。',fields:[
    F('alpha','相对挥发度α',{placeholder:'必须>1'}),
    F('batchX0','初始釜液轻组分摩尔分数',{placeholder:'0到1'}),
    F('batchXw','目标残液轻组分摩尔分数',{placeholder:'小于初始'}),
    F('batchW0','初始总物质的量',{unit:'mol'})
   ]}
  ]
 };
 specs.vacuum={
  subtitle:'可选择恒定容器端抽速或已知压力–有效抽速S–p曲线的分段计算。',
  guidance:'仅空腔、无漏气放气和额外蒸汽负荷的理想模型；容器处有效抽速不是未经修正的泵铭牌抽速。',
  groups:[
   {title:'第一步 · 抽速数据方式',fields:[
    S('speedMode','抽速计算类型',[['constant','全程恒定有效抽速'],['curve','厂家压力–抽速S–p曲线']],{full:true})
   ]},
   {title:'第二步 · 空腔与绝对压力',fields:[
    F('volume','空腔容积',{unit:'L'}),
    F('p0','起始绝对压力',{unit:'mbar'}),
    F('p1','目标绝对压力',{unit:'mbar'}),
    F('pu','系统可达极限压力',{unit:'mbar'})
   ]},
   {title:'第三步 · 容器端有效抽速',only:v=>v.speedMode!=='curve',fields:[
    F('speed','恒定有效抽速',{unit:'m³/h',full:true})
   ]},
   {title:'第三步 · 压力相关抽速曲线',only:v=>v.speedMode==='curve',
    desc:'每行一个绝对压力mbar,有效抽速m³/h；必须覆盖从起点到目标的全区间。',fields:[
    F('speedCurve','压力及抽速（每行一组）',{kind:'textarea',rows:5,full:true,placeholder:'10,2.5\n100,4\n1013,4'})
   ]}
  ]
 };
 specs.pipe={
  subtitle:'单相液体管路的速度、压降、扬程、水力功率与已知效率换算。',
  guidance:'不包含泵性能曲线、汽蚀余量NPSH、两相流、复杂非稳态或管路振动，不能直接确定采购型号。',
  groups:[
   {title:'第一步 · 流量与直管尺寸',fields:[
    F('pipeFlow','实际体积流量',{unit:'L/min'}),
    F('pipeInnerD','管道内径',{unit:'mm'}),
    F('pipeLength','直管总长度',{unit:'m'})
   ]},
   {title:'第二步 · 液体工作物性',fields:[
    F('pipeRho','工作密度',{unit:'kg/m³'}),
    F('pipeMu','动力黏度',{unit:'mPa·s'})
   ]},
   {title:'第三步 · 粗糙度、管件与高差',fields:[
    F('pipeRough','绝对粗糙度',{unit:'mm',placeholder:'按管材资料'}),
    F('pipeK','局部阻力系数总和ΣK',{placeholder:'按真实管件求和'}),
    F('pipeLift','静扬程',{unit:'m',placeholder:'闭合循环不重复计静扬程'})
   ]},
   {title:'可选 · 按给定效率换算轴功率',advanced:true,fields:[
    F('pipeEta','用户提供泵效率',{unit:'%',placeholder:'无厂家曲线可不填'})
   ]}
  ]
 };
 specs.duty={
  subtitle:'先计算冷却/蒸发的理论热量，再由你指定的时间反推平均冷热负荷；不预测设备完成时间。',
  guidance:'缺传热系数、有效面积和设备性能曲线时，不能把平均冷热负荷当作反应釜、冷却器或旋蒸的实际能力。',
  groups:[
   {title:'第一步 · 选择热工任务',fields:[
    S('dutyMode','热量计算类型',[['cooling','反应釜冷却显热/冷量'],['evap','旋蒸蒸发汽化/预热热量']],{full:true})
   ]},
   {title:'第二步 · 批次冷却条件',only:v=>v.dutyMode!=='evap',fields:[
    F('coldMass','物料质量',{unit:'kg'}),
    F('coldCp','物料平均比热',{unit:'kJ/(kg·K)'}),
    F('coldInitial','初始物料温度',{unit:'°C'}),
    F('coldTarget','目标物料温度',{unit:'°C'})
   ]},
   {title:'可选 · 釜体热容',advanced:true,only:v=>v.dutyMode!=='evap',fields:[
    F('coldVesselMass','有效釜体质量',{unit:'kg'}),
    F('coldVesselCp','有效釜体比热',{unit:'kJ/(kg·K)'})
   ]},
   {title:'冷却目标时间及冷媒流量',advanced:true,only:v=>v.dutyMode!=='evap',
    desc:'目标时间由你输入；网站只反算平均冷负荷，不能预测设备实际所需时间。',fields:[
    F('coldDesiredMinutes','用户希望降温用时',{unit:'分钟'}),
    F('coolantCp','冷却介质比热',{unit:'kJ/(kg·K)'}),
    F('coolantDelta','冷却介质允许升温',{unit:'K'})
   ]},
   {title:'第二步 · 已知溶剂蒸发条件',only:v=>v.dutyMode==='evap',
    desc:'潜热及比热应来自对应溶剂/真空压力下的物性资料；不是所有溶剂可共用。',fields:[
    F('evapMass','计划蒸发溶剂质量',{unit:'kg'}),
    F('evapLatent','操作条件下潜热',{unit:'kJ/kg'})
   ]},
   {title:'可选 · 溶剂预热条件',only:v=>v.dutyMode==='evap',advanced:true,fields:[
    F('evapCp','溶剂平均比热',{unit:'kJ/(kg·K)'}),
    F('evapInitial','起始温度',{unit:'°C'}),
    F('evapBoiling','操作蒸发温度',{unit:'°C'})
   ]},
   {title:'可选 · 指定时长下的负荷',only:v=>v.dutyMode==='evap',advanced:true,fields:[
    F('evapDesiredMinutes','用户指定蒸发时长',{unit:'分钟'})
   ]}
  ]
 };
 Object.assign(demos,{
  mix:{vesselD:'128',rho:'1000',mu:'10000',muUnit:'mPa·s',rheology:'newtonian',impeller:'anchor',impellerD:'121.6',rpm:'30',bottom:'flat',baffles:'none',internals:'no',depth:'128',bladeWidth:'13',bladeLength:'115',nBlades:'2',nArms:'2',armDia:'3',viscMode:'manual',motorCheck:'no'},
  distill:{task:'mccabe',alpha:'2.5',xD:'0.95',xB:'0.05',zF:'0.5',q:'1',R:'1.65'},
  vacuum:{speedMode:'constant',volume:'50',p0:'1013',p1:'10',pu:'0.01',speed:'4'},
  pipe:{pipeFlow:'40',pipeInnerD:'25',pipeLength:'12',pipeRho:'998',pipeMu:'1',pipeRough:'0.045',pipeK:'3',pipeLift:'0',pipeEta:'65'},
  duty:{dutyMode:'cooling',coldMass:'60',coldCp:'2',coldInitial:'80',coldTarget:'30',coldDesiredMinutes:'60'}
 });
}