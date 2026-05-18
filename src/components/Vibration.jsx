import React, { useState, useEffect, useMemo } from 'react';
import Topbar from './Topbar'; 
import { Link } from 'react-router-dom';
import { 
  Activity, UploadCloud, FileText, BarChart2, Clock, Settings, Database, Trash2, ChevronRight,
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import './Vibration.css';

// ==========================================================================
// PURE JAVASCRIPT FFT IMPLEMENTATION (Cooley-Tukey Radix-2)
// ==========================================================================
const computeFFT = (realInput) => {
  let n = realInput.length;
  const powerOf2 = Math.pow(2, Math.floor(Math.log2(n)));
  
  const real = realInput.slice(0, powerOf2);
  const imag = new Array(powerOf2).fill(0);
  n = powerOf2;

  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    while (j & bit) { j ^= bit; bit >>= 1; }
    j ^= bit;
    if (i < j) {
      let tempRe = real[i]; real[i] = real[j]; real[j] = tempRe;
    }
  }

  for (let len = 2; len <= n; len <<= 1) {
    let angle = -2 * Math.PI / len;
    let wLenRe = Math.cos(angle);
    let wLenIm = Math.sin(angle);
    for (let i = 0; i < n; i += len) {
      let wRe = 1;
      let wIm = 0;
      for (let j = 0; j < len / 2; j++) {
        let uRe = real[i + j];
        let uIm = imag[i + j];
        let vRe = real[i + j + len / 2] * wRe - imag[i + j + len / 2] * wIm;
        let vIm = real[i + j + len / 2] * wIm + imag[i + j + len / 2] * wRe;
        
        real[i + j] = uRe + vRe;
        imag[i + j] = uIm + vIm;
        real[i + j + len / 2] = uRe - vRe;
        imag[i + j + len / 2] = uIm - vIm;
        
        let nextWRe = wRe * wLenRe - wIm * wLenIm;
        let nextWIm = wRe * wLenIm + wIm * wLenRe;
        wRe = nextWRe;
        wIm = nextWIm;
      }
    }
  }

  const magnitudes = [];
  for (let i = 0; i < n / 2; i++) {
    magnitudes.push((2 * Math.sqrt(real[i] * real[i] + imag[i] * imag[i])) / n);
  }
  
  return magnitudes;
};

const Vibration = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileMeta, setFileMeta] = useState({ rows: 0, sampleRate: 0, duration: 0 });
  
  const [rawData, setRawData] = useState(null); 
  const [sensor, setSensor] = useState('1'); 
  const [fftAxis, setFftAxis] = useState('z'); 

  // STATE ĐỂ BẬT TẮT ĐƯỜNG TRÊN ĐỒ THỊ WAVEFORM
  const [visibleAxes, setVisibleAxes] = useState({ x: true, y: true, z: true });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setRawData(null);
  };

  const processCSV = () => {
    if (!file) return;
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.trim().split('\n');
        
        const parsed = [];
        let hasHeader = isNaN(parseFloat(lines[0].split(',')[0]));
        let startIndex = hasHeader ? 1 : 0;

        for (let i = startIndex; i < lines.length; i++) {
          const cols = lines[i].split(',').map(val => parseFloat(val));
          if (cols.length >= 4 && !isNaN(cols[0])) { 
            parsed.push({
              time: cols[0],
              s1: { x: cols[1]||0, y: cols[2]||0, z: cols[3]||0 },
              s2: { x: cols[4]||0, y: cols[5]||0, z: cols[6]||0 }, 
              s3: { x: cols[7]||0, y: cols[8]||0, z: cols[9]||0 }
            });
          }
        }

        if (parsed.length < 10) {
          alert("File does not contain enough data points.");
          setIsProcessing(false);
          return;
        }

        const duration = parsed[parsed.length - 1].time - parsed[0].time;
        const sampleRate = Math.round(parsed.length / duration);

        setFileMeta({ rows: parsed.length, sampleRate, duration: duration.toFixed(2) });
        setRawData(parsed);
      } catch (error) {
        console.error("Error parsing CSV:", error);
        alert("Error parsing CSV file. Please ensure format is: Time, S1_X, S1_Y, S1_Z...");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsText(file);
  };

  const resetData = () => {
    setFile(null);
    setRawData(null);
  };

  const toggleAxis = (axisKey) => {
    setVisibleAxes(prev => ({ ...prev, [axisKey]: !prev[axisKey] }));
  };

  // ==========================================================================
  // DATA PREPARATION
  // ==========================================================================

  const timeChartData = useMemo(() => {
    if (!rawData) return [];
    
    const targetPoints = 800;
    const step = Math.ceil(rawData.length / targetPoints);
    
    const downsampled = [];
    for (let i = 0; i < rawData.length; i += step) {
      const point = rawData[i];
      let sData = point.s1;
      if (sensor === '2') sData = point.s2;
      if (sensor === '3') sData = point.s3;

      downsampled.push({
        time: point.time.toFixed(4),
        x: sData.x,
        y: sData.y,
        z: sData.z
      });
    }
    return downsampled;
  }, [rawData, sensor]);

  const fftChartData = useMemo(() => {
    if (!rawData || fileMeta.sampleRate <= 0) return [];
    
    const nSamples = Math.min(rawData.length, 4096); 
    const targetData = rawData.slice(0, nSamples);
    
    const signalArray = targetData.map(point => {
      let sData = point.s1;
      if (sensor === '2') sData = point.s2;
      if (sensor === '3') sData = point.s3;

      if (fftAxis === 'x') return sData.x;
      if (fftAxis === 'y') return sData.y;
      if (fftAxis === 'z') return sData.z;
      return Math.sqrt(sData.x*sData.x + sData.y*sData.y + sData.z*sData.z);
    });

    const magnitudes = computeFFT(signalArray);
    const n = magnitudes.length * 2; 
    const freqResolution = fileMeta.sampleRate / n;

    const chartData = [];
    const binStep = Math.max(1, Math.floor(magnitudes.length / 500));
    
    for (let i = 0; i < magnitudes.length; i += binStep) {
      const freq = i * freqResolution;
      if (i > 0) {
        chartData.push({
          frequency: freq.toFixed(1),
          amplitude: magnitudes[i]
        });
      }
    }
    
    return chartData;
  }, [rawData, sensor, fftAxis, fileMeta]);

  // TÙY CHỈNH LẠI LEGEND ĐỂ HỖ TRỢ CLICK VÀ ĐẨY LÊN TRÊN
  const renderCustomLegend = (items, toggleFn, activeStates) => (
    <div className="vib-custom-legend" style={{ margin: '0 0 16px 0' }}>
      {items.map((item, idx) => (
        <div 
          key={idx} 
          className="vib-legend-item"
          style={{ 
            cursor: toggleFn ? 'pointer' : 'default',
            opacity: (activeStates && !activeStates[item.dataKey]) ? 0.4 : 1,
            transition: 'opacity 0.2s'
          }}
          onClick={() => toggleFn && toggleFn(item.dataKey)}
        >
          <div className="vib-legend-color" style={{ background: item.color }}></div>
          {item.name}
        </div>
      ))}
    </div>
  );

  return (
    <div className="vib-wrapper">
      <Topbar />

      <div className="vib-content">
        
        {/* HEADER */}
        <div className="vib-header">
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
              Vibration
            </span>
          </nav>
        </div>

        {/* UPLOAD ZONE */}
        <div className="vib-card">
          <div className="vib-card-title">Import Data</div>
          
          {!file ? (
            <label className="vib-upload-zone">
              <input type="file" accept=".csv" style={{display: 'none'}} onChange={handleFileUpload} />
              <div className="vib-upload-icon"><UploadCloud size={32}/></div>
              <div className="vib-upload-text">
                <h3>Select or Drop CSV File</h3>
                <p>Expected format: <code>Time(s), S1_X, S1_Y, S1_Z, S2_X...</code></p>
              </div>
            </label>
          ) : (
            <div className="vib-file-info">
              <div className="vib-file-details">
                <div className="vib-file-icon"><FileText size={24}/></div>
                <div className="vib-file-text">
                  <h4>{file.name}</h4>
                  {rawData ? (
                    <p style={{color: '#10b981', fontWeight: 600}}>
                      {fileMeta.rows.toLocaleString()} points • ~{fileMeta.sampleRate} Hz • {fileMeta.duration}s
                    </p>
                  ) : (
                    <p>{(file.size / (1024*1024)).toFixed(2)} MB • Ready to process</p>
                  )}
                </div>
              </div>
              <div style={{display: 'flex', gap: '12px'}}>
                <button className="vib-btn vib-btn-outline" onClick={resetData}>
                  <Trash2 size={18}/> Remove
                </button>
                {!rawData && (
                  <button className="vib-btn" onClick={processCSV} disabled={isProcessing}>
                    {isProcessing ? (
                      <><Settings className="lucide-spin" size={18}/> Processing...</>
                    ) : (
                      <><Activity size={18}/> Analyze</>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* CHARTS ZONE */}
        {rawData && (
          <div className="vib-card vib-charts-grid">
            
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '20px'}}>
              <div className="vib-card-title" style={{margin: 0, paddingBottom: 0, borderBottom: 'none'}}>
                Analysis
              </div>
              
              <div className="vib-controls" style={{margin: 0}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <span style={{fontSize: '0.85rem', fontWeight: 600, color: '#64748b'}}>Target Sensor:</span>
                  <select className="vib-select" value={sensor} onChange={(e) => setSensor(e.target.value)}>
                    <option value="1">Sensor 1</option>
                    <option value="2">Sensor 2</option>
                    <option value="3">Sensor 3</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 1. TIME-DOMAIN CHART */}
            <div className="vib-chart-wrapper">
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                <h4 style={{fontSize: '1rem', color: '#002d5b', margin: 0, fontWeight: 600}}>Time Domain</h4>
              </div>
              
              {/* Đưa Legend lên trên và làm tính năng click bật/tắt */}
              {renderCustomLegend([
                { name: 'X-Axis', color: '#3b82f6', dataKey: 'x' },
                { name: 'Y-Axis', color: '#f59e0b', dataKey: 'y' },
                { name: 'Z-Axis', color: '#ef4444', dataKey: 'z' }
              ], toggleAxis, visibleAxes)}

              <div className="vib-chart-box">
                <ResponsiveContainer width="100%" height="100%">
                  {/* MARGIN ĐƯỢC CHUẨN HÓA GIỐNG NHAU */}
                  <LineChart data={timeChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} tickFormatter={(t) => `${t}s`} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} width={40} />
                    <RechartsTooltip contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 10px 30px rgba(0,0,0,0.1)'}} />
                    
                    <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="3 3" />
                    
                    {visibleAxes.x && <Line type="monotone" dataKey="x" name="X-Axis" stroke="#3b82f6" dot={false} strokeWidth={1.5} isAnimationActive={false} />}
                    {visibleAxes.y && <Line type="monotone" dataKey="y" name="Y-Axis" stroke="#f59e0b" dot={false} strokeWidth={1.5} isAnimationActive={false} />}
                    {visibleAxes.z && <Line type="monotone" dataKey="z" name="Z-Axis" stroke="#ef4444" dot={false} strokeWidth={1.5} isAnimationActive={false} />}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. FREQUENCY-DOMAIN (FFT) CHART */}
            <div className="vib-chart-wrapper" style={{marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed #e2e8f0', borderRadius: 0}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap'}}>
                <h4 style={{fontSize: '1rem', color: '#002d5b', margin: 0, fontWeight: 600}}>FFT Spectrum</h4>
                
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <span style={{fontSize: '0.85rem', fontWeight: 600, color: '#64748b'}}>Analyze Axis:</span>
                  <select className="vib-select" value={fftAxis} onChange={(e) => setFftAxis(e.target.value)} style={{padding: '4px 10px'}}>
                    <option value="x">X-Axis</option>
                    <option value="y">Y-Axis</option>
                    <option value="z">Z-Axis</option>
                    <option value="mag">Magnitude (XYZ)</option>
                  </select>
                </div>
              </div>

              {/* Đưa Legend lên trên */}
              {renderCustomLegend([
                { name: `FFT Amplitude`, color: '#10b981', dataKey: 'amplitude' }
              ])}

              <div className="vib-chart-box">
                <ResponsiveContainer width="100%" height="100%">
                  {/* MARGIN ĐƯỢC CHUẨN HÓA GIỐNG NHAU */}
                  <AreaChart data={fftChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fftColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="frequency" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} tickFormatter={(f) => `${f}Hz`} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} width={40} />
                    <RechartsTooltip 
                      contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 10px 30px rgba(0,0,0,0.1)'}} 
                      formatter={(val) => [Number(val).toFixed(4), 'Amplitude']}
                    />
                    <Area type="monotone" dataKey="amplitude" name="Amplitude" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#fftColor)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Vibration;