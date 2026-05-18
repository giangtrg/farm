import React, { useState, useMemo, useEffect } from 'react';
import Topbar from './Topbar'; 
import { Link } from 'react-router-dom';
import { AlertTriangle, Filter, Download, Clock, Bell, ChevronRight, } from 'lucide-react';
import './Alerts.css';

// Sinh data Mock - Đã thêm INFO và khu vực Biogas Power
const generateMockAlerts = () => {
  const alerts = [];
  const baseDate = new Date();
  
  const areas = ['Open Field A', 'Open Field B', 'Greenhouse 1', 'Greenhouse 2', 'Pump Station', 'Biogas Power'];
  const devices = ['PMP-101', 'VAL-203', 'HTR-301', 'FAN-402', 'MTR-704', 'GEN-01', 'GEN-02'];
  const severities = ['CRITICAL', 'WARNING', 'INFO']; 
  
  const descriptions = {
    'CRITICAL': [
      'Engine coolant temp exceeded 95°C', 
      'Inverter overvoltage detected', 
      'Pump dry run - flow rate 0 L/s', 
      'Emergency Stop triggered locally',
      'Generator sync failure to main grid'
    ],
    'WARNING': [
      'Fuel tank level below 20%', 
      'Oil pressure drop detected', 
      'High humidity > 85% in Greenhouse', 
      'Communication packet loss',
      'Generator scheduled maintenance due'
    ],
    'INFO': [
      'System rebooted successfully',
      'Firmware update completed',
      'User Admin logged in',
      'Automated schedule executed',
      'Grid sync successful'
    ]
  };

  for (let i = 1; i <= 35; i++) {
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const descList = descriptions[severity];
    const logDate = new Date(baseDate.getTime() - i * 3600000 * 2.5);

    alerts.push({
      id: i,
      date: logDate.toLocaleDateString('en-GB'),
      time: logDate.toLocaleTimeString('en-US', { hour12: false }),
      area: areas[Math.floor(Math.random() * areas.length)],
      device: devices[Math.floor(Math.random() * devices.length)],
      severity: severity,
      description: descList[Math.floor(Math.random() * descList.length)],
      isRead: i > 5 // 5 cảnh báo đầu tiên sẽ ở trạng thái chưa đọc
    });
  }
  return alerts;
};

const Alerts = () => {
  // === STATE ĐỒNG HỒ ===
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [alerts, setAlerts] = useState(generateMockAlerts());
  const [areaFilter, setAreaFilter] = useState('All');
  const [sevFilter, setSevFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const alertsPerPage = 12;

  const markAsRead = (id) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, isRead: true } : a));
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      const matchArea = areaFilter === 'All' || a.area === areaFilter;
      const matchSev = sevFilter === 'All' || a.severity === sevFilter;
      return matchArea && matchSev;
    });
  }, [alerts, areaFilter, sevFilter]);

  const totalPages = Math.ceil(filteredAlerts.length / alertsPerPage);
  const indexOfLastAlert = currentPage * alertsPerPage;
  const indexOfFirstAlert = indexOfLastAlert - alertsPerPage;
  const currentAlerts = filteredAlerts.slice(indexOfFirstAlert, indexOfLastAlert);

  const dbAreas = [...new Set(alerts.map(a => a.area))].sort();

  return (
    <div className="alert-wrapper">
      <Topbar />
      
      <div className="alert-content">
        
        {/* --- PAGE HEADER ĐỒNG BỘ --- */}
        <div className="alert-page-header">
          {/* --- BREADCRUMB --- */}
          <nav aria-label="breadcrumb" className="pq-breadcrumb">
            <Link to="/dashboard">
              Home
            </Link>
            
            <ChevronRight size={14} color="#94a3b8" aria-hidden="true" />
                
            <span className="current-page" aria-current="page">
              Alert Center
            </span>
          </nav>
        </div>

        
        <div className="alert-card">
          
          {/* THÊM ICON VÀ ĐỒNG BỘ CARD TITLE */}
          <div className="alert-card-title">
            <Bell size={20} color="#002d5b" /> Alerts History
          </div>

          <div className="alert-filter-bar-wrap">
            <div className="alert-filter-bar">
              <div className="alert-filter-group">
                <Filter size={18} color="#475569"/> 
                <span className="alert-filter-label">Area:</span>
                <select className="alert-select" value={areaFilter} onChange={(e) => { setAreaFilter(e.target.value); setCurrentPage(1); }}>
                  <option value="All">All Areas</option>
                  {dbAreas.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              
              <div className="alert-filter-group">
                <span className="alert-filter-label">Severity:</span>
                <select className="alert-select" value={sevFilter} onChange={(e) => { setSevFilter(e.target.value); setCurrentPage(1); }}>
                  <option value="All">All Severities</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="WARNING">Warning</option>
                  <option value="INFO">Info</option>
                </select>
              </div>
            </div>

            <button className="export-btn" onClick={() => alert('Exporting to CSV...')}>
              <Download size={16} /> Export
            </button>
          </div>

          <div style={{overflowX: 'auto'}}>
            <table className="alert-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Area</th>
                  <th>Device ID</th>
                  <th>Severity</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {currentAlerts.map(alert => (
                  <tr 
                    key={alert.id} 
                    className={`alert-row ${alert.isRead ? 'read' : 'unread'}`}
                    onClick={() => !alert.isRead && markAsRead(alert.id)}
                  >
                    <td>
                      <div className="alert-time-wrap">
                        <span className="alert-time-date">{alert.date}</span>
                        <span className="alert-time-hour">{alert.time}</span>
                      </div>
                    </td>
                    <td>{alert.area}</td>
                    <td><span className="alert-device-id">{alert.device}</span></td>
                    <td>
                      <span className={`severity-text ${alert.severity.toLowerCase()}`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td>{alert.description}</td>
                  </tr>
                ))}
                {currentAlerts.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{textAlign: 'center', padding: '40px', color: '#94a3b8', fontStyle: 'italic'}}>
                      No alerts found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="alert-pagination">
              <button 
                className="alert-page-btn" 
                onClick={() => setCurrentPage(p => p - 1)} 
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="alert-page-info">Page {currentPage} of {totalPages}</span>
              <button 
                className="alert-page-btn" 
                onClick={() => setCurrentPage(p => p + 1)} 
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

export default Alerts;