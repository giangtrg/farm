import React, { useState, useEffect } from 'react';
import Topbar from './Topbar'; 
import { Link } from 'react-router-dom';
import { 
  Server, TerminalSquare, Play, Square, PlugZap, AlertOctagon, Cpu, Plus, Download,
  Clock, Activity, ShieldCheck, CalendarClock, ClipboardList, ChevronRight,
} from 'lucide-react';
import './ControlGen.css';

// Import ảnh
import genImg from '../assets/80kw_ettespower_ec-80b5_gen01.jpg';

// Sinh data log khớp với bảng mới (thêm date, time, device, status, description)
const generateMockLogs = () => {
  const logs = [];
  const baseDate = new Date();
  for (let i = 12; i >= 1; i--) {
    const logDate = new Date(baseDate.getTime() - i * 3600000);
    logs.push({
      id: i,
      date: logDate.toLocaleDateString('en-GB'),
      time: logDate.toLocaleTimeString('en-US', { hour12: false }),
      user: 'Admin',
      device: 'GEN-01',
      command: i % 3 === 0 ? 'SPEED' : i % 2 === 0 ? 'START' : 'MODE',
      status: i % 5 === 0 ? 'FAILED' : 'SUCCESS',
      description: `System automated log entry #${i}`
    });
  }
  return logs.reverse();
};

const ControlGen = () => {
  // === ĐÃ THÊM: STATE CHO ĐỒNG HỒ TRÊN HEADER ===
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const generators = [
    { 
      id: 'GEN-01', name: 'Biogas Genset 1', model: 'EC-80B5', 
      manufacturer: 'ETTES POWER', location: 'Plant A - Zone 1', 
      rated: { power: '80 kW', volt: '400V', amp: '144A', speed: '1500 RPM' },
      alerts: 0
    },
    { 
      id: 'GEN-02', name: 'Biogas Genset 2', model: 'EC-100B', 
      manufacturer: 'ETTES POWER', location: 'Plant A - Zone 2', 
      rated: { power: '100 kW', volt: '400V', amp: '180A', speed: '1500 RPM' },
      alerts: 0
    }
  ];

  const [selectedGen, setSelectedGen] = useState(generators[0]);
  const [mode, setMode] = useState('ISLAND');
  const [status, setStatus] = useState('STOPPED');
  const [gridSynced, setGridSynced] = useState(false);
  const [isAuto, setIsAuto] = useState(false);
  const [speedInput, setSpeedInput] = useState(1500);
  const [liveSpeed, setLiveSpeed] = useState(0);
  
  // Trạng thái cho Schedule Toggle Switch
  const [sch1Enabled, setSch1Enabled] = useState(true);
  const [sch2Enabled, setSch2Enabled] = useState(false);

  const [commandLog, setCommandLog] = useState(generateMockLogs());
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  // Hàm addLog tạo data đúng chuẩn
  const addLog = (actionType, logStatus, details) => {
    const now = new Date();
    const newLog = {
      id: Date.now(),
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString('en-US', { hour12: false }),
      user: 'Admin',
      device: selectedGen.id,
      command: actionType,
      status: logStatus,
      description: details
    };
    setCommandLog(prev => [newLog, ...prev]);
    setCurrentPage(1);
  };

  const handleStart = () => {
    setStatus('RUNNING');
    setLiveSpeed(speedInput);
    addLog('START', 'SUCCESS', `Initiated Start Sequence for ${selectedGen.id}`);
  };

  const handleStop = () => {
    setStatus('STOPPED');
    setLiveSpeed(0);
    setGridSynced(false);
    addLog('STOP', 'SUCCESS', `Initiated Normal Stop for ${selectedGen.id}`);
  };

  const handleGridSync = () => {
    if (gridSynced) {
      setGridSynced(false);
      addLog('SYNC', 'SUCCESS', `Disconnected from Grid`);
    } else {
      setGridSynced(true);
      addLog('SYNC', 'SUCCESS', `Synchronized and Connected to Grid`);
    }
  };

  const handleEStop = () => {
    setStatus('STOPPED');
    setLiveSpeed(0);
    setGridSynced(false);
    setIsAuto(false);
    addLog('ESTOP', 'SUCCESS', `EMERGENCY STOP triggered for ${selectedGen.id}`);
  };

  const handleToggleAuto = () => {
    const newState = !isAuto;
    setIsAuto(newState);
    addLog('AUTO', 'SUCCESS', `Control shifted to ${newState ? 'AUTO' : 'MANUAL'} mode`);
  };

  const handleApplySpeed = () => {
    if (status === 'RUNNING') {
      setLiveSpeed(speedInput);
      addLog('SPEED', 'SUCCESS', `Set target speed to ${speedInput} RPM`);
    } else {
      addLog('SPEED', 'FAILED', `Cannot set speed while engine is STOPPED`);
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === 'ISLAND') setGridSynced(false);
    addLog('MODE', 'SUCCESS', `Operation mode changed to ${newMode}`);
  };

  const handleGenSelect = (e) => {
    const gen = generators.find(g => g.id === e.target.value);
    setSelectedGen(gen);
    addLog('SYSTEM', 'SUCCESS', `Switched control to ${gen.id}`);
  };

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = commandLog.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(commandLog.length / logsPerPage);

  const handleNextPage = () => {
    if(currentPage < totalPages) setCurrentPage(p => p + 1);
  };
  const handlePrevPage = () => {
    if(currentPage > 1) setCurrentPage(p => p - 1);
  };

  return (
    <div className="cg-wrapper">
      <Topbar />

      <div className="cg-content">
        
        {/* --- CẬP NHẬT: PAGE HEADER ĐỒNG BỘ MONITORING --- */}
        <div className="cg-page-header">
          {/* --- BREADCRUMB --- */}
          <nav aria-label="breadcrumb" className="cg-breadcrumb">
            <Link to="/dashboard">
              Home
            </Link>
            
            <ChevronRight size={14} color="#94a3b8" aria-hidden="true" />
            
            <Link to="/control">
              Control
            </Link>

            <ChevronRight size={14} color="#94a3b8" aria-hidden="true" />
            
            <span className="current-page" aria-current="page">
              Generators
            </span>
          </nav>
        </div>
        
        {/* --- TẦNG TRÊN CÙNG: GRID 2:1 --- */}
        <div className="cg-grid-top">
          
          {/* --- CỘT TRÁI (CHỨA SELECT, CONTROL, LIVE) --- */}
          <div className="cg-col">
            
            {/* THẺ SELECT GENERATOR */}
            <div className="cg-card">
              <div className="cg-card-title">Select Target Generator</div>
              <div className="cg-select-header">
                <select className="cg-dropdown" value={selectedGen.id} onChange={handleGenSelect}>
                  {generators.map(g => (
                    <option key={g.id} value={g.id}>{g.id} - {g.name}</option>
                  ))}
                </select>
                <div className="cg-tag-count">Available: {generators.length}
                </div>
              </div>

              <div className="cg-gen-profile">
                <img src={genImg} alt="Genset" className="cg-gen-img" />
                
                <div className="cg-gen-info">
                  <div className="cg-info-col">
                    <div className="cg-info-item"><span className="cg-info-lbl">ID</span><span className="cg-info-val">{selectedGen.id}</span></div>
                    <div className="cg-info-item"><span className="cg-info-lbl">MANUFACTURER</span><span className="cg-info-val">{selectedGen.manufacturer}</span></div>
                    <div className="cg-info-item"><span className="cg-info-lbl">LOCATION</span><span className="cg-info-val">{selectedGen.location}</span></div>
                  </div>
                  
                  <div className="cg-info-col">
                    <div className="cg-info-item"><span className="cg-info-lbl">NAME</span><span className="cg-info-val">{selectedGen.name}</span></div>
                    <div className="cg-info-item"><span className="cg-info-lbl">MODEL</span><span className="cg-info-val">{selectedGen.model}</span></div>
                    <div className="cg-info-item">
                      <span className="cg-info-lbl">RATED</span>
                      <span className="cg-info-val" style={{color: '#475569'}}>
                        <span style={{color: '#0f172a'}}>{selectedGen.rated.power}</span> 
                        <span style={{color: '#cbd5e1', margin: '0 6px'}}>|</span> {selectedGen.rated.volt} 
                        <span style={{color: '#cbd5e1', margin: '0 6px'}}>|</span> {selectedGen.rated.amp} 
                        <span style={{color: '#cbd5e1', margin: '0 6px'}}>|</span> {selectedGen.rated.speed}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SPLIT TỈ LỆ 1:2 */}
            <div className="cg-control-live-split">
              
              {/* CONTROL PANEL (1fr) */}
              <div className="cg-card">
                <div className="cg-card-title">Control Panel</div>
                
                <div className="cg-control-group">
                  <span className="cg-control-lbl">Operation Mode</span>
                  <div className="cg-mode-switch">
                    <button className={`cg-mode-btn ${mode === 'ISLAND' ? 'active' : ''}`} onClick={() => handleModeChange('ISLAND')}>
                      Island
                    </button>
                    <button className={`cg-mode-btn ${mode === 'GRID' ? 'active' : ''}`} onClick={() => handleModeChange('GRID')}>
                      Grid-Tied
                    </button>
                  </div>
                </div>

                <div className="cg-control-group">
                  <div className="cg-action-grid">
                    <button className="cg-btn-action cg-btn-start" onClick={handleStart} disabled={status === 'RUNNING' || isAuto}>
                      <Play size={16}/> START
                    </button>
                    <button className="cg-btn-action cg-btn-stop" onClick={handleStop} disabled={status === 'STOPPED' || isAuto}>
                      <Square size={16}/> STOP
                    </button>
                    <button className="cg-btn-action cg-btn-sync" onClick={handleGridSync} disabled={status === 'STOPPED' || mode === 'ISLAND' || isAuto}>
                      <PlugZap size={16}/> SYNC
                    </button>
                    <button className="cg-btn-action cg-btn-estop" onClick={handleEStop}>
                      <AlertOctagon size={16}/> E-STOP
                    </button>
                    <div className="cg-auto-wrap">
                      <button className="cg-btn-action cg-btn-auto" onClick={handleToggleAuto}>
                        <Cpu size={16}/> {isAuto ? 'MANUAL' : 'AUTO'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="cg-control-group">
                  <span className="cg-control-lbl">Speed Setpoint</span>
                  <div className="cg-speed-wrap">
                    <input 
                      type="number" className="cg-speed-input" 
                      value={speedInput} onChange={(e) => setSpeedInput(e.target.value)}
                      step="10" min="1000" max="1800" disabled={isAuto}
                    />
                    <button className="cg-btn-apply" onClick={handleApplySpeed} disabled={isAuto}>Set</button>
                  </div>
                </div>
              </div>

              {/* LIVE STATUS FEEDBACK (2fr) */}
              <div className="cg-card">
                <div className="cg-card-title">Live Feedback</div>
                <div className="cg-live-list">
                  <div className="cg-live-item">
                    <div className="cg-live-lbl">Engine State</div>
                    <div className="cg-live-val" style={{color: status === 'RUNNING' ? '#10b981' : '#94a3b8'}}>{status}</div>
                  </div>
                  <div className="cg-live-item">
                    <div className="cg-live-lbl">Current Speed</div>
                    <div className="cg-live-val">{liveSpeed}<span>RPM</span></div>
                  </div>
                  <div className="cg-live-item">
                    <div className="cg-live-lbl">Voltage L-N</div>
                    <div className="cg-live-val">{status === 'RUNNING' ? '400.2' : '0.0'}<span>V</span></div>
                  </div>
                  <div className="cg-live-item">
                    <div className="cg-live-lbl">Current</div>
                    <div className="cg-live-val">{status === 'RUNNING' ? '215.3' : '0.0'}<span>A</span></div>
                  </div>
                  <div className="cg-live-item">
                    <div className="cg-live-lbl">Frequency</div>
                    <div className="cg-live-val">{status === 'RUNNING' ? '50.01' : '0.0'}<span>Hz</span></div>
                  </div>
                  <div className="cg-live-item">
                    <div className="cg-live-lbl">Grid Connection</div>
                    <div className="cg-live-val" style={{color: gridSynced ? '#2563eb' : '#94a3b8'}}>{gridSynced ? 'SYNCED' : 'OFF'}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* --- CỘT PHẢI (CHỨA PRESTART, SCHEDULE) --- */}
          <div className="cg-col">
            
            {/* THẺ PRE-START */}
            <div className="cg-card">
              <div className="cg-card-title">Pre-start Checklist</div>
              <div className="cg-check-list">
                <div className="cg-check-item">
                  <div className="cg-check-info">
                    <div className="cg-check-name">Fuel Supply</div>
                    <div className="cg-check-desc">Req: {'>'} 20% - Cur: 65%</div>
                  </div>
                  <div className="cg-check-status ok">OK</div>
                </div>
                <div className="cg-check-item">
                  <div className="cg-check-info">
                    <div className="cg-check-name">Oil Pressure</div>
                    <div className="cg-check-desc">Req: {'>'} 3.0 bar - Cur: 4.2 bar</div>
                  </div>
                  <div className="cg-check-status ok">OK</div>
                </div>
                <div className="cg-check-item">
                  <div className="cg-check-info">
                    <div className="cg-check-name">Cooling System</div>
                    <div className="cg-check-desc">Req: {'<'} 90°C - Cur: 45°C</div>
                  </div>
                  <div className="cg-check-status ok">OK</div>
                </div>
                <div className="cg-check-item">
                  <div className="cg-check-info">
                    <div className="cg-check-name">Active Alerts</div>
                    <div className="cg-check-desc">Req: 0 - Cur: {selectedGen.alerts}</div>
                  </div>
                  <div className={`cg-check-status ${selectedGen.alerts === 0 ? 'ok' : 'warn'}`}>
                    {selectedGen.alerts === 0 ? 'OK' : 'WARN'}
                  </div>
                </div>
                <div className={`cg-check-item ${mode === 'ISLAND' ? 'disabled' : ''}`}>
                  <div className="cg-check-info">
                    <div className="cg-check-name">Grid Tie Breaker</div>
                    <div className="cg-check-desc">Req: {mode === 'ISLAND' ? 'N/A' : 'OPEN'} - Cur: {mode === 'ISLAND' ? 'N/A' : 'OPEN'}</div>
                  </div>
                  <div className={`cg-check-status ${mode === 'ISLAND' ? 'na' : 'ok'}`}>
                    {mode === 'ISLAND' ? 'N/A' : 'OK'}
                  </div>
                </div>
              </div>
            </div>

            {/* THẺ SCHEDULE */}
            <div className="cg-card">
              <div className="cg-card-title">Schedule</div>
              <div className="cg-schedule-list">
                
                <div className="cg-schedule-item">
                  <div className="cg-sch-info">
                    <div className="cg-sch-time">08:00 AM - 16:00 PM</div>
                    <div className="cg-sch-days">Mon - Fri</div>
                  </div>
                  <label className="cg-toggle">
                    <input type="checkbox" checked={sch1Enabled} onChange={() => setSch1Enabled(!sch1Enabled)} />
                    <span className="cg-toggle-slider"></span>
                  </label>
                </div>
                
                <div className="cg-schedule-item">
                  <div className="cg-sch-info">
                    <div className="cg-sch-time">18:00 PM - 22:00 PM</div>
                    <div className="cg-sch-days">Everyday</div>
                  </div>
                  <label className="cg-toggle">
                    <input type="checkbox" checked={sch2Enabled} onChange={() => setSch2Enabled(!sch2Enabled)} />
                    <span className="cg-toggle-slider"></span>
                  </label>
                </div>

                <div className="cg-schedule-item">
                  <div className="cg-sch-info">
                    <div className="cg-sch-time">18:00 PM - 22:00 PM</div>
                    <div className="cg-sch-days">Everyday</div>
                  </div>
                  <label className="cg-toggle">
                    <input type="checkbox" checked={sch2Enabled} onChange={() => setSch2Enabled(!sch2Enabled)} />
                    <span className="cg-toggle-slider"></span>
                  </label>
                </div>

              </div>
              
              <button className="cg-btn-add-sch"><Plus size={16}/> Add Schedule</button>
            </div>

          </div>

        </div>

        {/* --- HÀNG DƯỚI CÙNG: COMMAND LOG --- */}
        <div className="cg-card" style={{marginTop: '24px'}}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
            <h3 className="cg-card-title log-title">Command Log</h3>
            <button className="export-btn" onClick={() => alert('Exporting to CSV...')}>
              <Download size={16} /> Export
            </button>
          </div>

          <div style={{overflowX: 'auto'}}>
            <table className="cg-log-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Device</th>
                  <th>Command</th>
                  <th>Status</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.map(log => (
                  <tr key={log.id}>
                    <td>
                      <div className="cg-log-time-wrap">
                        <span className="cg-log-date">{log.date}</span>
                        <span className="cg-log-time">{log.time}</span>
                      </div>
                    </td>
                    <td>{log.user}</td>
                    <td style={{fontFamily: 'monospace', fontWeight: '700'}}>{log.device}</td>
                    <td><span className="cmd-text">{log.command}</span></td>
                    <td>
                      <span className={`status-text ${log.status === 'SUCCESS' ? 'success' : 'failed'}`}>
                        {log.status}
                      </span>
                    </td>
                    <td>{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="cg-pagination">
              <button 
                className="cg-page-btn" 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="cg-page-info">Page {currentPage} of {totalPages}</span>
              <button 
                className="cg-page-btn" 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ControlGen;