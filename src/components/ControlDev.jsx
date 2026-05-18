import React, { useState, useMemo, useEffect } from 'react';
import Topbar from './Topbar'; 
import { Link } from 'react-router-dom';
import { 
  Droplet, Wind, Thermometer, Lightbulb, RotateCw, Plus, Filter, Settings, 
  TerminalSquare, Download, Clock, Activity, CalendarClock, ShieldAlert, ClipboardList, ChevronRight,
} from 'lucide-react';
import './ControlDev.css';

// --- MOCK DATA: 7 KHU VỰC & 36 THIẾT BỊ ---
const MOCK_DEVICES = [
  // 1. Open Field A
  { dbId: 101, id: 'PMP-101', name: 'Main Irrigation Pump', type: 'water', area: 'Open Field A', status: 'online', isOn: true, power: '45.0', ratedPower: 50 },
  { dbId: 102, id: 'PMP-102', name: 'Backup Well Pump', type: 'water', area: 'Open Field A', status: 'online', isOn: false, power: '0.0', ratedPower: 35 },
  { dbId: 103, id: 'VAL-103', name: 'Zone 1 Sprinkler Valve', type: 'water', area: 'Open Field A', status: 'online', isOn: true, power: '2.5', ratedPower: 5 },
  { dbId: 104, id: 'VAL-104', name: 'Zone 2 Sprinkler Valve', type: 'water', area: 'Open Field A', status: 'online', isOn: false, power: '0.0', ratedPower: 5 },
  { dbId: 105, id: 'VAL-105', name: 'Zone 3 Sprinkler Valve', type: 'water', area: 'Open Field A', status: 'offline', isOn: false, power: '0.0', ratedPower: 5 },

  // 2. Open Field B
  { dbId: 201, id: 'PMP-201', name: 'Drip Line Pump B', type: 'water', area: 'Open Field B', status: 'online', isOn: true, power: '18.2', ratedPower: 20 },
  { dbId: 202, id: 'VAL-202', name: 'Drip Valve B1', type: 'water', area: 'Open Field B', status: 'online', isOn: true, power: '1.2', ratedPower: 2 },
  { dbId: 203, id: 'VAL-203', name: 'Drip Valve B2', type: 'water', area: 'Open Field B', status: 'online', isOn: false, power: '0.0', ratedPower: 2 },
  { dbId: 204, id: 'SEN-204', name: 'Soil Moisture St.', type: 'system', area: 'Open Field B', status: 'online', isOn: true, power: '0.5', ratedPower: 1 },

  // 3. Greenhouse 1
  { dbId: 301, id: 'HTR-301', name: 'Primary Gas Heater', type: 'heater', area: 'Greenhouse 1', status: 'online', isOn: false, power: '0.0', ratedPower: 120 },
  { dbId: 302, id: 'HTR-302', name: 'Secondary Boiler', type: 'heater', area: 'Greenhouse 1', status: 'online', isOn: false, power: '0.0', ratedPower: 80 },
  { dbId: 303, id: 'FAN-303', name: 'Exhaust Fan North', type: 'wind', area: 'Greenhouse 1', status: 'online', isOn: true, power: '12.5', ratedPower: 15 },
  { dbId: 304, id: 'FAN-304', name: 'Exhaust Fan South', type: 'wind', area: 'Greenhouse 1', status: 'online', isOn: true, power: '12.1', ratedPower: 15 },
  { dbId: 305, id: 'LGT-305', name: 'Grow Lights Array A', type: 'light', area: 'Greenhouse 1', status: 'online', isOn: true, power: '24.0', ratedPower: 25 },
  { dbId: 306, id: 'LGT-306', name: 'Grow Lights Array B', type: 'light', area: 'Greenhouse 1', status: 'online', isOn: true, power: '23.8', ratedPower: 25 },
  { dbId: 307, id: 'PMP-307', name: 'Misting Pump', type: 'water', area: 'Greenhouse 1', status: 'offline', isOn: false, power: '0.0', ratedPower: 10 },
  { dbId: 308, id: 'WIN-308', name: 'Roof Vent Motor', type: 'system', area: 'Greenhouse 1', status: 'online', isOn: false, power: '0.0', ratedPower: 5 },

  // 4. Greenhouse 2
  { dbId: 401, id: 'HTR-401', name: 'Electric Heater Array', type: 'heater', area: 'Greenhouse 2', status: 'online', isOn: true, power: '45.0', ratedPower: 50 },
  { dbId: 402, id: 'FAN-402', name: 'Circulation Fan 1', type: 'wind', area: 'Greenhouse 2', status: 'online', isOn: true, power: '4.2', ratedPower: 5 },
  { dbId: 403, id: 'FAN-403', name: 'Circulation Fan 2', type: 'wind', area: 'Greenhouse 2', status: 'online', isOn: true, power: '4.1', ratedPower: 5 },
  { dbId: 404, id: 'LGT-404', name: 'LED Spectral Bank', type: 'light', area: 'Greenhouse 2', status: 'online', isOn: false, power: '0.0', ratedPower: 30 },
  { dbId: 405, id: 'PMP-405', name: 'Hydroponic Pump A', type: 'water', area: 'Greenhouse 2', status: 'online', isOn: true, power: '8.5', ratedPower: 10 },
  { dbId: 406, id: 'PMP-406', name: 'Hydroponic Pump B', type: 'water', area: 'Greenhouse 2', status: 'online', isOn: false, power: '0.0', ratedPower: 10 },

  // 5. Livestock Barn
  { dbId: 501, id: 'FAN-501', name: 'Main Barn Ventilation', type: 'wind', area: 'Livestock Barn', status: 'online', isOn: true, power: '18.0', ratedPower: 20 },
  { dbId: 502, id: 'FAN-502', name: 'Cooling Pad Fan', type: 'wind', area: 'Livestock Barn', status: 'online', isOn: false, power: '0.0', ratedPower: 15 },
  { dbId: 503, id: 'MTR-503', name: 'Feed Conveyor Belt', type: 'system', area: 'Livestock Barn', status: 'offline', isOn: false, power: '0.0', ratedPower: 22 },
  { dbId: 504, id: 'MTR-504', name: 'Waste Auger', type: 'system', area: 'Livestock Barn', status: 'online', isOn: true, power: '14.2', ratedPower: 15 },
  { dbId: 505, id: 'LGT-505', name: 'Barn Lighting', type: 'light', area: 'Livestock Barn', status: 'online', isOn: true, power: '5.0', ratedPower: 5 },

  // 6. Storage Facility
  { dbId: 601, id: 'HTR-601', name: 'Dehumidifier Unit', type: 'heater', area: 'Storage Facility', status: 'online', isOn: true, power: '8.5', ratedPower: 10 },
  { dbId: 602, id: 'FAN-602', name: 'Air Scrubber', type: 'wind', area: 'Storage Facility', status: 'online', isOn: true, power: '6.0', ratedPower: 8 },
  { dbId: 603, id: 'LGT-603', name: 'High-Bay Lights', type: 'light', area: 'Storage Facility', status: 'online', isOn: false, power: '0.0', ratedPower: 12 },

  // 7. Pump Station
  { dbId: 701, id: 'PMP-701', name: 'Deep Well Pump 1', type: 'water', area: 'Pump Station', status: 'online', isOn: true, power: '75.0', ratedPower: 80 },
  { dbId: 702, id: 'PMP-702', name: 'Deep Well Pump 2', type: 'water', area: 'Pump Station', status: 'offline', isOn: false, power: '0.0', ratedPower: 80 },
  { dbId: 703, id: 'PMP-703', name: 'Fertigation Mixer', type: 'water', area: 'Pump Station', status: 'online', isOn: false, power: '0.0', ratedPower: 25 },
  { dbId: 704, id: 'MTR-704', name: 'Chemical Doser A', type: 'system', area: 'Pump Station', status: 'online', isOn: true, power: '2.1', ratedPower: 5 },
  { dbId: 705, id: 'MTR-705', name: 'Chemical Doser B', type: 'system', area: 'Pump Station', status: 'online', isOn: false, power: '0.0', ratedPower: 5 }
];

const generateMockLogs = () => {
  const logs = [];
  const baseDate = new Date();
  for (let i = 25; i >= 1; i--) {
    const logDate = new Date(baseDate.getTime() - i * 3600000);
    logs.push({
      id: i,
      date: logDate.toLocaleDateString('en-GB'),
      time: logDate.toLocaleTimeString('en-US', { hour12: false }),
      user: i % 4 === 0 ? 'System' : 'Admin',
      device: i % 2 === 0 ? 'PMP-101' : 'HTR-401',
      command: i % 3 === 0 ? 'SET' : i % 2 === 0 ? 'START' : 'STOP',
      status: i % 5 === 0 ? 'FAILED' : 'SUCCESS',
      description: i % 4 === 0 ? `Automated schedule trigger executed properly without any issues during the cycle.` : `Manual override requested from the web dashboard panel.`
    });
  }
  return logs.reverse();
};

const MOCK_AUTOS = [
  { id: 1, target: 'Main Irrigation Pump', rule: 'Turn ON at 06:00 AM, turn OFF at 08:00 AM', isActive: true },
  { id: 2, target: 'Grow Lights Block 1', rule: 'Turn OFF after 12 hours', isActive: false },
  { id: 3, target: 'Exhaust Fan Array', rule: 'Run 15 mins every 2 hours', isActive: true },
  { id: 4, target: 'Backup Well Pump', rule: 'Turn ON if Main Pump fails', isActive: false }
];

const MOCK_THRESH = [
  { id: 1, target: 'Greenhouse Heater A', rule: 'IF Temp < 18°C FOR 5 mins ➔ Alert' },
  { id: 2, target: 'Barn Ventilation', rule: 'IF CO2 > 1000ppm ➔ Turn ON' },
  { id: 3, target: 'Feed Conveyor Belt', rule: 'IF Motor Load > 90% ➔ E-STOP' },
  { id: 4, target: 'Main Irrigation Pump', rule: 'IF Flow Rate < 10 L/s ➔ Alert' }
];

const ControlDev = () => {
  // === STATE CHO ĐỒNG HỒ ===
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [devices, setDevices] = useState(MOCK_DEVICES);
  const [logs, setLogs] = useState(generateMockLogs());
  const [automations, setAutomations] = useState(MOCK_AUTOS);
  const [thresholds, setThresholds] = useState(MOCK_THRESH);
  const [areaFilter, setAreaFilter] = useState('All');

  const dbAreas = useMemo(() => {
    return [...new Set(devices.map(d => d.area))].sort();
  }, [devices]);

  const filteredDevices = useMemo(() => {
    return devices.filter(d => areaFilter === 'All' || d.area === areaFilter);
  }, [devices, areaFilter]);

  const groupedDevices = useMemo(() => {
    const groups = {};
    filteredDevices.forEach(d => {
      if (!groups[d.area]) groups[d.area] = [];
      groups[d.area].push(d);
    });
    return groups;
  }, [filteredDevices]);

  // --- LOGIC PHÂN TRANG LOGS ---
  const [currentLogPage, setCurrentLogPage] = useState(1);
  const logsPerPage = 10;

  const indexOfLastLog = currentLogPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);
  const totalLogPages = Math.ceil(logs.length / logsPerPage);

  const getDeviceIcon = (type, isOn) => {
    const color = isOn ? '#0284c7' : '#94a3b8';
    if (type === 'wind') return <Wind size={24} color={color} />;
    if (type === 'water') return <Droplet size={24} color={color} />;
    if (type === 'heater') return <Thermometer size={24} color={color} />;
    if (type === 'light') return <Lightbulb size={24} color={color} />;
    if (type === 'system') return <RotateCw size={24} color={color} />;
    return <Settings size={24} color={color} />;
  };

  const handleToggleDevice = (device) => {
    if (device.status === 'offline') return alert('Cannot control an offline system.'); 
    
    const newStatus = !device.isOn;
    
    setDevices(devices.map(d => {
      if (d.dbId === device.dbId) {
        return { 
          ...d, 
          isOn: newStatus, 
          power: newStatus ? (d.ratedPower * (Math.random() * 0.1 + 0.9)).toFixed(1) : '0.0' 
        };
      }
      return d;
    }));

    const now = new Date();
    const newLog = {
      id: Date.now(),
      date: now.toLocaleDateString('en-GB'),
      time: now.toLocaleTimeString('en-US', { hour12: false }),
      user: 'Admin',
      device: device.id,
      command: newStatus ? 'START' : 'STOP',
      status: 'SUCCESS',
      description: `Manual Web Override executed`
    };
    setLogs([newLog, ...logs]);
    setCurrentLogPage(1);
  };

  const handleToggleSchedule = (id) => {
    setAutomations(automations.map(auto => 
      auto.id === id ? { ...auto, isActive: !auto.isActive } : auto
    ));
  };

  const activeDevs = devices.filter(d => d.isOn).length;
  const totalPower = devices.reduce((sum, d) => sum + parseFloat(d.power), 0).toFixed(1);

  return (
    <div className="cd-wrapper">
      <Topbar />
      
      <div className="cd-content">
        
        {/* --- PAGE HEADER CÓ ĐỒNG HỒ --- */}
        <div className="cd-page-header">
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
              Devices
            </span>
          </nav>
        </div>
        
        <div className="cd-grid-top">
          
          {/* --- CỘT TRÁI: QUẢN LÝ THIẾT BỊ --- */}
          <div className="cd-col">
            
            <div className="cd-card master-card">
              
              {/* THÊM ICON CHO TIÊU ĐỀ THẺ */}
              <div className="cd-card-title">Control Panel</div>

              <div className="cd-filter-bar-wrap">
                <div className="cd-filter-bar">
                  <div className="cd-filter-label"><Filter size={18} /> Area Filter:</div>
                  <select className="cd-select" value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}>
                    <option value="All">All Areas</option>
                    {dbAreas.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                
                <button className="cd-btn-primary" onClick={() => alert('Add Device Modal Opened')}>
                  <Plus size={18} /> Add Device
                </button>
              </div>

              <div className="cd-groups-container">
                {Object.keys(groupedDevices).length === 0 ? (
                  <div className="cd-no-data">No systems found in this area.</div>
                ) : (
                  Object.keys(groupedDevices).map(area => (
                    <div key={area} className="cd-area-group">
                      <h3 className="cd-area-title">{area}</h3>
                      
                      <div className="cd-devices-grid">
                        {groupedDevices[area].map(device => {
                          let cardStatusClass = ''; 
                          if (device.status === 'offline') cardStatusClass = 'offline';
                          else if (!device.isOn) cardStatusClass = 'dimmed';

                          return (
                            <div key={device.dbId} className={`cd-dev-card ${cardStatusClass}`}>
                              
                              <div className="cd-dev-header">
                                <span className="cd-dev-id">{device.id}</span>
                                <span className="cd-dev-status">
                                  <span className={`cd-status-dot ${device.status}`}></span>
                                  {device.status}
                                </span>
                              </div>
                              
                              <div className="cd-dev-body">
                                <div className={`cd-dev-icon-wrap ${device.isOn ? 'on' : 'off'}`}>
                                  {getDeviceIcon(device.type, device.isOn)}
                                </div>
                                <div className="cd-dev-name">{device.name}</div>
                              </div>
                              
                              <div className="cd-dev-footer">
                                <div className="cd-dev-reading">
                                  <div className="cd-reading-val">{device.power}<span>kW</span></div>
                                </div>
                                
                                <label className="cd-toggle">
                                  <input 
                                    type="checkbox" 
                                    checked={device.isOn} 
                                    onChange={() => handleToggleDevice(device)} 
                                    disabled={device.status === 'offline'} 
                                  />
                                  <span className="cd-toggle-slider"></span>
                                </label>
                              </div>

                            </div>
                          );
                        })}
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>
          </div>

          {/* --- CỘT PHẢI: TÓM TẮT & SCHEDULE --- */}
          <div className="cd-col">
            
            <div className="cd-card">
              <div className="cd-card-title">Farm Overview</div>
              <div className="cd-stat-row"><span>Total Systems</span><strong>{devices.length}</strong></div>
              <div className="cd-stat-row"><span>Active / Running</span><strong style={{color: '#10b981'}}>{activeDevs}</strong></div>
              <div className="cd-stat-row"><span>Total Power Load</span><strong>{totalPower} kW</strong></div>
              <div className="cd-stat-row"><span>Offline Systems</span><strong style={{color: '#ef4444'}}>{devices.filter(d=>d.status==='offline').length}</strong></div>
            </div>

            <div className="cd-card">
              <div className="cd-card-title">Schedule</div>
              <div className="cd-schedule-list">
                {automations.slice(0, 3).map(auto => (
                  <div key={auto.id} className={`cd-schedule-item ${!auto.isActive ? 'disabled' : ''}`}>
                    <div className="cd-sch-info">
                      <div className="cd-sch-target">{auto.target}</div>
                      <div className="cd-sch-rule">{auto.rule}</div>
                    </div>
                    <label className="cd-toggle">
                      <input 
                        type="checkbox" 
                        checked={auto.isActive} 
                        onChange={() => handleToggleSchedule(auto.id)} 
                      />
                      <span className="cd-toggle-slider"></span>
                    </label>
                  </div>
                ))}
                {automations.length === 0 && <p style={{fontSize: '0.85rem', color: '#64748b'}}>No schedules set.</p>}
              </div>
              <button className="cd-btn-add-action"><Plus size={16}/> Add Schedule</button>
            </div>

            <div className="cd-card">
              <div className="cd-card-title">Threshold</div>
              <div className="cd-schedule-list">
                {thresholds.slice(0, 3).map(thresh => (
                  <div key={thresh.id} className="cd-schedule-item">
                    <div className="cd-sch-info">
                      <div className="cd-sch-target">{thresh.target}</div>
                      <div className="cd-sch-rule">{thresh.rule}</div>
                    </div>
                  </div>
                ))}
                {thresholds.length === 0 && <p style={{fontSize: '0.85rem', color: '#64748b'}}>No thresholds set.</p>}
              </div>
              <button className="cd-btn-add-action"><Plus size={16}/> Add Threshold</button>
            </div>

          </div>
        </div>

        {/* --- HÀNG DƯỚI CÙNG: COMMAND LOG FULL WIDTH --- */}
        <div className="cd-card" style={{marginTop: '24px'}}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
            <h3 className="cd-card-title log-title" style={{marginBottom: 0, paddingBottom: 0, borderBottom: 'none'}}>
              Command Log
            </h3>
            <button className="export-btn" onClick={() => alert('Exporting to CSV...')}>
              <Download size={16} /> Export
            </button>
          </div>

          <div style={{overflowX: 'auto'}}>
            <table className="cd-log-table">
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
                      <div className="cd-log-time-wrap">
                        <span className="cd-log-date">{log.date}</span>
                        <span className="cd-log-time">{log.time}</span>
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
          
          {totalLogPages > 1 && (
            <div className="cd-pagination">
              <button 
                className="cd-page-btn" 
                onClick={() => setCurrentLogPage(p => p - 1)} 
                disabled={currentLogPage === 1}
              >
                Previous
              </button>
              <span className="cd-page-info">Page {currentLogPage} of {totalLogPages}</span>
              <button 
                className="cd-page-btn" 
                onClick={() => setCurrentLogPage(p => p + 1)} 
                disabled={currentLogPage === totalLogPages}
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

export default ControlDev;