import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import './InitialSetup.css';

// Danh sách 63 tỉnh thành chuẩn định dạng cho OpenWeatherMap API
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

const InitialSetup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    farmName: '',
    location: '',
    activationCode: ''
  });

  const [systems, setSystems] = useState({
    has_biogas: true, 
    has_solar: false,
    has_wind: false,
    has_bess: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const finalValue = name === 'activationCode' ? value.toUpperCase() : value;
    setFormData({ ...formData, [name]: finalValue });
    if (errorMsg) setErrorMsg('');
  };

  const toggleSystem = (sysName) => {
    if (sysName === 'has_biogas') return; // Biogas là bắt buộc
    setSystems({ ...systems, [sysName]: !systems[sysName] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.location) {
      setErrorMsg('Please select a location for weather data.');
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem('access_token');
    
    // Gộp data form và systems lại để gửi đi
    const payload = { ...formData, ...systems };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/setup-farm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}` 
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to setup farm!');
      }

      alert(`Setup Complete! Your Farm ID is: ${data.farm_id}`);
      navigate('/dashboard');

    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="is-wrapper">
      <div className="is-card">
        
        <div className="is-header">
          <h2>Platform Setup</h2>
          <p>Let's personalize your platform by telling us about you and your facility.</p>
        </div>

        <form onSubmit={handleSubmit}>
          
          {errorMsg && (
            <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: '600' }}>
              {errorMsg}
            </div>
          )}

          <span className="is-section-label" style={{marginTop: 0}}>Personal Info</span>
          <div className="is-form-grid">
            <div className="is-group">
              <label>Full Name</label>
              <input 
                type="text" name="fullName" className="is-input" 
                placeholder="Enter full name" required
                value={formData.fullName} onChange={handleInputChange} 
              />
            </div>
            <div className="is-group">
              <label>Phone Number</label>
              <input 
                type="tel" name="phone" className="is-input" 
                placeholder="Enter phone number" required
                value={formData.phone} onChange={handleInputChange} 
              />
            </div>
          </div>

          <span className="is-section-label">Facility Info</span>
          <div className="is-form-grid">
            <div className="is-group">
              <label>Farm Name</label>
              <input 
                type="text" name="farmName" className="is-input" 
                placeholder="e.g. Green Valley Farm" required
                value={formData.farmName} onChange={handleInputChange} 
              />
            </div>

            <div className="is-group">
              <label>Location (For Weather Data)</label>
              <select 
                name="location" className="is-input" required
                value={formData.location} onChange={handleInputChange}
                style={{ appearance: 'auto', cursor: 'pointer' }}
              >
                <option value="" disabled>Select Province / City</option>
                {PROVINCES_VN.map((prov, index) => (
                  <option key={index} value={prov}>{prov}</option>
                ))}
              </select>
            </div>
          </div>

          <span className="is-section-label">Energy Systems</span>
          <p style={{fontSize: '0.9rem', color: '#64748b', marginBottom: '20px', marginTop: '-10px'}}>
            Select all the systems installed at your facility.
          </p>
          
          <div className="is-system-grid">
            <div className={`is-sys-card selected locked`} onClick={() => toggleSystem('has_biogas')}>
              <div className="is-sys-info">
                <h4>Biogas <span className="is-badge-required">Required</span></h4>
                <p>Generator Unit</p>
              </div>
              <div className="is-check-indicator"><CheckCircle2 size={20} /></div>
            </div>

            <div className={`is-sys-card ${systems.has_solar ? 'selected' : ''}`} onClick={() => toggleSystem('has_solar')}>
              <div className="is-sys-info">
                <h4>Solar PV</h4>
                <p>Photovoltaic Arrays</p>
              </div>
              <div className="is-check-indicator"><CheckCircle2 size={20} /></div>
            </div>

            <div className={`is-sys-card ${systems.has_wind ? 'selected' : ''}`} onClick={() => toggleSystem('has_wind')}>
              <div className="is-sys-info">
                <h4>Wind Turbine</h4>
                <p>Aero Generator</p>
              </div>
              <div className="is-check-indicator"><CheckCircle2 size={20} /></div>
            </div>

            <div className={`is-sys-card ${systems.has_bess ? 'selected' : ''}`} onClick={() => toggleSystem('has_bess')}>
              <div className="is-sys-info">
                <h4>BESS</h4>
                <p>Battery Storage</p>
              </div>
              <div className="is-check-indicator"><CheckCircle2 size={20} /></div>
            </div>
          </div>

          <span className="is-section-label">Activation</span>
          <div className="is-form-grid">
            <div className="is-group full-width">
              <label>Account Activation Code</label>
              <input 
                type="text" name="activationCode" 
                className="is-input activation-code" 
                placeholder="ENTER ACTIVATION CODE" required maxLength="20"
                value={formData.activationCode} onChange={handleInputChange} 
              />
              <p style={{fontSize:'0.8rem', color:'#64748b', margin:'6px 0 0 4px', textAlign: 'center'}}>
                Provided by your system administrator.
              </p>
            </div>
          </div>

          <button type="submit" className="is-btn" disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Complete Setup & Launch Dashboard'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default InitialSetup;