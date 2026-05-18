import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Leaf, LayoutDashboard, Factory, Zap, 
  Cpu, Server, Activity, BarChart2, 
  Bell, MapPin, ChevronDown, User, LogOut,
  Flame, Check
} from 'lucide-react';
import './Topbar.css';

const Topbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const [openDropdown, setOpenDropdown] = useState(null);
  const topbarRef = useRef(null);

  const cachedProfile = JSON.parse(localStorage.getItem('cached_profile')) || { name: '', avatar: null };
  const cachedFarms = JSON.parse(localStorage.getItem('cached_farms')) || [];
  const savedFarmId = localStorage.getItem('active_farm_id');
  
  const initialActiveFarm = cachedFarms.find(f => f.id === savedFarmId) || cachedFarms[0] || null;

  const [profile, setProfile] = useState(cachedProfile);
  const [farms, setFarms] = useState(cachedFarms);
  const [activeFarm, setActiveFarm] = useState(initialActiveFarm);

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const [userRes, farmRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/me/', { headers: { 'Authorization': `Token ${token}` } }),
          fetch('http://127.0.0.1:8000/api/farms/', { headers: { 'Authorization': `Token ${token}` } })
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          setProfile(userData);
          localStorage.setItem('cached_profile', JSON.stringify(userData)); 
        }

        if (farmRes.ok) {
          const farmData = await farmRes.json();
          setFarms(farmData);
          localStorage.setItem('cached_farms', JSON.stringify(farmData));

          const currentId = localStorage.getItem('active_farm_id');
          const current = farmData.find(f => f.id === currentId) || farmData[0];
          if (current) {
            setActiveFarm(current);
            localStorage.setItem('active_farm_id', current.id);
          }
        }
      } catch (error) {
        console.error("Topbar Fetch Error:", error);
      }
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (topbarRef.current && !topbarRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (menuName) => {
    setOpenDropdown(openDropdown === menuName ? null : menuName);
  };

  const handleSwitchFarm = (farm) => {
    localStorage.setItem('active_farm_id', farm.id);
    setActiveFarm(farm);
    setOpenDropdown(null);
    window.location.reload(); 
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('active_farm_id');
    localStorage.removeItem('cached_profile');
    localStorage.removeItem('cached_farms');
    navigate('/'); 
  };

  const isMenuActive = (pathKey) => currentPath.includes(pathKey);

  return (
    <div className="topbar-wrapper" ref={topbarRef}>
      
      {/* 1. BRAND LOGO */}
      <Link to="/dashboard" className="topbar-brand">

        <div className="topbar-brand-name">
          Logo + Name<span></span>
        </div>
      </Link>

      {/* 2. MAIN NAVIGATION */}
      <nav className="topbar-nav">
        
        {/* MONITORING MENU */}
        <div className="topbar-nav-item">
          <button 
            className={`topbar-nav-btn ${isMenuActive('/dashboard') ? 'active' : ''}`}
            onClick={() => toggleDropdown('monitoring')}
          >
            Monitoring <ChevronDown size={14}/>
          </button>
          
          <div className={`topbar-dropdown ${openDropdown === 'monitoring' ? 'show' : ''}`}>
            <Link to="/dashboard" className={`dropdown-link ${currentPath === '/dashboard' ? 'active-sub' : ''}`} onClick={() => setOpenDropdown(null)}>
              Dashboard
            </Link>
            <Link to="/dashboard/biogas" className={`dropdown-link ${currentPath === '/dashboard/biogas' ? 'active-sub' : ''}`} onClick={() => setOpenDropdown(null)}>
              Digester
            </Link>
            <Link to="/dashboard/gensets" className={`dropdown-link ${currentPath === '/dashboard/gensets' ? 'active-sub' : ''}`} onClick={() => setOpenDropdown(null)}>
              Gensets
            </Link>
          </div>
        </div>

        {/* CONTROL MENU */}
        <div className="topbar-nav-item">
          <button 
            className={`topbar-nav-btn ${isMenuActive('/control') ? 'active' : ''}`}
            onClick={() => toggleDropdown('control')}
          >
            Control <ChevronDown size={14}/>
          </button>
          
          <div className={`topbar-dropdown ${openDropdown === 'control' ? 'show' : ''}`}>
            <Link to="/control/gen" className={`dropdown-link ${currentPath === '/control/gen' ? 'active-sub' : ''}`} onClick={() => setOpenDropdown(null)}>
              Generators
            </Link>
            <Link to="/control/device" className={`dropdown-link ${currentPath === '/control/device' ? 'active-sub' : ''}`} onClick={() => setOpenDropdown(null)}>
              Devices
            </Link>
          </div>
        </div>

        {/* ANALYSIS MENU */}
        <div className="topbar-nav-item">
          <button 
            className={`topbar-nav-btn ${isMenuActive('/analysis') ? 'active' : ''}`}
            onClick={() => toggleDropdown('analysis')}
          >
            Analysis <ChevronDown size={14}/>
          </button>
          
          <div className={`topbar-dropdown ${openDropdown === 'analysis' ? 'show' : ''}`}>
            <Link to="/analysis/powerquality" className={`dropdown-link ${currentPath === '/analysis/powerquality' ? 'active-sub' : ''}`} onClick={() => setOpenDropdown(null)}>
              Power Quality
            </Link>
            <Link to="/analysis/vibration" className={`dropdown-link ${currentPath === '/analysis/vibration' ? 'active-sub' : ''}`} onClick={() => setOpenDropdown(null)}>
              Vibration
            </Link>
          </div>
        </div>

        {/* ALERTS LINK */}
        <div className="topbar-nav-item">
          <Link to="/alerts" className={`topbar-nav-btn ${currentPath === '/alerts' ? 'active' : ''}`} style={{textDecoration: 'none'}}>
            Alerts
          </Link>
        </div>

      </nav>

      {/* 3. RIGHT CONTROLS */}
      <div className="topbar-right">
        
        {/* --- SỬA CSS LỖI: ÉP cứng thẻ dropdown thả xuống 100% so với nút --- */}
        <div className="topbar-user-wrap" style={{ position: 'relative' }}>
          <button 
            className="topbar-farm-badge" 
            onClick={() => toggleDropdown('farm')}
            style={{ background: 'transparent', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '20px', transition: '0.2s' }}
          >
            <MapPin size={14} color="#64748b"/>
            <span className="topbar-farm-name">{activeFarm ? activeFarm.name : 'Select Farm'}</span>
            <ChevronDown size={14} color="#64748b"/>
          </button>

          <div className={`topbar-dropdown user-dropdown ${openDropdown === 'farm' ? 'show' : ''}`} style={{ position: 'absolute', top: '100%', marginTop: '0.5rem', right: 0, width: '240px', padding: '8px 0' }}>
            {farms.map(farm => (
              <button 
                key={farm.id} 
                className="dropdown-link"
                onClick={() => handleSwitchFarm(farm)}
                style={{ width: '100%', background: activeFarm?.id === farm.id ? '#f1f5f9' : 'none', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: activeFarm?.id === farm.id ? '#002d5b' : '#475569', fontWeight: activeFarm?.id === farm.id ? '700' : '500' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {farm.name}
                </div>
                {activeFarm?.id === farm.id && <Check size={14} color="#10b981" />}
              </button>
            ))}
          </div>
        </div>

        {/* Notification Bell */}
        <Link to="/alerts" className="topbar-action-btn">
          <Bell size={20} />
          <span className="topbar-alert-dot"></span>
        </Link>

        {/* USER PROFILE */}
        <div className="topbar-user-wrap" style={{ position: 'relative' }}>
          <button className="topbar-avatar-btn" onClick={() => toggleDropdown('user')}>
            <div className="topbar-avatar" style={{ overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {profile.avatar ? (
                <img src={profile.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                profile.name ? profile.name.charAt(0).toUpperCase() : 'U'
              )}
            </div>
            <span className="topbar-user-name">{profile.name || 'User'}</span>
            <ChevronDown size={14} color="#64748b"/>
          </button>
          
          <div className={`topbar-dropdown user-dropdown ${openDropdown === 'user' ? 'show' : ''}`} style={{ position: 'absolute', top: '100%', marginTop: '0.5rem', right: 0 }}>
            <Link to="/settings" className="dropdown-link" onClick={() => setOpenDropdown(null)}>
              <User size={16}/> Profile Settings
            </Link>
            <div className="dropdown-divider"></div>
            <button className="dropdown-link logout-link" style={{width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer'}} onClick={handleLogout}>
              <LogOut size={16}/> Logout
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Topbar;