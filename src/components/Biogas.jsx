  import React, { useState, useEffect } from 'react';
  import Topbar from './Topbar'; 
  import { Link } from 'react-router-dom';
  import { 
    Thermometer, Gauge as GaugeIcon, Droplets, Activity, Database, PieChart as PieChartIcon, Clock, ArrowRightCircle,
    Beaker, ShieldCheck, ShieldAlert, AlertTriangle, ChevronRight
  } from 'lucide-react';
  import { 
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend, 
    ResponsiveContainer, Tooltip as RechartsTooltip, PieChart, Pie, Cell, ComposedChart
  } from 'recharts';
  import './Biogas.css';

  // ==========================================================================
  // MOCK DATA: 60 NGÀY TỔNG HỢP 
  // ==========================================================================
  const generate60DaysData = () => {
    const data = [];
    let storage = 4500;
    const today = new Date();
    
    for (let i = 59; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;

      const feed = 10 + Math.random() * 5; 
      const raw = feed * (10 + Math.random() * 5); 
      const treated = raw * (0.95 + Math.random() * 0.02); 
      
      storage += (treated - (130 + Math.random() * 30)); 
      if (storage < 1000) storage = 1000 + Math.random() * 500;
      if (storage > 6000) storage = 6000 - Math.random() * 500;

      data.push({
        date: dateStr,
        feed: +feed.toFixed(1),
        raw: +raw.toFixed(1),
        treated: +treated.toFixed(1),
        storage: +storage.toFixed(1)
      });
    }
    return data;
  };
  const historyData = generate60DaysData();

  // ĐỒNG BỘ MÀU SẮC
  const sharedColors = {
    ch4: '#10b981', 
    co2: '#94a3b8', 
    h2s: '#f59e0b'  
  };

  const rawCompositionData = [
    { name: 'CH4', value: 60.5, color: sharedColors.ch4 },
    { name: 'CO2', value: 37.0, color: sharedColors.co2 },
    { name: 'H2S & Others', value: 2.5, color: sharedColors.h2s }
  ];

  const treatedCompositionData = [
    { name: 'CH4', value: 96.5, color: sharedColors.ch4 },
    { name: 'CO2', value: 2.8, color: sharedColors.co2 },
    { name: 'H2S & Others', value: 0.7, color: sharedColors.h2s }
  ];

  // DATA CHO 3 ĐỒNG HỒ GAUGE
  const tempVal = 38.2;
  const tempPcnt = (tempVal / 60) * 100; 
  const tempData = [{ value: tempPcnt, color: '#ef4444' }, { value: 100 - tempPcnt, color: '#e2e8f0' }];

  const humVal = 85.0;
  const humPcnt = humVal; 
  const humData = [{ value: humPcnt, color: '#3b82f6' }, { value: 100 - humPcnt, color: '#e2e8f0' }];

  const pressVal = 1.25;
  const pressPcnt = (pressVal / 2.0) * 100; 
  const pressData = [{ value: pressPcnt, color: '#f59e0b' }, { value: 100 - pressPcnt, color: '#e2e8f0' }];

  // MOCK DATA TẦNG 3
  const phLevel = 7.2;
  const filterHealth = 82;
  const biogasAlerts = [
    { id: 1, type: 'critical', text: 'H2S concentration near upper tolerance limit.', time: '14 mins ago', icon: ShieldAlert, color: '#ef4444', bg: '#fee2e2' },
    { id: 2, type: 'warning', text: 'Digester pH level slightly fluctuating (7.4 -> 7.2).', time: '2 hours ago', icon: AlertTriangle, color: '#f59e0b', bg: '#fef3c7' }
  ];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.25; 
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if(percent < 0.05) return null; 
    return (
      <text x={x} y={y} fill="#475569" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12" fontWeight="700">
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  const Biogas = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    const [activeHistory, setActiveHistory] = useState({
      feed: true, raw: true, treated: true
    });

    const toggleHistory = (dataKey) => setActiveHistory(prev => ({ ...prev, [dataKey]: !prev[dataKey] }));

    useEffect(() => {
      const timer = setInterval(() => setCurrentTime(new Date()), 1000);
      return () => clearInterval(timer);
    }, []);

    const renderHistoryLegend = (props) => {
      const { payload } = props;
      return (
        <div className="biogas-legend-horizontal">
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="biogas-legend-item" style={{ opacity: activeHistory[entry.dataKey] ? 1 : 0.4 }} onClick={() => toggleHistory(entry.dataKey)}>
              <div className="biogas-legend-color-wrap">
                <div className="biogas-legend-color" style={{ background: entry.color }}></div>
                {entry.value}
              </div>
            </div>
          ))}
        </div>
      );
    };

    return (
      <div className="biogas-wrapper">
        <Topbar />

        <div className="biogas-content">
          
          <div className="biogas-header">
          {/* --- BREADCRUMB --- */}
          <nav aria-label="breadcrumb" className="biogas-breadcrumb">
            <Link to="/dashboard">
              Home
            </Link>
            
            <ChevronRight size={14} color="#94a3b8" aria-hidden="true" />
            
            <Link to="/dashboard">
              Dashboard
            </Link>

            <ChevronRight size={14} color="#94a3b8" aria-hidden="true" />
            
            <span className="current-page" aria-current="page">
              Digester
            </span>
          </nav>
        </div>

          {/* --- TẦNG 1: 1 THẺ CHỨA 3 GAUGE (TRÁI) & PRODUCTION CHART (PHẢI) --- */}
          <div className="biogas-row-top-combined">
            
            <div className="biogas-card-panel">
              <div className="biogas-panel-title">Digester Parameters</div>
              <div className="biogas-gauges-container">
                
                {/* Temp Gauge */}
                <div className="biogas-gauge-item">
                  <div className="biogas-gauge-lbl">Temperature</div>
                  <div className="biogas-gauge-chart-box">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={tempData} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={60} outerRadius={80} stroke="none" dataKey="value">
                          {tempData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="biogas-gauge-val">{tempVal}<span>°C</span></div>
                  </div>
                </div>

                {/* Humidity Gauge */}
                <div className="biogas-gauge-item">
                  <div className="biogas-gauge-lbl">Humidity</div>
                  <div className="biogas-gauge-chart-box">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={humData} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={60} outerRadius={80} stroke="none" dataKey="value">
                          {humData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="biogas-gauge-val">{humVal.toFixed(1)}<span>%</span></div>
                  </div>
                </div>

                {/* Pressure Gauge */}
                <div className="biogas-gauge-item">
                  <div className="biogas-gauge-lbl">Pressure</div>
                  <div className="biogas-gauge-chart-box">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pressData} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={60} outerRadius={80} stroke="none" dataKey="value">
                          {pressData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="biogas-gauge-val">{pressVal.toFixed(2)}<span>Bar</span></div>
                  </div>
                </div>

              </div>
            </div>

            <div className="biogas-card-panel">
              <div className="biogas-panel-title">Production Trends</div>
              <div className="biogas-chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    
                    {/* BẬT LƯỚI NGANG ĐỘNG: Bỏ tick cứng, dùng nét đứt chuẩn */}
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} interval={6}/>
                    
                    {/* ĐỂ YAXIS TỰ TÍNH TOÁN TICKS ĐỂ KHỚP VỚI LƯỚI */}
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    
                    <RechartsTooltip 
                      contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 10px 30px rgba(0,0,0,0.1)'}} 
                      formatter={(val, name) => {
                        if (name === "Feed Rate") return [`${val} Tons`, name];
                        if (name === "Raw Biogas") return [`${val} m³`, name];
                        if (name === "Treated Biogas") return [`${val} m³`, name];
                        return val;
                      }}
                    />
                    <Legend content={renderHistoryLegend} verticalAlign="top" />

                    <Line yAxisId="right" type="monotone" dataKey="feed" name="Feed Rate" stroke="#8b5cf6" strokeWidth={2} dot={false} strokeDasharray="4 4" hide={!activeHistory.feed} />
                    <Line yAxisId="left" type="monotone" dataKey="raw" name="Raw Biogas" stroke="#f59e0b" strokeWidth={2} dot={false} hide={!activeHistory.raw}/>
                    <Line yAxisId="left" type="monotone" dataKey="treated" name="Treated Biogas" stroke="#10b981" strokeWidth={3} dot={false} hide={!activeHistory.treated}/>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* --- TẦNG 2: STORAGE CHART & COMPOSITION PIES --- */}
          <div className="biogas-row-mid-charts">
            
            <div className="biogas-card-panel">
              <div className="biogas-panel-title">Biogas Storage</div>
              <div className="biogas-chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="storageColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} interval={6}/>
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} domain={['dataMin - 500', 'auto']}/>
                    <RechartsTooltip contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 10px 30px rgba(0,0,0,0.1)'}} formatter={(val) => [`${val} m³`, 'Volume']}/>
                    <Area type="monotone" dataKey="storage" name="Stored Volume" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#storageColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="biogas-card-panel">
              <div className="biogas-panel-title">Components Comparison</div>
              
              <div className="biogas-comparison-top">
                {/* Pie 1: RAW BIOGAS */}
                <div className="biogas-donut-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <Pie data={rawCompositionData} innerRadius={65} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none" label={renderCustomizedLabel} labelLine={false}>
                        {rawCompositionData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                      </Pie>
                      <RechartsTooltip contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 10px 30px rgba(0,0,0,0.1)', fontWeight: 600}} formatter={(value) => [`${value} %`]}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="biogas-donut-center-text">
                    <h3>BIOGAS</h3>
                    <p style={{color: '#94a3b8'}}>RAW</p>
                  </div>
                </div>

                {/* MŨI TÊN */}
                <div className="biogas-pie-arrow">
                  <ArrowRightCircle size={32} color="#cbd5e1" />
                </div>

                {/* Pie 2: TREATED BIOGAS */}
                <div className="biogas-donut-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <Pie data={treatedCompositionData} innerRadius={65} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none" label={renderCustomizedLabel} labelLine={false}>
                        {treatedCompositionData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                      </Pie>
                      <RechartsTooltip contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 10px 30px rgba(0,0,0,0.1)', fontWeight: 600}} formatter={(value) => [`${value} %`]}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="biogas-donut-center-text">
                    <h3>BIOGAS</h3>
                    <p style={{color: '#10b981'}}>PURIFIED</p>
                  </div>
                </div>
              </div>

              <div className="biogas-comparison-bottom">
                <div className="biogas-custom-legend">
                  {rawCompositionData.map((item, idx) => (
                    <div key={idx} className="biogas-legend-item">
                      <div className="biogas-legend-color-wrap"><div className="biogas-legend-color" style={{background: item.color}}></div> {item.name}</div>
                      <span>{item.value}%</span>
                    </div>
                  ))}
                </div>

                <div className="biogas-custom-legend">
                  {treatedCompositionData.map((item, idx) => (
                    <div key={idx} className="biogas-legend-item">
                      <div className="biogas-legend-color-wrap"><div className="biogas-legend-color" style={{background: item.color}}></div> {item.name}</div>
                      <span style={{fontWeight: 800, color: '#0f172a'}}>{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* --- TẦNG 3: MỚI - PH LEVEL, FILTER HEALTH & ALERTS --- */}
          <div className="biogas-row-bot-3-cols">
            
            {/* Card 1: pH Level */}
            <div className="biogas-card-panel">
              <div className="biogas-panel-title-small">Digester pH Level</div>
              <div className="biogas-ph-display">
                <div className="biogas-ph-val">{phLevel}</div>
                <div className="biogas-ph-status">Optimal Range</div>
                <p style={{fontSize: '0.8rem', color: '#64748b', marginTop: '10px'}}>Last sample: 15 mins ago</p>
              </div>
            </div>

            {/* Card 2: Filter Health */}
            <div className="biogas-card-panel">
              <div className="biogas-panel-title-small">Scrubber Health</div>
              <div className="biogas-progress-wrapper">
                <div className="biogas-progress-info">
                  <span>Filter Capacity Remaining</span>
                  <span style={{color: filterHealth > 30 ? '#3b82f6' : '#ef4444'}}>{filterHealth}%</span>
                </div>
                <div className="biogas-progress-bg">
                  <div className="biogas-progress-fill" style={{width: `${filterHealth}%`, background: filterHealth > 30 ? '#3b82f6' : '#ef4444'}}></div>
                </div>
                <p className="biogas-filter-desc">
                  The desulfurization filter is functioning nominally. Estimated replacement in 14 days based on current flow rate.
                </p>
              </div>
            </div>

            {/* Card 3: Local Alerts */}
            <div className="biogas-card-panel">
              <div className="biogas-panel-title-small">Local Alerts</div>
              <div className="biogas-info-list">
                {biogasAlerts.map(item => (
                  <div className="biogas-list-item" key={item.id}>
                    <div className="biogas-item-icon" style={{background: item.bg, color: item.color}}><item.icon size={18}/></div>
                    <div className="biogas-item-content">
                      <span className="biogas-item-text">{item.text}</span>
                      <span className="biogas-item-time"><Clock size={12}/> {item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    );
  };

  export default Biogas;