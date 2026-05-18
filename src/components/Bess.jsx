import React, { useState, useEffect } from 'react';
import Topbar from './Topbar';
import { Link } from 'react-router-dom';
import { 
  Battery, Zap, Activity, ShieldAlert, AlertTriangle, 
  Clock, ShieldCheck, ChevronRight, Thermometer 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import './Bess.css';

// ==========================================================================
// MOCK DATA: 24-HOUR BESS TREND HISTORY
// ==========================================================================
const generate24HoursBessData = () => {
  const data = [];
  const times = [
    "00:00", "02:00", "04:00", "06:00", "08:00", "10:00", 
    "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"
  ];
  
  times.forEach((time) => {
    const hour = parseInt(time.split(":")[0]);
    let charge = 0;
    let discharge = 0;

    if (hour >= 10 && hour <= 14) {
      charge = +(30 + Math.random() * 25).toFixed(1);
    } else if (hour >= 18 || hour <= 2) {
      discharge = +(40 + Math.random() * 35).toFixed(1);
    } else {
      discharge = +(5 + Math.random() * 10).toFixed(1);
    }

    data.push({ time, charge, discharge });
  });
  return data;
};

const historyData = generate24HoursBessData();

const Bess = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeCharts, setActiveCharts] = useState({ charge: true, discharge: true });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // BESS Core System State
  const bessSystem = {
    status: 'DISCHARGING', // CHARGING, STANDBY, DISCHARGING
    soc: 74.2,
    soh: 98.5,
    cycleCount: 1,
    ratedCapacity: '200 kWh', // Thêm Capacity
    metrics: {
      activePower: 82.4 // Thêm Công suất hiện tại
    },
    electrical: {
      voltage: 742.8,
      current: 110.9,
      temp: 32.4
    },
    alerts: [
      { id: 1, type: 'warning', text: 'Placeholder.', time: '0 mins ago', icon: AlertTriangle, color: '#f59e0b', bg: '#fef3c7' },
      { id: 2, type: 'warning', text: 'Placeholder.', time: '0 mins ago', icon: AlertTriangle, color: '#f59e0b', bg: '#fef3c7' },
      { id: 3, type: 'warning', text: 'Placeholder.', time: '0 mins ago', icon: AlertTriangle, color: '#f59e0b', bg: '#fef3c7' },
    ]
  };

  const stateColors = {
    CHARGING: '#10b981',
    DISCHARGING: '#8b5cf6',
    STANDBY: '#64748b'
  };

  const socData = [
    { value: bessSystem.soc, color: stateColors[bessSystem.status] },
    { value: 100 - bessSystem.soc, color: '#e2e8f0' }
  ];

  const toggleChart = (key) => {
    setActiveCharts(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderCustomLegend = () => {
    return (
      <div className="bess-legend-horizontal">
        <div className="bess-legend-item" style={{ opacity: activeCharts.charge ? 1 : 0.4 }} onClick={() => toggleChart('charge')}>
          <div className="bess-legend-pill" style={{ background: '#10b981' }}></div>
          Charging Power
        </div>
        <div className="bess-legend-item" style={{ opacity: activeCharts.discharge ? 1 : 0.4 }} onClick={() => toggleChart('discharge')}>
          <div className="bess-legend-pill" style={{ background: '#8b5cf6' }}></div>
          Discharging Power
        </div>
      </div>
    );
  };

  return (
    <div className="bess-wrapper">
      <Topbar />

      <div className="bess-content">
        
        {/* --- BREADCRUMB --- */}
        <div className="bess-header">
          <nav aria-label="breadcrumb" className="bess-breadcrumb">
            <Link to="/dashboard">Home</Link>
            <ChevronRight size={14} color="#94a3b8" aria-hidden="true" />
            <Link to="/dashboard">Dashboard</Link>
            <ChevronRight size={14} color="#94a3b8" aria-hidden="true" />
            <span className="current-page" aria-current="page">BESS</span>
          </nav>
        </div>

        {/* =========================================================
            TẦNG 1: STATE OF CHARGE & TRENDS GRAPH
            ========================================================= */}
        <div className="bess-row-top">
          
          {/* Card 1: State of Charge Gauge */}
          <div className="bess-card">
            <div className="bess-card-title">
              <div className="bess-title-left">State of Charge</div>
              {/* Huy hiệu Capacity */}
              <div className="bess-capacity-badge">{bessSystem.ratedCapacity}</div>
            </div>
            <div className="bess-gauge-chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={socData} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={80} outerRadius={110} stroke="none" dataKey="value">
                    {socData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="bess-gauge-val">{bessSystem.soc.toFixed(1)}<span>%</span></div>
            </div>
            <div className="bess-status-block">
              <div className="bess-status-lbl">System State</div>
              <div className="bess-status-val" style={{ color: stateColors[bessSystem.status] }}>
                {bessSystem.status}
              </div>
            </div>
          </div>

          {/* Card 2: Charge & Discharge Trends Graph */}
          <div className="bess-card">
            <div className="bess-card-title"><div className="bess-title-left">Charge & Discharge Trends</div></div>
            <div className="bess-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                    formatter={(val) => [`${val} kW`]}
                  />
                  <Legend content={renderCustomLegend} verticalAlign="top" />
                  <Area type="monotone" dataKey="charge" stroke="#10b981" strokeWidth={2} fillOpacity={0.15} fill="#10b981" hide={!activeCharts.charge} name="Charge" />
                  <Area type="monotone" dataKey="discharge" stroke="#8b5cf6" strokeWidth={2} fillOpacity={0.15} fill="#8b5cf6" hide={!activeCharts.discharge} name="Discharge" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* =========================================================
            TẦNG 2: 3 THẺ SỐ LIỆU CHI TIẾT & CẢNH BÁO (1:1:1)
            ========================================================= */}
        <div className="bess-row-bot">
          
          {/* Thẻ 1: State of Health & Lifecycle */}
          <div className="bess-card">
            <div className="bess-card-title"><div className="bess-title-left">Battery Health</div></div>
            <div className="bess-data-row">
              <label>Total Cycle Count</label>
              <div className="bess-val-wrap">
                <span className="bess-num">{bessSystem.cycleCount}</span>
                <span className="bess-unit" style={{ width: 'auto' }}>cycles</span>
              </div>
            </div>
            <div className="bess-progress-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>
                <span>State of Health</span>
                <span style={{ color: '#10b981', fontSize: '1.2rem', fontFamily: 'monospace', fontWeight: 800 }}>{bessSystem.soh}%</span>
              </div>
              <div className="bess-progress-bg">
                <div className="bess-progress-fill" style={{ width: `${bessSystem.soh}%`, background: '#10b981' }}></div>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '12px', lineHeight: 1.4, fontWeight: 600 }}>
                Lifespan index is optimal. Battery cell degradation curve tracks normally with current charge profiles.
              </p>
            </div>
          </div>

          {/* Thẻ 2: Battery Parameters (Power, V, A, Temp) */}
          <div className="bess-card">
            <div className="bess-card-title"><div className="bess-title-left">Battery Parameters</div></div>
            
            {/* Thêm Công suất hiện tại */}
            <div className="bess-data-row">
              <label>Active Power</label>
              <div className="bess-val-wrap">
                <span className="bess-num">{bessSystem.metrics.activePower.toFixed(1)}</span>
                <span className="bess-unit">kW</span>
              </div>
            </div>

            <div className="bess-data-row">
              <label>DC Bus Voltage</label>
              <div className="bess-val-wrap">
                <span className="bess-num">{bessSystem.electrical.voltage.toFixed(1)}</span>
                <span className="bess-unit">V</span>
              </div>
            </div>
            <div className="bess-data-row">
              <label>Current</label>
              <div className="bess-val-wrap">
                <span className="bess-num">{bessSystem.electrical.current.toFixed(1)}</span>
                <span className="bess-unit">A</span>
              </div>
            </div>
            <div className="bess-data-row" style={{ borderBottom: 'none' }}>
              <label>Temperature</label>
              <div className="bess-val-wrap">
                <span className="bess-num" style={{ color: bessSystem.electrical.temp > 35 ? '#ef4444' : '#0f172a' }}>
                  {bessSystem.electrical.temp.toFixed(1)}
                </span>
                <span className="bess-unit">°C</span>
              </div>
            </div>
          </div>

          {/* Thẻ 3: System Alerts */}
          <div className="bess-card">
            <div className="bess-card-title"><div className="bess-title-left">Local Alerts</div></div>
            <div className="bess-info-list">
              {bessSystem.alerts.map(item => (
                <div className="bess-list-item" key={item.id}>
                  <div className="bess-item-icon" style={{ background: item.bg, color: item.color }}><item.icon size={18}/></div>
                  <div className="bess-item-content">
                    <span className="bess-item-text">{item.text}</span>
                    <span className="bess-item-time"><Clock size={12}/> {item.time}</span>
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

export default Bess;