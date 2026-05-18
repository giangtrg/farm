import React, { useState, useEffect } from 'react';
import Topbar from './Topbar'; 
import { Link } from 'react-router-dom';
import { ShieldAlert, AlertTriangle, Clock, AlertCircle, Plus, ShieldCheck, ChevronRight, } from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip 
} from 'recharts';
import './GenDetail.css';

// IMPORT ẢNH MÁY PHÁT TỪ THƯ MỤC ASSETS
import genImg from '../assets/80kw_ettespower_ec-80b5_gen01.jpg';

const GenDetail = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // DATA MÔ PHỎNG
  const data = {
    id: 'GEN-01',
    name: 'MWM TCG 2016',
    model: 'EC-80B5',
    manufacturer: 'ETTES POWER',
    rated: '100 kW',
    status: 'RUNNING',
    power: { kw: 124.5, kvar: 111.9, kva: 155.6 },
    voltage: { a: 400.2, b: 399.8, c: 400.5 },
    current: { a: 215.3, b: 218.1, c: 212.5 },
    op: { totalFuel: 1250, fuelRate: 56.5, runtime: 8.5, energy: 1058.2 }, 
    electrical: { speed: 1500, freq: 50.01, pf: 0.82 },
    engine: { totalRuntime: 12450, lastMaint: '15/01/2026' },
    env: { waterTemp: 85, oilPress: 4.2 }
  };

  const trendData = [
    { time: '00:00', power: 150, fuel: 12 },
    { time: '04:00', power: 145, fuel: 11 },
    { time: '08:00', power: 340, fuel: 28 },
    { time: '12:00', power: 480, fuel: 42 },
    { time: '16:00', power: 450, fuel: 39 },
    { time: '20:00', power: 220, fuel: 18 },
    { time: '24:00', power: 140, fuel: 11 }
  ];

  // =========================================================
  // TÍNH TOÁN HIỆU SUẤT NHIÊN LIỆU (kWh/m3) VÀ LOGIC MÀU/COMMENT
  // =========================================================
  const currentEff = data.power.kw / data.op.fuelRate; 
  const effPcnt = Math.min((currentEff / 3.0) * 100, 100); 
  
  let effStatus = { 
    text: 'OPTIMAL', 
    color: '#10b981', 
    icon: ShieldCheck, 
    msg: 'Excellent performance. Energy conversion is highly optimized.' 
  };
  
  if (currentEff < 1.8) {
    effStatus = { 
      text: 'POOR', 
      color: '#ef4444', 
      icon: ShieldAlert, 
      msg: 'Efficiency is below optimal threshold. Inspect air-fuel mixture or ignition.' 
    };
  } else if (currentEff <= 2.2) {
    effStatus = { 
      text: 'STABLE', 
      color: '#f59e0b', 
      icon: AlertCircle, 
      msg: 'Efficiency is stable but could be improved. Monitor inlet gas quality.' 
    };
  }

  const renderGauge = (val, max, color) => {
    const pcnt = Math.min((val / max) * 100, 100);
    const chartData = [{ value: pcnt }, { value: 100 - pcnt }];
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie 
            data={chartData} cx="50%" cy="100%" 
            startAngle={180} endAngle={0} 
            innerRadius={55} outerRadius={75} 
            stroke="none" dataKey="value"
          >
            <Cell fill={color} />
            <Cell fill="#f1f5f9" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="gd-wrapper">
      <Topbar />

      <div className="gd-content">
        <div className="pq-header">
                  {/* --- BREADCRUMB --- */}
                  <nav aria-label="breadcrumb" className="pq-breadcrumb">
                    <Link to="/dashboard">
                      Home
                    </Link>
                    
                    <ChevronRight size={14} color="#94a3b8" aria-hidden="true" />
                    
                    <Link to="/dashboard">
                      Dashboard
                    </Link>

                    <ChevronRight size={14} color="#94a3b8" aria-hidden="true" />
                    
                    <Link to="/dashboard/gensets">
                      Gensets
                    </Link>
        
                    <ChevronRight size={14} color="#94a3b8" aria-hidden="true" />
                    
                    <span className="current-page" aria-current="page">
                      Detail
                    </span>
                  </nav>
                </div>
        {/* --- TẦNG 1: PROFILE / POWER / VOLTAGE GAUGE --- */}
        <div className="gd-row">
          
          <div className="gd-card">
            <div className="gd-profile-top">
              <div className="gd-img-box" style={{ overflow: 'hidden', padding: 0, background: 'transparent' }}>
                <img src={genImg} alt="Genset" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="gd-info-main">
                <p>{data.id}</p>
                <h2 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{data.name}</h2>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, lineHeight: '1.4' }}>
                  Manufacturer: <span style={{color: '#0f172a'}}>{data.manufacturer}</span><br/>
                  Model: <span style={{color: '#0f172a'}}>{data.model}</span>
                </div>
                <div className="gd-rated" style={{ marginTop: '6px' }}>POWER: {data.rated}</div>
              </div>
            </div>
            <div className="gd-status-block">
              <div className="gd-status-lbl">Run Status</div>
              <div className="gd-status-val" style={{color: data.status==='RUNNING'?'#10b981':data.status==='STOP'?'#ef4444':'#94a3b8'}}>
                {data.status}
              </div>
            </div>
          </div>

          <div className="gd-card">
            <div className="gd-card-title">Power Parameters</div>
            {[
              { lbl: 'Active', val: data.power.kw, max: 500, color: '#3b82f6', unit: 'kW' },
              { lbl: 'Reactive', val: data.power.kvar, max: 600, color: '#8b5cf6', unit: 'kVAr' },
              { lbl: 'Apparent', val: data.power.kva, max: 400, color: '#0ea5e9', unit: 'kVA' }
            ].map((p, i) => (
              <div key={i} style={{ marginBottom: '16px' }}>
                <div className="gd-data-row" style={{ padding: '0 0 6px 0' }}>
                  <label>{p.lbl}</label>
                  <div className="gd-val-wrap">
                    <span className="gd-num">{p.val.toFixed(1)}</span>
                    <span className="gd-unit">{p.unit}</span>
                  </div>
                </div>
                <div className="gd-progress-bg"><div className="gd-progress-fill" style={{ width: `${(p.val/p.max)*100}%`, background: p.color }}></div></div>
              </div>
            ))}
          </div>

          <div className="gd-card">
            <div className="gd-card-title">Voltage L-N (V)</div>
            <div className="gd-gauge-grid">
              {['A', 'B', 'C'].map(phase => (
                <div className="gd-gauge-item" key={phase}>
                  <div className="gd-gauge-lbl">Phase {phase}</div>
                  <div className="gd-gauge-chart-box">
                    {renderGauge(data.voltage[phase.toLowerCase()], 500, '#f59e0b')}
                    <div className="gd-gauge-num">{data.voltage[phase.toLowerCase()]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- TẦNG 2: OPERATION / ELECTRICAL / CURRENT GAUGE --- */}
        <div className="gd-row">
          
          <div className="gd-card">
            <div className="gd-card-title">Operational Data</div>
            <div className="gd-data-row">
              <label>Current Fuel Rate</label>
              <div className="gd-val-wrap">
                <span className="gd-num">{data.op.fuelRate}</span>
                <span className="gd-unit">m³/h</span>
              </div>
            </div>
            <div className="gd-data-row">
              <label>Total Fuel</label>
              <div className="gd-val-wrap">
                <span className="gd-num">{data.op.totalFuel}</span>
                <span className="gd-unit">m³</span>
              </div>
            </div>
            <div className="gd-data-row">
              <label>Run Time</label>
              <div className="gd-val-wrap">
                <span className="gd-num">{data.op.runtime.toFixed(1)}</span>
                <span className="gd-unit">h</span>
              </div>
            </div>
          </div>

          <div className="gd-card">
            <div className="gd-card-title">Electrical Data</div>
            <div className="gd-data-row">
              <label>Speed</label>
              <div className="gd-val-wrap">
                <span className="gd-num">{data.electrical.speed}</span>
                <span className="gd-unit">RPM</span>
              </div>
            </div>
            <div className="gd-data-row">
              <label>Frequency</label>
              <div className="gd-val-wrap">
                <span className="gd-num">{data.electrical.freq.toFixed(2)}</span>
                <span className="gd-unit">Hz</span>
              </div>
            </div>
            <div className="gd-data-row">
              <label>Power Factor</label>
              <div className="gd-val-wrap">
                <span className="gd-num">{data.electrical.pf}</span>
                <span className="gd-unit"></span>
              </div>
            </div>
          </div>

          <div className="gd-card">
            <div className="gd-card-title">Current (A)</div>
            <div className="gd-gauge-grid">
              {['A', 'B', 'C'].map(phase => (
                <div className="gd-gauge-item" key={phase}>
                  <div className="gd-gauge-lbl">Phase {phase}</div>
                  <div className="gd-gauge-chart-box">
                    {renderGauge(data.current[phase.toLowerCase()], 300, '#10b981')}
                    <div className="gd-gauge-num">{data.current[phase.toLowerCase()]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- TẦNG 3: ENVIRONMENT / CUSTOM DATA / ENGINE LIFECYCLE --- */}
        <div className="gd-row row-3">
          
          <div className="gd-card">
            <div className="gd-card-title">Environmental Data</div>
            <div className="gd-data-row">
              <label>Water Temp</label>
              <div className="gd-val-wrap">
                <span className="gd-num">{data.env.waterTemp}</span>
                <span className="gd-unit">°C</span>
              </div>
            </div>
            <div className="gd-data-row">
              <label>Oil Pressure</label>
              <div className="gd-val-wrap">
                <span className="gd-num">{data.env.oilPress.toFixed(1)}</span>
                <span className="gd-unit">bar</span>
              </div>
            </div>
          </div>

          <div className="gd-card">
            <div className="gd-card-title">Custom Data</div>
            <div className="gd-custom-data-wrap">
              <button className="gd-btn-add">
                <Plus size={16} /> Add Custom Field
              </button>
            </div>
          </div>

          <div className="gd-card">
            <div className="gd-card-title">Engine Lifecycle</div>
            <div className="gd-split-container">
              <div className="gd-split-box left">
                <div className="gd-label-top">Total Runtime</div>
                <div className="gd-value-bot">{data.engine.totalRuntime.toLocaleString()}<span>h</span></div>
              </div>
              <div className="gd-split-box">
                <div className="gd-label-top">Last Service</div>
                <div className="gd-value-bot" style={{fontFamily: "'Segoe UI', sans-serif"}}>{data.engine.lastMaint}</div>
              </div>
            </div>
          </div>

        </div>

        {/* --- TẦNG 4: EFFICIENCY INDEX & ALERTS --- */}
        <div className="gd-row row-4">
          
          <div className="gd-card">
            <div className="gd-card-title">Fuel Efficiency Index</div>
            
            <div className="gd-eff-container">
              
              <div className="gd-eff-row">
                <label>Current Efficiency</label>
                <div className="gd-val-wrap">
                  <span className="gd-eff-value" style={{ color: effStatus.color }}>
                    {currentEff.toFixed(2)}
                  </span>
                  <span className="gd-eff-unit">kWh/m³</span>
                </div>
              </div>
              
              <div className="gd-eff-bar-wrap">
                
                {/* ĐÃ FIX MARKER (Thêm borderTop rõ ràng) */}
                <div 
                  className="gd-eff-marker"
                  style={{ 
                    left: `calc(${effPcnt}% - 6px)`, 
                    borderTop: `10px solid ${effStatus.color}` 
                  }}
                ></div>

                <div className="gd-eff-bar-bg">
                  <div style={{ width: '60%', background: currentEff < 1.8 ? '#ef4444' : '#fee2e2' }}></div>
                  <div style={{ width: '13.33%', background: (currentEff >= 1.8 && currentEff <= 2.2) ? '#f59e0b' : '#fef3c7' }}></div>
                  <div style={{ width: '26.67%', background: currentEff > 2.2 ? '#10b981' : '#d1fae5' }}></div>
                </div>
                
                <div className="gd-eff-labels">
                  <span className="gd-eff-label" style={{ left: '0', color: '#94a3b8' }}>0.0</span>
                  <span className="gd-eff-label center" style={{ left: '60%', color: currentEff < 1.8 ? '#ef4444' : '#94a3b8' }}>1.8 (POOR)</span>
                  <span className="gd-eff-label center" style={{ left: '73.33%', color: (currentEff >= 1.8 && currentEff <= 2.2) ? '#f59e0b' : '#94a3b8' }}>2.2 (STABLE)</span>
                  <span className="gd-eff-label" style={{ right: '0', color: currentEff > 2.2 ? '#10b981' : '#94a3b8' }}>3.0 (OPTIMAL)</span>
                </div>
              </div>

            </div>

            <div className="gd-eff-footer">
              <div className="gd-eff-footer-icon"><effStatus.icon size={18} color={effStatus.color} /></div>
              <div>
                <span style={{ color: effStatus.color, fontWeight: 800, textTransform: 'uppercase' }}>{effStatus.text}: </span> 
                {effStatus.msg}
              </div>
            </div>
          </div>

          <div className="gd-card">
            <div className="gd-card-title alerts-title">Local Alerts</div>
            
            <div className="gd-info-list">
              <div className="gd-list-item">
                <div className="gd-item-icon" style={{background: '#fee2e2', color: '#ef4444'}}>
                  <ShieldAlert size={18} />
                </div>
                <div className="gd-item-content">
                  <span className="gd-item-text">Abnormal Vibration</span>
                  <span className="gd-item-time"><Clock size={12}/> 5 mins ago</span>
                </div>
              </div>

              <div className="gd-list-item">
                <div className="gd-item-icon" style={{background: '#fef3c7', color: '#f59e0b'}}>
                  <AlertCircle size={18} />
                </div>
                <div className="gd-item-content">
                  <span className="gd-item-text">High Coolant Temp</span>
                  <span className="gd-item-time"><Clock size={12}/> 15 mins ago</span>
                </div>
              </div>

              <div className="gd-list-item">
                <div className="gd-item-icon" style={{background: '#f1f5f9', color: '#94a3b8'}}>
                  <AlertTriangle size={18} />
                </div>
                <div className="gd-item-content">
                  <span className="gd-item-text">Scheduled Maintenance</span>
                  <span className="gd-item-time"><Clock size={12}/> 1 hour ago</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default GenDetail;