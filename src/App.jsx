import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './components/Auth';
import InitialSetup from './components/InitialSetup';
import Dashboard from './components/Dashboard';
import Biogas from './components/Biogas'
import Gensets from './components/Gensets';
import GenDetail from './components/GenDetail';
import ControlGen from './components/ControlGen';
import ConTrolDev from './components/ControlDev';
import Alerts from './components/Alerts';
import Settings from './components/Settings';
import PowerQuality from './components/PowerQuality';
import Vibration from './components/Vibration';
import Bess from './components/Bess';
import WindTurbine from './components/WindTurbine';
function App() {
  return (
    <Router>
      <Routes>
        {/* Vừa vào web (gốc) thì hiện trang Đăng nhập/Đăng ký */}
        <Route path="/" element={<Auth />} />
        
        {/* Đường dẫn tới trang Thiết lập farm */}
        <Route path="/setup" element={<InitialSetup />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/biogas" element={<Biogas />} />
        <Route path="/dashboard/bess" element={<Bess />} />
        <Route path="/dashboard/wind" element={<WindTurbine />} />

        <Route path="/dashboard/gensets" element={<Gensets />} />
        <Route path="/dashboard/gensets/detail" element={<GenDetail />} />
        <Route path="/control/gen" element={<ControlGen />} />
        <Route path="/control/device" element={<ConTrolDev />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/analysis/powerquality" element={<PowerQuality />} />
        <Route path="/analysis/vibration" element={<Vibration />} />

      </Routes>
    </Router>
  );
}

export default App;