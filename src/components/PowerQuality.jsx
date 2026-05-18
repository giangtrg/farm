import React, { useState, useMemo, useEffect } from 'react';
import Topbar from './Topbar'; 
import { Link } from 'react-router-dom';
import { 
  Search, Download, Activity, Zap, Database, Clock, Radar, History, AlertTriangle, Target, ChevronRight,
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceArea, ReferenceLine, Cell 
} from 'recharts';
import './PowerQuality.css';

// ==========================================================================
// MOCK DATA GENERATORS
// ==========================================================================

const generateSystemData = (generator, end) => {
  const trendData = [];
  const events = [];
  const baseV = 220; 
  
  for (let i = 0; i < 144; i++) { 
    const time = new Date(new Date(end).getTime() - (144 - i) * 10 * 60000);
    const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let v1 = baseV + (Math.random() * 4 - 2);
    let v2 = baseV + (Math.random() * 4 - 2);
    let v3 = baseV + (Math.random() * 4 - 2);
    
    let i1 = 120 + Math.random() * 6;
    let i2 = 118 + Math.random() * 6;
    let i3 = 122 + Math.random() * 6;

    let thd = 1.5 + Math.random() * 1.0;
    let unbalance = 0.5 + Math.random() * 0.5;
    let freq = 50 + (Math.random() * 0.04 - 0.02);
    let pf = 0.95 + Math.random() * 0.03;

    if (i >= 19 && i <= 21) { v1 = 0; v2 = 0; v3 = 0; i1 = 0; i2 = 0; i3 = 0; } // Interruption
    if (i >= 38 && i <= 42) { v1 *= 0.8; v2 *= 0.8; v3 *= 0.8; i1 *= 1.5; i2 *= 1.5; i3 *= 1.5; } // Sag
    if (i >= 58 && i <= 62) { v1 *= 1.15; v2 *= 1.15; v3 *= 1.15; i1 *= 0.5; i2 *= 0.5; i3 *= 0.5; } // Swell
    if (i === 80) { v1 += 60; } // Transient
    if (i >= 98 && i <= 102) { thd = 8.5 + Math.random() * 2; } // THD
    if (i >= 118 && i <= 122) { v1 = 195; v2 = 230; v3 = 232; unbalance = 6.2 + Math.random(); } // Unbalance
    if (i >= 133 && i <= 137) { v1 += (i % 2 === 0 ? 8 : -8); v2 += (i % 2 === 0 ? 8 : -8); v3 += (i % 2 === 0 ? 8 : -8); } // Flicker

    trendData.push({
      time: timeStr,
      dateLabel: time.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      v1: parseFloat(v1.toFixed(1)), v2: parseFloat(v2.toFixed(1)), v3: parseFloat(v3.toFixed(1)),
      i1: parseFloat(i1.toFixed(1)), i2: parseFloat(i2.toFixed(1)), i3: parseFloat(i3.toFixed(1)),
      frequency: parseFloat(freq.toFixed(2)),
      pf: parseFloat(pf.toFixed(3)),
      thd: parseFloat(thd.toFixed(2)),
      unbalance: parseFloat(unbalance.toFixed(2))
    });
  }

  events.push({ id: `EVT-1001`, time: trendData[20].time, timeStart: trendData[18].time, timeEnd: trendData[22].time, type: 'Interruption', severity: 'CRITICAL', desc: 'Total loss of supply voltage. Main breaker trip suspected.' });
  events.push({ id: `EVT-1002`, time: trendData[40].time, timeStart: trendData[37].time, timeEnd: trendData[43].time, type: 'Sag', severity: 'WARNING', desc: 'Voltage dip to ~176V across all phases. Heavy motor inrush.' });
  events.push({ id: `EVT-1003`, time: trendData[60].time, timeStart: trendData[57].time, timeEnd: trendData[63].time, type: 'Swell', severity: 'WARNING', desc: 'Voltage swell to ~253V. Sudden load shedding event.' });
  events.push({ id: `EVT-1004`, time: trendData[80].time, timeStart: trendData[79].time, timeEnd: trendData[81].time, type: 'Transient', severity: 'CRITICAL', desc: 'Sub-cycle high-voltage spike detected on L1.' });
  events.push({ id: `EVT-1005`, time: trendData[100].time, timeStart: trendData[97].time, timeEnd: trendData[103].time, type: 'THD', severity: 'CRITICAL', desc: 'Total Harmonic Distortion > 8%. Nonlinear load interference.' });
  events.push({ id: `EVT-1006`, time: trendData[120].time, timeStart: trendData[117].time, timeEnd: trendData[123].time, type: 'Unbalance', severity: 'CRITICAL', desc: 'Phase unbalance > 6%. Asymmetrical loading detected.' });
  events.push({ id: `EVT-1007`, time: trendData[135].time, timeStart: trendData[132].time, timeEnd: trendData[138].time, type: 'Flicker', severity: 'WARNING', desc: 'Rapid voltage fluctuations. Plt index elevated.' });

  return { trendData, events: events.reverse() }; 
};

const generateWaveform = (eventType) => {
  const data = [];
  for (let i = 0; i <= 100; i++) { 
    const angle = (i / 20) * Math.PI * 2;
    let l1 = Math.sin(angle); 
    let l2 = Math.sin(angle - (2 * Math.PI) / 3); 
    let l3 = Math.sin(angle - (4 * Math.PI) / 3);

    // Đồng bộ logic Trigger (Mốc bắt đầu lỗi)
    if (eventType === 'Sag' && i >= 30) { l1 *= 0.8; l2 *= 0.8; l3 *= 0.8; } 
    if (eventType === 'Swell' && i >= 30) { l1 *= 1.2; l2 *= 1.2; l3 *= 1.2; } 
    if (eventType === 'Interruption' && i >= 15 && i <= 85) { l1 = 0; l2 = 0; l3 = 0; } 
    if (eventType === 'Unbalance' && i >= 20) { l1 *= 0.85; l2 *= 1.05; l3 *= 1.05; } 
    if (eventType === 'Transient' && i === 45) { l1 *= 2.5; } 
    if (eventType === 'THD') {
      const noise = 0.15 * Math.sin(5 * angle) + 0.1 * Math.sin(7 * angle);
      l1 += noise; l2 += noise; l3 += noise;
    }
    if (eventType === 'Flicker') {
      const mod = 1 + 0.1 * Math.sin(i * Math.PI / 5);
      l1 *= mod; l2 *= mod; l3 *= mod;
    }

    data.push({ time: i, L1: l1.toFixed(3), L2: l2.toFixed(3), L3: l3.toFixed(3) });
  }
  return data;
};

const generateHarmonics = (eventType) => {
  const data = [];
  const ranks = ['1st', '3rd', '5th', '7th', '9th', '11th', '13th'];
  ranks.forEach((rank) => {
    let amp = Math.random() * 0.5; 
    if (rank === '1st') amp = 100; 
    if (eventType === 'THD') {
      if (rank === '3rd') amp = 6.5; if (rank === '5th') amp = 8.2; if (rank === '7th') amp = 4.2;
    }
    if (eventType === 'Transient' || eventType === 'Swell') {
      if (rank === '3rd') amp = 3.5;
    }
    data.push({ rank, amplitude: parseFloat(amp.toFixed(2)) });
  });
  return data;
};

// ==========================================================================
// COMPONENT CUSTOM MARKER CHO HISTORY
// ==========================================================================
const CustomEventMarker = ({ viewBox, event }) => {
  if (!viewBox || !event) return null;
  const { x, y, height } = viewBox;
  const color = event.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b';
  
  return (
    <g>
      <defs>
        <linearGradient id={`grad-${event.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.4} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect x={x - 20} y={y} width={40} height={height} fill={`url(#grad-${event.id})`} />
      
      <g transform={`translate(${x}, ${y + 20})`}>
        <rect x="-60" y="-12" width="120" height="24" rx="12" fill={color} opacity="0.95" />
        <text x="0" y="4" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">
          {event.type}
        </text>
        <circle cx="0" cy="20" r="4" fill={color} />
        <circle cx="0" cy="20" r="10" fill={color} opacity="0.4">
          <animate attributeName="r" values="4;12;4" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
        </circle>
      </g>
    </g>
  );
};

// ==========================================================================
// MAIN COMPONENT
// ==========================================================================

const PowerQuality = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [generator, setGenerator] = useState('Biogas Genset 1');
  const [startDate, setStartDate] = useState('2026-04-12');
  const [endDate, setEndDate] = useState('2026-04-13');
  
  const [loading, setLoading] = useState(false);
  const [trendData, setTrendData] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('voltage'); 

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      const { trendData: newTrend, events: newEvents } = generateSystemData(generator, endDate);
      setTrendData(newTrend);
      setEvents(newEvents);
      setSelectedEvent(newEvents[0]);
      setLoading(false);
    }, 800);
  };

  useEffect(() => { fetchData(); }, []);

  // TRẢ LẠI CHÍNH XÁC THỜI GIAN BẮT ĐẦU CHO MỌI SỰ KIỆN TRÊN WAVEFORM
  const snapshots = useMemo(() => {
    if (!selectedEvent) return { waveform: [], harmonics: [], eventStartMs: null };
    
    let eventStartMs = null;
    if (selectedEvent.type === 'Sag') eventStartMs = 30; 
    if (selectedEvent.type === 'Swell') eventStartMs = 30;
    if (selectedEvent.type === 'Interruption') eventStartMs = 15;
    if (selectedEvent.type === 'Unbalance') eventStartMs = 20;
    if (selectedEvent.type === 'Transient') eventStartMs = 45; 
    // THD và Flicker là lỗi liên tục nên không cần marker bắt đầu
    
    return {
      waveform: generateWaveform(selectedEvent.type),
      harmonics: generateHarmonics(selectedEvent.type),
      eventStartMs
    };
  }, [selectedEvent]);

  // TRẢ LẠI Avg Power Factor VÀO KPI
  const kpiStats = useMemo(() => {
    if (trendData.length === 0) return { thdAvg: 0, unbAvg: 0, freqAvg: 0, pfAvg: 0 };
    let sumThd = 0, sumUnb = 0, sumFreq = 0, sumPf = 0;
    trendData.forEach(d => {
      sumThd += d.thd; 
      sumUnb += d.unbalance;
      sumFreq += parseFloat(d.frequency);
      sumPf += parseFloat(d.pf);
    });
    return {
      thdAvg: (sumThd / trendData.length).toFixed(2),
      unbAvg: (sumUnb / trendData.length).toFixed(2),
      freqAvg: (sumFreq / trendData.length).toFixed(2),
      pfAvg: (sumPf / trendData.length).toFixed(3)
    };
  }, [trendData]);

  // ==========================================================================
  // PHASOR DATA (TÍNH TOÁN LỆCH GÓC & VẼ NÉT ĐỨT ĐỎ BÁO LỖI CHUẨN)
  // ==========================================================================
  const phasorDrawData = useMemo(() => {
    const ideal = {
      L1: { mag: 140, ang: 0 },
      L2: { mag: 140, ang: 120 },
      L3: { mag: 140, ang: -120 }
    };
    
    const actual = {
      L1: { mag: 110, ang: 0, vReal: 220 },
      L2: { mag: 110, ang: 120, vReal: 220 },
      L3: { mag: 110, ang: -120, vReal: 220 }
    };

    if (selectedEvent?.type === 'Sag') {
      actual.L1.mag = 88; actual.L1.vReal = 176;
      actual.L2.mag = 88; actual.L2.vReal = 176;
      actual.L3.mag = 88; actual.L3.vReal = 176;
    }
    if (selectedEvent?.type === 'Swell') {
      actual.L1.mag = 125; actual.L1.vReal = 250;
      actual.L2.mag = 125; actual.L2.vReal = 250;
      actual.L3.mag = 125; actual.L3.vReal = 250;
    }
    if (selectedEvent?.type === 'Interruption') {
      actual.L1.mag = 0; actual.L1.vReal = 0;
      actual.L2.mag = 0; actual.L2.vReal = 0;
      actual.L3.mag = 0; actual.L3.vReal = 0;
    }
    if (selectedEvent?.type === 'Unbalance') {
      actual.L1.mag = 95; actual.L1.vReal = 190;
      actual.L2.mag = 115; actual.L2.vReal = 230;
      actual.L3.mag = 115; actual.L3.ang = -140; actual.L3.vReal = 230; // L3 lệch góc 20 độ
    }

    const getCoords = (mag, ang) => {
      const rad = (ang * Math.PI) / 180;
      return { x: 150 + mag * Math.cos(rad), y: 150 + mag * Math.sin(rad) };
    };

    return ['L1', 'L2', 'L3'].map(phase => {
      const vDiff = actual[phase].vReal - 220;
      const angDiff = actual[phase].ang - ideal[phase].ang;
      const isDeviated = Math.abs(vDiff) > 5 || Math.abs(angDiff) > 0;

      // Tính điểm Neo (Nominal Coord) để kẻ nét đứt màu đỏ: 
      // Vị trí mà đáng lẽ vector phải nằm đó (Mag 110, Góc chuẩn)
      const nominalCoords = getCoords(110, ideal[phase].ang);

      return {
        phase,
        iCoords: getCoords(ideal[phase].mag, ideal[phase].ang),
        aCoords: getCoords(actual[phase].mag, actual[phase].ang),
        nominalCoords,
        isDeviated, 
        vDiff,
        angDiff
      };
    });
  }, [selectedEvent]);

  const renderCustomLegend = (items) => (
    <div className="pq-custom-legend">
      {items.map((item, idx) => (
        <div key={idx} className="pq-legend-item">
          <div className="pq-legend-color" style={{ background: item.color }}></div>
          {item.name}
        </div>
      ))}
    </div>
  );

  const getMetricLegends = () => {
    return [
      { name: 'Phase L1', color: '#ef4444' }, { name: 'Phase L2', color: '#f59e0b' }, { name: 'Phase L3', color: '#3b82f6' }
    ];
  };

  return (
    <div className="pq-wrapper">
      <Topbar />

      <div className="pq-content">
        
        {/* HEADER */}
        <div className="pq-header">
          {/* --- BREADCRUMB --- */}
          <nav aria-label="breadcrumb" className="pq-breadcrumb">
            <Link to="/dashboard">
              Home
            </Link>
            
            <ChevronRight size={14} color="#94a3b8" aria-hidden="true" />
            
            <Link to="/analysis">
              Analysis
            </Link>

            <ChevronRight size={14} color="#94a3b8" aria-hidden="true" />
            
            <span className="current-page" aria-current="page">
              Power Quality
            </span>
          </nav>
        </div>

        {/* --- DẢI ĐIỀU KHIỂN --- */}
        <div className="pq-filter-bar">
          <div className="pq-filter-group">
            <div className="pq-input-group">
              <span className="pq-label">Source:</span>
              <select className="pq-select" value={generator} onChange={e => setGenerator(e.target.value)}>
                <option value="Biogas Genset 1">Biogas Genset 1</option>
                <option value="Biogas Genset 2">Biogas Genset 2</option>
                <option value="Main Grid">Main Grid</option>
              </select>
            </div>
            <div className="pq-input-group">
              <span className="pq-label">From:</span>
              <input type="date" className="pq-date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="pq-input-group">
              <span className="pq-label">To:</span>
              <input type="date" className="pq-date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <button className="pq-btn" onClick={fetchData} disabled={loading}>
              <Search size={18}/> {loading ? 'Loading...' : 'Load'}
            </button>
          </div>
          <button className="pq-btn pq-btn-outline"><Download size={18}/> Export</button>
        </div>

        {/* =========================================================
            GRID 7:3 
            ========================================================= */}
        <div className="pq-grid-main">
          
          <div className="pq-grid-col-left">
            
            {/* HÀNG 1: KPI & PHASOR DIAGRAM */}
            <div className="pq-card-panel">
              <div className="pq-panel-title">
                <div className="pq-title-left">Phasor Diagram</div>
              </div>
              
              <div className="pq-kpi-phasor-row">
                
                <div className="pq-kpi-grid">
                  <div className="pq-kpi-box">
                    <div className="pq-kpi-header">
                      <span className="pq-kpi-lbl">Avg THD Voltage</span>
                      <div className="pq-kpi-icon"><Activity size={18}/></div>
                    </div>
                    <span className="pq-kpi-val">{kpiStats.thdAvg}%</span>
                  </div>
                  
                  <div className="pq-kpi-box">
                    <div className="pq-kpi-header">
                      <span className="pq-kpi-lbl">Avg Frequency</span>
                      <div className="pq-kpi-icon"><Zap size={18}/></div>
                    </div>
                    <span className="pq-kpi-val">{kpiStats.freqAvg} <span style={{fontSize:'1rem', color:'#94a3b8'}}>Hz</span></span>
                  </div>

                  <div className="pq-kpi-box">
                    <div className="pq-kpi-header">
                      <span className="pq-kpi-lbl">Phase Unbalance</span>
                      <div className="pq-kpi-icon"><Target size={18}/></div>
                    </div>
                    <span className="pq-kpi-val">{kpiStats.unbAvg}%</span>
                  </div>

                  {/* ĐÃ TRẢ LẠI Avg Power Factor */}
                  <div className="pq-kpi-box">
                    <div className="pq-kpi-header">
                      <span className="pq-kpi-lbl">Avg Power Factor</span>
                      <div className="pq-kpi-icon"><Database size={18}/></div>
                    </div>
                    <span className="pq-kpi-val">{kpiStats.pfAvg}</span>
                  </div>
                </div>

                {/* PHASOR DIAGRAM (CÓ ĐÁNH DẤU LỆCH V VÀ GÓC) */}
                <div className="pq-phasor-box">
                  <svg viewBox="0 0 300 300" width="100%" height="100%" style={{maxHeight: '260px'}}>
                    <circle cx="150" cy="150" r="140" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="8 6" />
                    <circle cx="150" cy="150" r="90" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="8 6" />
                    <circle cx="150" cy="150" r="40" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="8 6" />
                    <line x1="10" y1="150" x2="290" y2="150" stroke="#94a3b8" strokeWidth="2" strokeDasharray="8 6" />
                    <line x1="150" y1="10" x2="150" y2="290" stroke="#94a3b8" strokeWidth="2" strokeDasharray="8 6" />
                    
                    <defs>
                      <marker id="arr-L1" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#ef4444" /></marker>
                      <marker id="arr-L2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b" /></marker>
                      <marker id="arr-L3" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#3b82f6" /></marker>
                    </defs>

                    {phasorDrawData.map((p) => {
                      const color = p.phase === 'L1' ? '#ef4444' : p.phase === 'L2' ? '#f59e0b' : '#3b82f6';
                      return (
                        <g key={p.phase}>
                          {/* Đường chuẩn kéo dài tới rìa */}
                          <line x1="150" y1="150" x2={p.iCoords.x} y2={p.iCoords.y} stroke={color} strokeWidth="2.5" strokeDasharray="6 4" opacity="0.6" />
                          {/* Vector thực tế */}
                          <line x1="150" y1="150" x2={p.aCoords.x} y2={p.aCoords.y} stroke={color} strokeWidth="3" markerEnd={`url(#arr-${p.phase})`} />
                          
                          {/* Đánh dấu chênh lệch */}
                          {p.isDeviated && (
                            <g>
                              {/* Nối nét đứt từ Nominal đến Actual */}
                              <line x1={p.nominalCoords.x} y1={p.nominalCoords.y} x2={p.aCoords.x} y2={p.aCoords.y} stroke="#dc2626" strokeWidth="1.5" strokeDasharray="2 2" />
                              <text 
                                x={(p.nominalCoords.x + p.aCoords.x) / 2 + 10} 
                                y={(p.nominalCoords.y + p.aCoords.y) / 2} 
                                fill="#dc2626" fontSize="13" fontWeight="bold"
                                filter="drop-shadow(0px 1px 2px rgba(255,255,255,1))"
                              >
                                {p.vDiff !== 0 ? `${p.vDiff > 0 ? '+' : ''}${p.vDiff}V ` : ''}
                                {p.angDiff !== 0 ? `${p.angDiff > 0 ? '+' : ''}${p.angDiff}°` : ''}
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>

              </div>
            </div>

            {/* HÀNG 2: HISTORY TREND */}
            <div className="pq-card-panel">
              <div className="pq-panel-title">
                <div className="pq-title-left">Historical Operational Trend</div>
                <div className="pq-title-controls">
                  <select 
                    className="pq-select" style={{padding: '6px 12px'}} 
                    value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)}
                  >
                    <option value="voltage">3-Phase Voltage (V)</option>
                    <option value="current">3-Phase Current (A)</option>
                  </select>
                </div>
              </div>

              <div className="pq-trend-box">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} interval="preserveStartEnd" minTickGap={30} />
                    
                    <YAxis axisLine={false} tickLine={false} domain={['auto', 'auto']} tick={{fontSize: 12, fill: '#94a3b8'}} width={40} />

                    {selectedEvent && selectedEvent.type !== 'Nominal Snapshot' && (
                      <ReferenceArea 
                        x1={selectedEvent.timeStart} 
                        x2={selectedEvent.timeEnd} 
                        fill={selectedEvent.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b'} 
                        fillOpacity={0.15} 
                      />
                    )}

                    {selectedEvent && selectedEvent.type !== 'Nominal Snapshot' && (
                      <ReferenceLine 
                        x={selectedEvent.time} 
                        stroke="none"
                        shape={<CustomEventMarker event={selectedEvent} />}
                      />
                    )}

                    <RechartsTooltip 
                      contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 10px 30px rgba(0,0,0,0.1)'}} 
                      labelFormatter={(label, payload) => payload.length > 0 ? `${payload[0].payload.dateLabel} - ${label}` : label}
                    />
                    
                    {selectedMetric === 'voltage' ? (
                      <>
                        <Line type="monotone" dataKey="v1" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} name="L1 (V)"/>
                        <Line type="monotone" dataKey="v2" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} name="L2 (V)"/>
                        <Line type="monotone" dataKey="v3" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} name="L3 (V)"/>
                      </>
                    ) : (
                      <>
                        <Line type="monotone" dataKey="i1" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} name="L1 (A)"/>
                        <Line type="monotone" dataKey="i2" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} name="L2 (A)"/>
                        <Line type="monotone" dataKey="i3" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} name="L3 (A)"/>
                      </>
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {renderCustomLegend(getMetricLegends())}
            </div>
          </div>

          {/* CỘT PHẢI (3) - EVENT LOG */}
          <div className="pq-card-panel" style={{height: '100%', padding: '24px 0'}}>
            <div className="pq-panel-title" style={{padding: '0 24px'}}>
              <div className="pq-title-left">Event Log</div>
            </div>
            
            <div className="pq-info-list" style={{padding: '0 16px 0 24px'}}>
              {events.map((evt) => (
                <div 
                  key={evt.id} 
                  className={`pq-list-item ${selectedEvent?.id === evt.id ? 'active' : ''}`}
                  onClick={() => setSelectedEvent(evt)}
                >
                  <div className="pq-item-header">
                    <span className="pq-item-title" style={{color: evt.severity === 'CRITICAL' ? '#ef4444' : (evt.severity === 'WARNING' ? '#f59e0b' : '#0f172a')}}>
                      {evt.type}
                    </span>
                  </div>
                  <p className="pq-item-desc">{evt.desc}</p>
                  <div className="pq-item-time">
                    <Clock size={12}/> {evt.date}, {evt.time}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* =========================================================
            GRID 5:5 - HÀNG 3 (WAVEFORM & HARMONICS)
            ========================================================= */}
        <div className="pq-grid-bottom">
          
          {/* TRÁI: WAVEFORM */}
          <div className="pq-card-panel">
            <div className="pq-chart-header">
              <h4>Waveform</h4>
            </div>
            <div className="pq-chart-mini">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={snapshots.waveform} margin={{ top: 25, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} tickFormatter={(t) => `${t}ms`} />
                  <YAxis axisLine={false} tickLine={false} domain={[-1.5, 1.5]} tick={{fontSize: 12, fill: '#94a3b8'}} width={40} />
                  <RechartsTooltip contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 10px 30px rgba(0,0,0,0.1)'}}/>
                  
                  {/* MARKER VỊ TRÍ EVENT START BẰNG NÉT LIỀN */}
                  {snapshots.eventStartMs && (
                    <ReferenceLine 
                      x={snapshots.eventStartMs} 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      label={{ position: 'top', value: 'Event Start', fill: '#ef4444', fontSize: 11, fontWeight: 800 }} 
                    />
                  )}

                  <Line type="monotone" dataKey="L1" stroke="#ef4444" dot={false} strokeWidth={2} isAnimationActive={false} />
                  <Line type="monotone" dataKey="L2" stroke="#f59e0b" dot={false} strokeWidth={2} isAnimationActive={false} />
                  <Line type="monotone" dataKey="L3" stroke="#3b82f6" dot={false} strokeWidth={2} isAnimationActive={false} />
                  <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {renderCustomLegend([
              { name: 'Phase L1', color: '#ef4444' }, { name: 'Phase L2', color: '#f59e0b' }, { name: 'Phase L3', color: '#3b82f6' }
            ])}
          </div>

          {/* PHẢI: HARMONICS */}
          <div className="pq-card-panel">
            <div className="pq-chart-header">
              <h4>Harmonic Spectrum</h4>
            </div>
            <div className="pq-chart-mini">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={snapshots.harmonics} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="rank" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} width={40} />
                  <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 10px 30px rgba(0,0,0,0.1)'}} />
                  
                  <Bar dataKey="amplitude" name="Magnitude (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={28} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PowerQuality;