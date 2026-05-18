import React, { useState, useEffect } from 'react';
import Topbar from './Topbar'; 
import { Link } from 'react-router-dom';
import { 
  Wind as WindIcon, Activity, RotateCw, 
  MoreHorizontal, CloudLightning, ChevronRight, Scale, Clock
} from 'lucide-react';
import { 
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import './WindTurbine.css';

// ==========================================================================
// MOCK DATA GENERATION
// ==========================================================================
const generateWindPowerCurve = () => {
  const data = [];
  const ratedPower = 500; 
  const cutInSpeed = 3.0; 
  const ratedSpeed = 12.0; 
  const cutOutSpeed = 25.0; 

  for (let v = 0; v <= cutOutSpeed; v += 1) {
    let idealPower = 0;
    
    if (v >= cutInSpeed && v <= ratedSpeed) {
      const scale = (v ** 3 - cutInSpeed ** 3) / (ratedSpeed ** 3 - cutInSpeed ** 3);
      idealPower = ratedPower * scale;
    } else if (v > ratedSpeed && v <= cutOutSpeed) {
      idealPower = ratedPower; 
    }

    let realPower = 0;
    if (idealPower > 0) {
      const efficiency = 0.85 + (Math.random() * 0.1); 
      realPower = idealPower * efficiency;
      if (realPower > ratedPower) realPower = ratedPower; 
    }

    data.push({
      windSpeed: v,
      idealPower: +idealPower.toFixed(1),
      realPower: +realPower.toFixed(1)
    });
  }
  return data;
};

const powerCurveData = generateWindPowerCurve();

// SVG Utility functions for 300-degree gauge
const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
};

const describeArc = (x, y, radius, startAngle, endAngle) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y, 
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
};

const WindTurbine = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // System Parameters
  const currentPower = 332;
  const maxPower = 500; 
  const currentWindSpeed = 8.6;
  const currentWindDirection = 45; // NE

  // Legend Render
  const renderPowerCurveLegend = () => (
    <div className="wind-powercurve-legend">
      <div className="wind-pcl-item"><div className="wind-pcl-dot" style={{ background: '#3b82f6' }}></div> Real Power (kW)</div>
      <div className="wind-pcl-item"><div className="wind-pcl-dash" style={{ color: '#94a3b8' }}></div> MPPT Ideal Curve (kW)</div>
    </div>
  );

  // --- 300-Degree Gauge Calculations ---
  const gaugeRadius = 100;
  const gaugeWidth = 18;
  const gaugeCenterX = 150; 
  const gaugeCenterY = 130; 
  
  // A 300-degree arc centered at the top (0 deg). 
  // Start is 210 degrees, End is 510 degrees.
  const startAngle = 210;
  const endAngle = 510;
  const angleRange = endAngle - startAngle;
  
  const gaugePcnt = Math.min(1, currentPower / maxPower);
  const valueAngle = startAngle + (angleRange * gaugePcnt);

  // Generate ticks for the gauge
  const ticks = [];
  const numTicks = 11;
  for (let i = 0; i < numTicks; i++) {
    const tickAngle = startAngle + (i * (angleRange / (numTicks - 1)));
    const innerPos = polarToCartesian(gaugeCenterX, gaugeCenterY, gaugeRadius - gaugeWidth + 2, tickAngle);
    const outerPos = polarToCartesian(gaugeCenterX, gaugeCenterY, gaugeRadius + 4, tickAngle);
    ticks.push({ x1: innerPos.x, y1: innerPos.y, x2: outerPos.x, y2: outerPos.y });
  }

  // Calculate coordinates for Min/Max text labels
  const minTextPos = polarToCartesian(gaugeCenterX, gaugeCenterY, gaugeRadius + 20, startAngle);
  const maxTextPos = polarToCartesian(gaugeCenterX, gaugeCenterY, gaugeRadius + 20, endAngle);

  return (
    <div className="wind-wrapper">
      <Topbar />

      <div className="wind-content">
        
        {/* --- BREADCRUMB --- */}
        <div className="wind-header">
          <nav aria-label="breadcrumb" className="wind-breadcrumb">
            <Link to="/dashboard">Home</Link>
            <ChevronRight size={14} color="#94a3b8" />
            <Link to="/dashboard">Dashboard</Link>
            <ChevronRight size={14} color="#94a3b8" />
            <span className="current-page">Wind Turbine</span>
          </nav>
        </div>

        {/* =========================================================
            ROW 1: FLOATING INFO & WIND POWER CURVE CHART
            ========================================================= */}
        <div className="wind-row-top">
          
          <div className="wind-info-container">
            <div className="wind-kpi-row">
              <div className="wind-card">
                <div className="wind-kpi-lbl">Current Power</div>
                <div className="wind-kpi-val">332.0 <span style={{fontSize: '1rem'}}>kW</span></div>
              </div>
              <div className="wind-card">
                <div className="wind-kpi-lbl">Total Energy</div>
                <div className="wind-kpi-val">4.2 <span style={{fontSize: '1rem'}}>GWh</span></div>
              </div>
            </div>

            <div className="wind-card wind-status-block">
              <div className="wind-status-header">
                System Status <span className="wind-badge-active">ACTIVE</span>
              </div>
              <div className="wind-status-row"><span>Energy Received</span> <span className="wind-status-val">86%</span></div>
              <div className="wind-status-row"><span>Rotor</span> <span className="wind-status-val">Pitch Control</span></div>
              <div className="wind-status-row"><span>Nacelle</span> <span className="wind-status-val">On Wind</span></div>
              <div className="wind-status-row"><span>Converter</span> <span className="wind-status-val">Running</span></div>
              <div className="wind-status-row" style={{border: 'none'}}><span>Active Warnings</span> <span className="wind-status-val" style={{color: '#3b82f6'}}>00</span></div>
            </div>
          </div>

          <div className="wind-card">
            <div className="wind-card-title">
              <div className="wind-title-left"><Scale size={18} color="#002d5b"/> Wind Power Curve Analysis</div>
              <MoreHorizontal size={20} color="#94a3b8" cursor="pointer"/>
            </div>
            
            {renderPowerCurveLegend()}

            <div className="wind-chart-large">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={powerCurveData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                  <defs>
                    <linearGradient id="realPowerColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  
                  <XAxis 
                    dataKey="windSpeed" 
                    type="number" 
                    domain={[0, 25]} 
                    tickCount={14}
                    axisLine={false} tickLine={false}
                    tick={{fontSize: 12, fill: '#94a3b8'}} 
                    label={{ value: 'Wind Speed (m/s)', position: 'insideBottom', offset: -15, fill: '#64748b', fontSize: 13, fontWeight: 700 }}
                  />
                  
                  <YAxis 
                    axisLine={false} tickLine={false}
                    tick={{fontSize: 12, fill: '#94a3b8'}} 
                    domain={[0, 600]} 
                    label={{ value: 'Active Power (kW)', angle: -90, position: 'insideLeft', offset: 10, fill: '#64748b', fontSize: 13, fontWeight: 700 }}
                  />
                  
                  <RechartsTooltip 
                    cursor={{stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '4 4'}} 
                    contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 10px 30px rgba(0,0,0,0.1)'}} 
                    labelFormatter={(label) => `Wind Speed: ${label} m/s`}
                  />
                  
                  <Area 
                    type="monotone" dataKey="realPower" name="Real Power" unit=" kW"
                    stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#realPowerColor)"
                  />
                  
                  <Line 
                    type="monotone" dataKey="idealPower" name="Ideal Power" unit=" kW"
                    stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} 
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* =========================================================
            ROW 2: 3 THẺ CHỨC NĂNG (300-DEG GAUGE, COMPASS, OVERVIEW)
            ========================================================= */}
        <div className="wind-row-bot">
          
          {/* Card 1: 300-Degree SVG Gauge */}
          <div className="wind-card">
            <div className="wind-card-title">
              <div className="wind-title-left">Real-Time Power</div>
              <MoreHorizontal size={20} color="#94a3b8"/>
            </div>
            
            <div className="wind-gauge-chart-box">
              <svg viewBox="0 0 300 250" style={{ width: '100%', height: '100%' }}>
                <defs>
                  <linearGradient id="gaugeRainbow" x1="0%" y1="100%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="33%" stopColor="#10b981" />
                    <stop offset="66%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
                
                {/* Background Arc */}
                <path 
                  d={describeArc(gaugeCenterX, gaugeCenterY, gaugeRadius, startAngle, endAngle)} 
                  fill="none" stroke="#f1f5f9" strokeWidth={gaugeWidth} strokeLinecap="round" 
                />
                
                {/* Value Arc (Gradient) */}
                <path 
                  d={describeArc(gaugeCenterX, gaugeCenterY, gaugeRadius, startAngle, valueAngle)} 
                  fill="none" stroke="url(#gaugeRainbow)" strokeWidth={gaugeWidth} strokeLinecap="round" 
                  style={{transition: 'stroke-dasharray 0.5s ease-in-out'}}
                />

                {/* Segment Ticks */}
                {ticks.map((tick, i) => (
                  <line key={i} x1={tick.x1} y1={tick.y1} x2={tick.x2} y2={tick.y2} stroke="#fff" strokeWidth="2" />
                ))}

                {/* Center Values */}
                <text x={gaugeCenterX} y={gaugeCenterY + 10} textAnchor="middle" fill="#0f172a" fontSize="38" fontWeight="800" fontFamily="Courier New, monospace">
                  {currentPower}
                </text>
                <text x={gaugeCenterX} y={gaugeCenterY + 30} textAnchor="middle" fill="#64748b" fontSize="14" fontWeight="700">
                  kW
                </text>

                {/* Min / Max Labels */}
                <text x={minTextPos.x} y={minTextPos.y} textAnchor="end" fill="#94a3b8" fontSize="12" fontWeight="700" alignmentBaseline="middle">
                  0
                </text>
                <text x={maxTextPos.x} y={maxTextPos.y} textAnchor="start" fill="#94a3b8" fontSize="12" fontWeight="700" alignmentBaseline="middle">
                  {maxPower}
                </text>
              </svg>
            </div>
            
            <div className="wind-gauge-footer">
              <div className="wind-gf-col">
                <span className="wind-gf-lbl">Rated Capacity</span>
                <span className="wind-gf-val">{maxPower} kW</span>
                <span className="wind-gf-lbl" style={{marginTop: '10px'}}>Avg Power (10m)</span>
                <span className="wind-gf-val">298.6 kW</span>
              </div>
              <div className="wind-gf-col">
                <span className="wind-gf-lbl">Output Voltage</span>
                <span className="wind-gf-val">690.2 V</span>
                <span className="wind-gf-lbl" style={{marginTop: '10px'}}>Grid Freq</span>
                <span className="wind-gf-val">50.02 Hz</span>
              </div>
            </div>
          </div>

          {/* Card 2: Compass with Letters Outside */}
          <div className="wind-card">
            <div className="wind-card-title">
              <div className="wind-title-left">Wind Information</div>
              <MoreHorizontal size={20} color="#94a3b8"/>
            </div>
            
            <div className="wind-compass-container">
              <svg viewBox="0 0 160 160" style={{ width: '100%', height: '100%' }}>
                {/* Vòng tròn la bàn to hơn (r="60") */}
                <circle cx="80" cy="80" r="60" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                
                {/* Vạch chia độ (đẩy ra sát viền vòng tròn) */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                  <line 
                    key={deg} x1="80" y1="20" x2="80" y2={deg % 90 === 0 ? 28 : 24} 
                    stroke={deg % 90 === 0 ? "#94a3b8" : "#cbd5e1"} 
                    strokeWidth={deg % 90 === 0 ? "3" : "2"} 
                    transform={`rotate(${deg}, 80, 80)`} 
                  />
                ))}
                
                {/* Ký tự N E S W được đẩy sát ra lề ngoài cùng */}
                <text x="80" y="8" fill="#002d5b" fontSize="16" fontWeight="800" textAnchor="middle" dominantBaseline="middle">N</text>
                <text x="152" y="80" fill="#002d5b" fontSize="16" fontWeight="800" textAnchor="middle" dominantBaseline="middle">E</text>
                <text x="80" y="152" fill="#002d5b" fontSize="16" fontWeight="800" textAnchor="middle" dominantBaseline="middle">S</text>
                <text x="8" y="80" fill="#002d5b" fontSize="16" fontWeight="800" textAnchor="middle" dominantBaseline="middle">W</text>
                
                <circle cx="80" cy="80" r="6" fill="#0f172a" />
                
                {/* Kim la bàn (kéo dài ra tương ứng với vòng tròn mới) */}
                <g transform={`rotate(${currentWindDirection}, 80, 80)`} style={{transition: 'transform 0.5s ease-out'}}>
                  <polygon points="75,80 85,80 80,25" fill="#3b82f6" />
                  <polygon points="77,80 83,80 80,115" fill="#cbd5e1" />
                </g>
              </svg>
            </div>

            <div className="wind-radar-footer">
              <div className="wind-rf-col">
                <span className="wind-rf-lbl">Nacelle Dir.</span>
                <span className="wind-rf-val">NE (45°)</span>
              </div>
              <div className="wind-rf-col">
                <span className="wind-rf-lbl">Wind Speed</span>
                <span className="wind-rf-val">{currentWindSpeed.toFixed(1)} m/s</span>
              </div>
              <div className="wind-rf-col">
                <span className="wind-rf-lbl">Yaw Angle</span>
                <span className="wind-rf-val">12.0 deg</span>
              </div>
            </div>
          </div>

          {/* Card 3: Overview */}
          <div className="wind-card">
            <div className="wind-card-title">Overview</div>
            
            <div className="wind-overview-circle">
              <p>POWER</p>
              <h3>44</h3>
              <p>MWh</p>
            </div>
            
            <div className="wind-ov-list">
              <div className="wind-ov-item">
                <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}>Rotor RPM</span>
                <span className="wind-ov-val">18.6 RPM</span>
              </div>
              <div className="wind-ov-item">
                <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}>Capacity Utilization</span>
                <span className="wind-ov-val">36.8%</span>
              </div>
              <div className="wind-ov-item">
                <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}>Operation</span>
                <span className="wind-ov-val">12,480 hrs</span>
              </div>
              <div className="wind-ov-item">
                <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}>Rotor Pitch</span>
                <span className="wind-ov-val">12.0 deg</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default WindTurbine;