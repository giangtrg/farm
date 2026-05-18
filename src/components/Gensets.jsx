import React, { useState, useEffect } from 'react';
import Topbar from './Topbar'; 
import { Link } from 'react-router-dom';
import { 
  Zap, Power, Activity, Clock, Flame, BatteryCharging, Settings,
  AlertTriangle, ShieldAlert, Calendar, RotateCw, Info, PowerOff, ChevronRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, 
  ResponsiveContainer, Tooltip as RechartsTooltip
} from 'recharts';
import './Gensets.css';

// ==========================================================================
// MOCK DATA 
// ==========================================================================

const weeklyData = [
  { day: 'Mon', fuel: 2150, energy: 4320 },
  { day: 'Tue', fuel: 2300, energy: 4650 },
  { day: 'Wed', fuel: 2050, energy: 4100 },
  { day: 'Thu', fuel: 2450, energy: 4890 },
  { day: 'Fri', fuel: 2600, energy: 5200 },
  { day: 'Sat', fuel: 1850, energy: 3750 },
  { day: 'Sun', fuel: 1900, energy: 3810 }
];

const gensetMatrix = [
  { id: 'GEN-01', name: 'Biogas Gen 01', status: 'running', kw: 100.2, v: 222.2, hz: 50.01, a: 54.3, fuelRate: 58.2, runTime: 8.5, totalEnergy: 784.6 },
  { id: 'GEN-02', name: 'Biogas Gen 02', status: 'stop', kw: 0, v: 0, hz: 0, a: 0, fuelRate: 0.0, runTime: 0, totalEnergy: 0 },
  { id: 'GEN-03', name: 'Biogas Gen 03', status: 'stop', kw: 0, v: 0, hz: 0, a: 0, fuelRate: 0.0, runTime: 0, totalEnergy: 0 },
  { id: 'GEN-04', name: 'Biogas Gen 04', status: 'offline', kw: 0, v: 0, hz: 0, a: 0, fuelRate: 0.0, runTime: 0, totalEnergy: 0 },
];

const countRun = gensetMatrix.filter(g => g.status === 'running').length;
const countStop = gensetMatrix.filter(g => g.status === 'stop').length;
const countOff = gensetMatrix.filter(g => g.status === 'offline').length;

const gensetAlerts = [
  { id: 1, type: 'critical', text: 'GEN-02 Output voltage fluctuation detected.', time: '5 mins ago', icon: ShieldAlert, color: '#ef4444', bg: '#fee2e2' },
  { id: 2, type: 'warning', text: 'GEN-03 Maintenance required: Oil filter change.', time: '2 hours ago', icon: AlertTriangle, color: '#f59e0b', bg: '#fef3c7' },
  { id: 3, type: 'info', text: 'GEN-04 Engine pre-heating cycle initiated.', time: '3 hours ago', icon: PowerOff, color: '#3b82f6', bg: '#dbeafe' }
];

const gensetSchedule = [
  { id: 1, task: 'GEN-02 Auto-start test procedure.', time: 'Today, 14:00', icon: RotateCw, color: '#10b981', bg: '#d1fae5' },
  { id: 2, task: 'GEN-03 Scheduled load ramp-down.', time: 'Today, 18:30', icon: Power, color: '#8b5cf6', bg: '#ede9fe' },
  { id: 3, task: 'Fleet synchronization protocol check.', time: 'Tomorrow, 02:00', icon: Activity, color: '#0ea5e9', bg: '#e0f2fe' }
];

// RENDER LEGEND DẠNG PILL BẦU DỤC
const renderCustomLegend = (props) => {
  const { payload } = props;
  return (
    <div className="genset-legend-horizontal">
      {payload.map((entry, index) => (
        <div key={`item-${index}`} className="genset-legend-item">
          <div className="genset-legend-pill" style={{ background: entry.color }}></div>
          {entry.value}
        </div>
      ))}
    </div>
  );
};

const Gensets = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="genset-wrapper">
      <Topbar />

      <div className="genset-content">
        
        <div className="genset-header">
          {/* --- BREADCRUMB --- */}
          <nav aria-label="breadcrumb" className="genset-breadcrumb">
            <Link to="/dashboard">
              Home
            </Link>
            
            <ChevronRight size={14} color="#94a3b8" aria-hidden="true" />
            
            <Link to="/dashboard">
              Dashboard
            </Link>

            <ChevronRight size={14} color="#94a3b8" aria-hidden="true" />
            
            <span className="current-page" aria-current="page">
              Gensets
            </span>
          </nav>
        </div>

        {/* --- TẦNG 1: FLEET OVERVIEW KPIs --- */}
        <div className="genset-kpi-grid">
          
          {/* Card 1: Fleet Status (Không tiêu đề, không chấm tròn, hàng ngang) */}
          <div className="genset-kpi-card">
            <div className="genset-status-list">
              <div className="genset-status-col">
                <div className="genset-status-lbl-top" style={{color: '#10b981'}}>
                  RUNNING
                </div>
                <div className="genset-status-val">{countRun}</div>
              </div>
              <div className="genset-status-col">
                <div className="genset-status-lbl-top" style={{color: '#ef4444'}}>
                  STOPPED
                </div>
                <div className="genset-status-val">{countStop}</div>
              </div>
              <div className="genset-status-col">
                <div className="genset-status-lbl-top" style={{color: '#94a3b8'}}>
                  OFFLINE
                </div>
                <div className="genset-status-val">{countOff}</div>
              </div>
            </div>
          </div>

          {/* Card 2: Total Active Power */}
          <div className="genset-kpi-card">
            <div className="genset-kpi-lbl">Total Active Power</div>
            <div className="genset-kpi-val">100 <span>/ 500 kW</span></div>
            <div className="genset-progress-bg">
              <div className="genset-progress-fill" style={{width: '20%'}}></div>
            </div>
          </div>

          {/* Card 3: Fuel Consumption */}
          <div className="genset-kpi-card">
            <div className="genset-kpi-lbl">Fuel Consumption</div>
            <div className="genset-kpi-val">445.2 <span>m³</span></div>
            <div className="genset-kpi-sub">
              <span style={{color: '#64748b'}}>Avg: 56.8 m³/h</span>
              <span style={{color: '#10b981'}}>↑ 0.0%</span>
            </div>
          </div>

          {/* Card 4: Total Energy */}
          <div className="genset-kpi-card">
            <div className="genset-kpi-lbl">Total Energy</div>
            <div className="genset-kpi-val">784.6 <span>kWh</span></div>
            <div className="genset-kpi-sub">
              <span style={{color: '#64748b'}}>Est: 0.3 MWh</span>
              <span style={{color: '#10b981'}}>↑ 0.0%</span>
            </div>
          </div>

        </div>

        {/* --- TẦNG 2: COMPACT GENSET MATRIX (TABLE) --- */}
        <div className="genset-card-panel" style={{padding: '24px 0'}}>
          <div className="genset-panel-title" style={{padding: '0 24px'}}>Generator List</div>
          
          <div className="genset-table-wrapper">
            <table className="genset-table">
              <thead>
                <tr>
                  <th style={{paddingLeft: '24px'}}>Status</th>
                  <th>Machine ID</th>
                  <th>Output</th>
                  <th>Voltage</th>
                  <th>Freq</th>
                  <th>Current</th>
                  <th>Fuel Rate</th>
                  <th>Runtime</th>
                  <th style={{paddingRight: '24px'}}>Total Energy</th>
                </tr>
              </thead>
              <tbody>
                {gensetMatrix.map((gen, idx) => (
                  <tr key={idx} className={gen.status}>
                    {/* Status đã bỏ chấm tĩnh */}
                    <td style={{paddingLeft: '24px'}}>
                      <div className="genset-status-cell" style={{color: gen.status==='running'?'#10b981':gen.status==='stop'?'#ef4444':'#94a3b8'}}>
                        {gen.status}
                      </div>
                    </td>
                    
                    {/* Name */}
                    <td>
                      <div className="genset-name-cell">
                        <span className="genset-id">{gen.id}</span>
                        <span className="genset-model">{gen.name}</span>
                      </div>
                    </td>

                    {/* Output */}
                    <td><div className="genset-num-val">{gen.kw.toFixed(1)}<span>kW</span></div></td>
                    
                    {/* Voltage */}
                    <td><div className="genset-num-val">{gen.v.toFixed(1)}<span>V</span></div></td>
                    
                    {/* Freq */}
                    <td><div className="genset-num-val">{gen.hz.toFixed(2)}<span>Hz</span></div></td>

                    {/* Current */}
                    <td><div className="genset-num-val">{gen.a.toFixed(1)}<span>A</span></div></td>

                    {/* Fuel Rate */}
                    <td><div className="genset-num-val">{gen.fuelRate.toFixed(1)}<span>m³/h</span></div></td>

                    {/* Runtime */}
                    <td><div className="genset-num-val">{gen.runTime.toFixed(1)}<span>h</span></div></td>

                    {/* Total Energy */}
                    <td style={{paddingRight: '24px'}}>
                      <div className="genset-num-val">{gen.totalEnergy.toFixed(1)}<span>kWh</span></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- TẦNG 3: BAR CHART (TRÁI) & 2 CARDS STACK (PHẢI) --- */}
        <div className="genset-row-bot-2-cols">
          
          {/* CỘT TRÁI: Biểu đồ cột */}
          <div className="genset-card-panel">
            <div className="genset-panel-title">Weekly Production</div>
            
            <div className="genset-big-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}}/>
                  
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}}/>
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}}/>
                  
                  <RechartsTooltip 
                    contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 10px 30px rgba(0,0,0,0.1)'}} 
                    formatter={(val, name) => {
                      if(name === 'Fuel Consumption') return [`${val} m³`, name];
                      if(name === 'Energy Generated') return [`${val} kWh`, name];
                      return val;
                    }}
                    cursor={{fill: '#f1f5f9'}}
                  />
                  <Legend content={renderCustomLegend} verticalAlign="top" />

                  <Bar yAxisId="left" dataKey="fuel" name="Fuel Consumption" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40}/>
                  <Bar yAxisId="right" dataKey="energy" name="Energy Generated" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="genset-chart-comment">
              <Info size={16} color="#3b82f6" />
              Peak energy generation was observed on Friday, directly correlating with the highest fuel consumption rate of the week.
            </div>
          </div>

          {/* CỘT PHẢI: 2 Thẻ xếp dọc */}
          <div className="genset-stack-col">
            
            {/* Operation Schedule */}
            <div className="genset-card-panel" style={{flex: 1}}>
              <div className="genset-panel-title-small">Schedule</div>
              <div className="genset-info-list">
                {gensetSchedule.map(item => (
                  <div className="genset-list-item" key={item.id}>
                    <div className="genset-item-icon" style={{background: item.bg, color: item.color}}><item.icon size={18}/></div>
                    <div className="genset-item-content">
                      <span className="genset-item-text">{item.task}</span>
                      <span className="genset-item-time"><Clock size={12}/> {item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Local Alerts */}
            <div className="genset-card-panel" style={{flex: 1}}>
              <div className="genset-panel-title-small">Local Alerts</div>
              <div className="genset-info-list">
                {gensetAlerts.map(item => (
                  <div className="genset-list-item" key={item.id}>
                    <div className="genset-item-icon" style={{background: item.bg, color: item.color}}><item.icon size={18}/></div>
                    <div className="genset-item-content">
                      <span className="genset-item-text">{item.text}</span>
                      <span className="genset-item-time"><Clock size={12}/> {item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Gensets;