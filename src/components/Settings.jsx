import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; 
import Topbar from './Topbar'; 
import Cropper from 'react-easy-crop';
import { 
  User, Map, Shield, Camera, MapPin, Plus, Trash2, 
  Smartphone, Monitor, Factory, Sun, Wind, Battery, Key, X, Minus, ChevronRight 
} from 'lucide-react'; 
import './Settings.css';

// =======================================================
// MẢNG TỈNH THÀNH (Bác copy 63 tỉnh từ InitialSetup paste vào đây)
// =======================================================
const PROVINCES_VN = [
  "An Giang", "Ba Ria - Vung Tau", "Bac Giang", "Bac Kan", "Bac Lieu",
  "Bac Ninh", "Ben Tre", "Binh Dinh", "Binh Duong", "Binh Phuoc",
  "Binh Thuan", "Ca Mau", "Can Tho", "Cao Bang", "Da Nang",
  "Dak Lak", "Dak Nong", "Dien Bien", "Dong Nai", "Dong Thap",
  "Gia Lai", "Ha Giang", "Ha Nam", "Ha Noi", "Ha Tinh",
  "Hai Duong", "Hai Phong", "Hau Giang", "Ho Chi Minh City", "Hoa Binh",
  "Hung Yen", "Khanh Hoa", "Kien Giang", "Kon Tum", "Lai Chau",
  "Lam Dong", "Lang Son", "Lao Cai", "Long An", "Nam Dinh",
  "Nghe An", "Ninh Binh", "Ninh Thuan", "Phu Tho", "Phu Yen",
  "Quang Binh", "Quang Nam", "Quang Ngai", "Quang Ninh", "Quang Tri",
  "Soc Trang", "Son La", "Tay Ninh", "Thai Binh", "Thai Nguyen",
  "Thanh Hoa", "Thua Thien Hue", "Tien Giang", "Tra Vinh", "Tuyen Quang",
  "Vinh Long", "Vinh Phuc", "Yen Bai"
];

// =======================================================
// HÀM XỬ LÝ CẮT ẢNH THẬT SỰ BẰNG CANVAS (DÙNG CHO CROPPER)
// =======================================================
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Cắt đúng phần đã chọn
  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height
  );

  // Ép thành file ảnh JPG
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg');
  });
}

// --- MODAL GIAO DIỆN CẮT ẢNH ---
const AvatarCropperModal = ({ isOpen, imageSrc, onClose, onSave }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  if (!isOpen || !imageSrc) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', width: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#0f172a' }}>Adjust Avatar</h3>
          <X size={24} color="#64748b" cursor="pointer" onClick={onClose} />
        </div>
        
        <div style={{ position: 'relative', width: '100%', height: '300px', background: '#333', borderRadius: '12px', overflow: 'hidden' }}>
          <Cropper
            image={imageSrc} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false}
            onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '25px' }}>
          <Minus size={20} color="#64748b" cursor="pointer" onClick={() => setZoom(z => Math.max(1, z - 0.1))} />
          <input 
            type="range" min={1} max={3} step={0.1} value={zoom} 
            onChange={(e) => setZoom(parseFloat(e.target.value))} 
            style={{ flex: 1, cursor: 'pointer', accentColor: '#10b981' }} 
          />
          <Plus size={20} color="#64748b" cursor="pointer" onClick={() => setZoom(z => Math.min(3, z + 0.1))} />
        </div>

        <div style={{ marginTop: '30px', display: 'flex', gap: '12px' }}>
          <button className="settings-btn-outline" style={{flex: 1, padding: '12px', borderRadius: '10px'}} onClick={onClose}>Cancel</button>
          <button className="settings-btn" style={{flex: 1, padding: '12px', borderRadius: '10px'}} onClick={() => onSave(imageSrc, croppedAreaPixels)}>Save Avatar</button>
        </div>
      </div>
    </div>
  );
};


const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', avatar: null, role: 'USER' });
  const [farms, setFarms] = useState([]);
  const [editingFarm, setEditingFarm] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newFarmCode, setNewFarmCode] = useState('');
  const [twoFactor, setTwoFactor] = useState(true);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  // Cropper State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState(null);

  const [sessionInfo, setSessionInfo] = useState({ device: 'Loading...', browser: 'Loading...', type: 'desktop' });
  const token = localStorage.getItem('access_token');

  // Khởi tạo Data (Lấy ảnh từ DB về)
  useEffect(() => {
    const ua = navigator.userAgent;
    let browser = "Unknown Browser";
    if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
    else if (ua.includes("Edge")) browser = "Edge";

    let device = "Desktop PC";
    let type = 'desktop';
    if (/Mobile|Android|iP(hone|od|ad)/.test(ua)) { device = "Mobile Device"; type = 'mobile'; }
    if (ua.includes("Mac")) device = "Apple Mac";
    if (ua.includes("Windows")) device = "Windows PC";

    setSessionInfo({ device: `${device} - ${browser}`, browser, type });

    const loadData = async () => {
      try {
        const [userRes, farmRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/me/', { headers: { 'Authorization': `Token ${token}` } }),
          fetch('http://127.0.0.1:8000/api/farms/', { headers: { 'Authorization': `Token ${token}` } })
        ]);
        if (userRes.ok) {
            const userData = await userRes.json();
            setProfile(userData); 
        }
        if (farmRes.ok) setFarms(await farmRes.json());
      } catch (error) { console.error(error); }
    };
    loadData();
  }, [token]);

  // --- XỬ LÝ CHỌN VÀ CẮT ẢNH THỰC SỰ ---
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setTempImageSrc(reader.result); // Đưa ảnh thô vào modal cắt
        setCropModalOpen(true);
      });
      reader.readAsDataURL(file);
    }
    e.target.value = null; 
  };

  const handleSaveCroppedImage = async (imageSrc, croppedAreaPixels) => {
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      
      const localUrl = URL.createObjectURL(croppedImageBlob);
      setProfile({ ...profile, avatar: localUrl });
      setCropModalOpen(false);

      const formData = new FormData();
      formData.append('avatar', croppedImageBlob, 'avatar.jpg');

      const res = await fetch('http://127.0.0.1:8000/api/me/', {
        method: 'PUT',
        headers: { 'Authorization': `Token ${token}` },
        body: formData
      });
      
      const data = await res.json();
      if (res.ok) {
        setProfile(prev => ({ ...prev, avatar: data.avatar })); 
        alert('Avatar updated successfully!');
      } else {
        alert('Failed to update avatar');
      }
    } catch (err) { alert('Error processing image'); }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/me/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
        body: JSON.stringify({ name: profile.name, phone: profile.phone })
      });
      if (res.ok) alert('Profile updated successfully!');
      else alert('Update failed!');
    } catch (err) { alert('Network error'); }
  };

  const handleUpdatePassword = async () => {
    if (!passwords.current) return alert('Please enter your current password!');
    if (!passwords.new || passwords.new !== passwords.confirm) return alert('New passwords do not match!');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/me/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
        body: JSON.stringify({ current_password: passwords.current, new_password: passwords.new })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Password updated successfully!');
        setPasswords({ current: '', new: '', confirm: '' });
      } else {
        alert(data.error || 'Failed to update password!');
      }
    } catch (err) { alert('Network error'); }
  };

  const handleVerifyCode = async () => {
    if (!newFarmCode.trim()) return alert('Please enter an activation code!');

    try {
      const res = await fetch('http://127.0.0.1:8000/api/verify-code/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
        body: JSON.stringify({ code: newFarmCode })
      });
      
      const data = await res.json();
      if (res.ok) {
        setIsAddingNew(true);
        setEditingFarm({
          id: 'NEW', name: '', 
          location: PROVINCES_VN[0], // Lấy tỉnh đầu tiên làm mặc định
          has_biogas: true, has_solar: false, has_wind: false, has_bess: false,
          activationCode: newFarmCode,
          zones: ['Zone 1']
        });
        alert('Activation Code Validated!');
        setNewFarmCode('');
      } else {
        alert(data.error || 'Invalid Activation Code!');
      }
    } catch (err) {
      alert('Network error while verifying code');
    }
  };

  const handleSaveFarm = async () => {
    if (!editingFarm.name.trim()) return alert('Farm name cannot be empty!');
    const isNew = editingFarm.id === 'NEW';
    const url = isNew ? 'http://127.0.0.1:8000/api/farms/' : `http://127.0.0.1:8000/api/farms/${editingFarm.id}/`;

    try {
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` },
        body: JSON.stringify(editingFarm)
      });
      const data = await res.json();
      if (res.ok) {
        alert(isNew ? 'New farm registered successfully!' : 'Farm configuration saved!');
        setEditingFarm(null);
        setIsAddingNew(false);
        if (isNew) setFarms([...farms, { ...editingFarm, id: data.id }]);
        else setFarms(farms.map(f => f.id === editingFarm.id ? editingFarm : f));
      } else {
        alert(data.error || 'Failed to save farm');
      }
    } catch (err) { alert('Network error'); }
  };

  return (
    <div className="settings-wrapper">
      <Topbar />

      <AvatarCropperModal 
        isOpen={cropModalOpen} imageSrc={tempImageSrc} 
        onClose={() => setCropModalOpen(false)} onSave={handleSaveCroppedImage} 
      />

      <div className="settings-content">
        
        {/* --- BREADCRUMB --- */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600, marginBottom: '24px' }}>
          <Link to="/dashboard" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={14} color="#94a3b8" />
          <span style={{ color: '#0f172a' }}>Settings</span>
        </div>

        <div className="settings-layout">
          
          {/* --- CỘT MENU TRÁI --- */}
          <div className="settings-sidebar" style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className={`settings-menu-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => {setActiveTab('profile'); setEditingFarm(null); setIsAddingNew(false);}}><User size={20} /> Personal Profile</div>
            <div className={`settings-menu-item ${activeTab === 'farms' ? 'active' : ''}`} onClick={() => {setActiveTab('farms'); setEditingFarm(null); setIsAddingNew(false);}}><Map size={20} /> Farm Management</div>
            <div className={`settings-menu-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => {setActiveTab('security'); setEditingFarm(null); setIsAddingNew(false);}}><Shield size={20} /> Security & Access</div>
          </div>

          <div className="settings-main-content">
            {/* TAB 1: PROFILE */}
            {activeTab === 'profile' && (
              <div className="settings-panel">
                <h2 className="settings-panel-title"><User size={22} color="#002d5b"/> Personal Information</h2>
                
                <div className="set-avatar-section">
                  <div className="set-avatar-wrap" style={{position: 'relative', overflow: 'hidden'}}>
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    ) : (
                      profile.name ? profile.name.charAt(0).toUpperCase() : 'U'
                    )}
                    <label htmlFor="avatar-upload" className="set-avatar-overlay">
                      <Camera size={16}/>
                    </label>
                    <input id="avatar-upload" type="file" accept="image/*" hidden onChange={handleFileSelect} />
                  </div>
                  <div>
                    <h3 style={{margin: '0 0 4px 0', fontSize: '1.2rem', color: '#0f172a'}}>{profile.name || 'Loading...'}</h3>
                    <p style={{margin: 0, color: '#64748b', fontSize: '0.9rem'}}>{profile.role === 'ADMIN' ? 'Administrator' : 'Operator'}</p>
                  </div>
                </div>

                <div className="settings-form-grid">
                  <div className="settings-form-group settings-full-width">
                    <label className="settings-label">Full Name</label>
                    <input className="settings-input" type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} />
                  </div>
                  <div className="settings-form-group settings-full-width">
                    <label className="settings-label">Phone Number</label>
                    <input className="settings-input" type="text" value={profile.phone || ''} onChange={(e) => setProfile({...profile, phone: e.target.value})} />
                  </div>
                  <div className="settings-form-group settings-full-width">
                    <label className="settings-label">Email Address</label>
                    <input className="settings-input" type="email" value={profile.email} disabled style={{background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed'}} />
                  </div>
                </div>
                <button className="settings-btn" style={{marginTop: '10px'}} onClick={handleSaveProfile}>Save Changes</button>
              </div>
            )}

            {/* TAB 2: FARMS */}
            {activeTab === 'farms' && (
              <div className="settings-panel">
                <h2 className="settings-panel-title"><Map size={22} color="#002d5b"/> Farm Management</h2>
                
                {!editingFarm ? (
                  <>
                    <div className="set-farm-list">
                      <label className="settings-label" style={{marginBottom: '0'}}>Active Farms</label>
                      {farms.length === 0 ? <p style={{color: '#64748b'}}>No farms found.</p> : farms.map(farm => (
                        <div key={farm.id} className="set-farm-item" onClick={() => setEditingFarm(farm)}>
                          <div className="set-farm-info">
                            <h4>{farm.name} <span style={{fontSize:'0.75rem', color:'#94a3b8', fontWeight:'normal'}}>({farm.id})</span></h4>
                            <p><MapPin size={12}/> {farm.location} • {farm.zones ? farm.zones.length : 0} Zones configured</p>
                          </div>
                          <button className="settings-btn-outline" style={{padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600}}>Edit</button>
                        </div>
                      ))}
                    </div>

                    <div className="set-farm-add-box">
                      <h4 style={{margin: '0 0 8px 0', color: '#0f172a', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px'}}><Key size={18} color="#f59e0b"/> Register New Farm</h4>
                      <p style={{margin: 0, color: '#64748b', fontSize: '0.85rem'}}>Enter your valid activation code.</p>
                      <div className="set-code-wrapper">
                        <input className="settings-input" type="text" placeholder="E.g. FARM-2026-XYZ" value={newFarmCode} onChange={(e) => setNewFarmCode(e.target.value.toUpperCase())}/>
                        <button className="settings-btn" onClick={handleVerifyCode} disabled={!newFarmCode}>Verify</button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #cbd5e1'}}>
                    <h3 style={{margin: '0 0 20px 0', color: '#0f172a', fontSize: '1.1rem'}}>{isAddingNew ? 'Setup New Farm Facility' : `Edit Farm: ${editingFarm.id}`}</h3>
                    
                    <div className="settings-form-grid">
                      <div className="settings-form-group">
                        <label className="settings-label">Farm Name</label>
                        <input className="settings-input" type="text" value={editingFarm.name} onChange={(e) => setEditingFarm({...editingFarm, name: e.target.value})} />
                      </div>

                      {/* --- THAY ĐỔI LỚN NHẤT TẠI ĐÂY: LOCATION DROPDOWN --- */}
                      <div className="settings-form-group">
                        <label className="settings-label">Location</label>
                        <select 
                          className="settings-input" 
                          value={editingFarm.location} 
                          onChange={(e) => setEditingFarm({...editingFarm, location: e.target.value})}
                          style={{cursor: 'pointer'}}
                        >
                          {PROVINCES_VN.map(prov => (
                            <option key={prov} value={prov}>{prov}</option>
                          ))}
                        </select>
                      </div>
                      {/* ---------------------------------------------------- */}

                    </div>

                    <div className="settings-form-group">
                      <label className="settings-label">Energy Sources</label>
                      <div className="set-source-grid">
                        <div className="set-source-toggle active" style={{opacity: 0.6, cursor: 'not-allowed'}} title="Biogas is required">
                          <Factory size={20}/> <span style={{fontSize: '0.85rem', fontWeight: 600}}>Biogas <span style={{color: '#ef4444'}}>*</span></span>
                        </div>
                        <div className={`set-source-toggle ${editingFarm.has_solar ? 'active' : ''}`} onClick={() => setEditingFarm({...editingFarm, has_solar: !editingFarm.has_solar})}><Sun size={20}/> <span style={{fontSize: '0.85rem', fontWeight: 600}}>Solar</span></div>
                        <div className={`set-source-toggle ${editingFarm.has_wind ? 'active' : ''}`} onClick={() => setEditingFarm({...editingFarm, has_wind: !editingFarm.has_wind})}><Wind size={20}/> <span style={{fontSize: '0.85rem', fontWeight: 600}}>Wind</span></div>
                        <div className={`set-source-toggle ${editingFarm.has_bess ? 'active' : ''}`} onClick={() => setEditingFarm({...editingFarm, has_bess: !editingFarm.has_bess})}><Battery size={20}/> <span style={{fontSize: '0.85rem', fontWeight: 600}}>BESS</span></div>
                      </div>
                    </div>

                    <div className="settings-form-group">
                      <label className="settings-label">Farm Zones ({editingFarm.zones ? editingFarm.zones.length : 0})</label>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px'}}>
                        {editingFarm.zones && editingFarm.zones.map((zone, idx) => (
                          <div key={idx} className="set-zone-row">
                            <input className="settings-input" type="text" value={zone} onChange={(e) => {
                               const newZones = [...editingFarm.zones];
                               newZones[idx] = e.target.value;
                               setEditingFarm({...editingFarm, zones: newZones});
                            }} />
                            {editingFarm.zones.length > 1 && (
                              <button className="settings-btn-danger" onClick={() => {
                                setEditingFarm({...editingFarm, zones: editingFarm.zones.filter((_, i) => i !== idx)});
                              }}><Trash2 size={18}/></button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button className="settings-btn-outline" style={{padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'}} onClick={() => setEditingFarm({...editingFarm, zones: [...editingFarm.zones, `New Zone`]})}>
                        <Plus size={16}/> Add Zone
                      </button>
                    </div>

                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #cbd5e1'}}>
                      <button className="settings-btn-outline" style={{padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600}} onClick={() => {setEditingFarm(null); setIsAddingNew(false);}}>Cancel</button>
                      <button className="settings-btn" onClick={handleSaveFarm}>Save Configuration</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SECURITY */}
            {activeTab === 'security' && (
              <div className="settings-panel">
                <h2 className="settings-panel-title"><Shield size={22} color="#002d5b"/> Security & Access</h2>
                
                <div className="set-sec-block">
                  <div className="set-sec-title">Change Password</div>
                  <div className="settings-form-group">
                    <label className="settings-label">Current Password</label>
                    <input className="settings-input" type="password" value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} placeholder="••••••••" />
                  </div>
                  <div className="settings-form-grid">
                    <div className="settings-form-group" style={{margin: 0}}>
                      <label className="settings-label">New Password</label>
                      <input className="settings-input" type="password" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} placeholder="••••••••" />
                    </div>
                    <div className="settings-form-group" style={{margin: 0}}>
                      <label className="settings-label">Confirm New Password</label>
                      <input className="settings-input" type="password" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} placeholder="••••••••" />
                    </div>
                  </div>
                  <button className="settings-btn" style={{marginTop: '16px'}} onClick={handleUpdatePassword}>Update Password</button>
                </div>

                <div className="set-sec-block">
                  <div className="set-sec-title">Two-Factor Authentication (2FA)</div>
                  <div className="set-2fa-box">
                    <div>
                      <h4 style={{margin: '0 0 4px 0', fontSize: '1rem', color: '#0f172a'}}>Authenticator App</h4>
                      <p style={{margin: 0, fontSize: '0.85rem', color: '#64748b'}}>Use an app like Google Authenticator to get verification codes.</p>
                    </div>
                    <label className="set-switch">
                      <input type="checkbox" checked={twoFactor} onChange={() => { setTwoFactor(!twoFactor); alert(`2FA has been ${!twoFactor ? 'enabled' : 'disabled'}`); }} />
                      <span className="set-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="set-sec-block">
                  <div className="set-sec-title">Active Sessions</div>
                  <div style={{display: 'flex', flexDirection: 'column'}}>
                    <div className="set-session-item">
                      <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                        {sessionInfo.type === 'desktop' ? <Monitor size={24} color="#64748b"/> : <Smartphone size={24} color="#64748b"/>}
                        <div>
                          <h4 style={{margin: '0 0 4px 0', fontSize: '0.95rem', color: '#0f172a'}}>{sessionInfo.device} <span className="set-badge-current">This Device</span></h4>
                          <p style={{margin: 0, fontSize: '0.8rem', color: '#64748b'}}>Active now (Since login)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;