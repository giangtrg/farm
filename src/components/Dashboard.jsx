import React, { useState, useEffect } from 'react';
import Topbar from './Topbar'; 
import { Link } from 'react-router-dom'; 
import { 
  Flame, Sun, Wind, Battery, Zap, Activity, MapPin,
  CloudLightning, Droplets, Wind as WindIcon, Clock, Loader2, Droplet, Cloud,
  AlertTriangle, CalendarClock, Info, ShieldAlert, ClipboardList, Factory, ChevronRight
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { WiDaySunny, WiCloudy, WiRain, WiSnow, WiThunderstorm, WiFog } from 'weather-icons-react';
import './Dashboard.css';

// IMPORT ẢNH
import farmLayoutImg from '../assets/farm_layout.jpg';
import weatherClearImg from '../assets/weather_clear.jpg';
import weatherCloudsImg from '../assets/weather_clouds.jpg';
import weatherRainImg from '../assets/weather_rain.jpg';
import weatherStormImg from '../assets/weather_storm.jpg';
import weatherSnowImg from '../assets/weather_snow.jpg';
import weatherFogImg from '../assets/weather_fog.jpg';

// ==========================================================================
// DATA MÔ PHỎNG 
// ==========================================================================

// 1. DATA POWER TRENDS: Lấy mẫu 2 giờ 1 lần
const generateTrendData = () => {
  const data = [];
  const times = ["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"];
  
  for (let i = 0; i < times.length; i++) {
    const timeStr = times[i];
    const hour = parseInt(timeStr.substring(0, 2));
    
    const isDay = hour >= 6 && hour <= 17; 
    const pvGen = isDay ? (Math.sin((hour - 6) * Math.PI / 11) * 80 + Math.random() * 10) : 0;

    let bessDischarge = 0;
    let bessCharge = 0;
    if (hour >= 18 || hour <= 2) bessDischarge = 40 + Math.random() * 10; 
    else if (hour >= 10 && hour <= 14) bessCharge = 30 + Math.random() * 15; 

    data.push({
      time: timeStr,
      biogas: +(120 + Math.random() * 10).toFixed(1),
      pv: +(pvGen).toFixed(1),
      wind: +(30 + Math.random() * 20).toFixed(1),
      bess_discharge: +(bessDischarge).toFixed(1),
      bess_charge: +(bessCharge).toFixed(1),
      load: +(150 + Math.random() * 50).toFixed(1)
    });
  }
  return data;
};
const trendData = generateTrendData();

// 2. DATA BIOGAS: Lấy mẫu 15 phút 1 lần (Bỏ H2S)
const generateFlowData = () => {
  const data = [];
  let volume = 4500;
  let ch4 = 96.5; 
  
  for (let i = 0; i < 96; i++) {
    const hour = Math.floor(i / 4).toString().padStart(2, '0');
    const minute = ((i % 4) * 15).toString().padStart(2, '0');
    const timeStr = `${hour}:${minute}`;
    
    volume += (Math.random() * 50 - Math.random() * 40); 
    ch4 += (Math.random() * 0.5 - Math.random() * 0.5);

    data.push({ 
      time: timeStr, 
      volume: +(volume).toFixed(1),
      ch4: +(ch4).toFixed(1)
    });
  }
  return data;
};
const flowData = generateFlowData();

const genMixData = [
  { name: 'Biogas', value: 120.5, color: '#10b981' }, 
  { name: 'Solar PV', value: 80.2, color: '#f59e0b' }, 
  { name: 'Wind', value: 45.1, color: '#3b82f6' }, 
  { name: 'BESS', value: 10.0, color: '#8b5cf6' }   
];
const totalGen = genMixData.reduce((sum, item) => sum + item.value, 0).toFixed(1);

const loadMixData = [
  { name: 'Farm Load', value: 150.3, color: '#334155' }, 
  { name: 'Grid Export', value: 70.5, color: '#10b981' }, 
  { name: 'BESS', value: 35.0, color: '#8b5cf6' } 
];
const totalLoad = loadMixData.reduce((sum, item) => sum + item.value, 0).toFixed(1);

const activityLogData = [
  { id: 1, text: 'Admin switched BESS to Auto Mode.', time: '10:42 AM', icon: Activity, color: '#8b5cf6', bg: '#ede9fe' },
  { id: 2, text: 'Grid synchronization successful.', time: '09:15 AM', icon: Zap, color: '#10b981', bg: '#d1fae5' },
  { id: 3, text: 'Manual override on Digester Valve 2.', time: 'Yesterday', icon: Factory, color: '#f59e0b', bg: '#fef3c7' }
];

const scheduleData = [
  { id: 1, task: 'Automated digester mixing cycle.', time: 'Today, 20:00', icon: Factory, color: '#10b981', bg: '#d1fae5' },
  { id: 2, task: 'BESS scheduled discharge to Grid.', time: 'Today, 21:30', icon: Battery, color: '#8b5cf6', bg: '#ede9fe' },
  { id: 3, task: 'Daily system health diagnostic.', time: 'Tomorrow, 01:00', icon: Activity, color: '#0ea5e9', bg: '#e0f2fe' }
];

const alertsData = [
  { id: 1, type: 'critical', text: 'H2S filter capacity dropping below 20%.', time: '12 mins ago', icon: ShieldAlert, color: '#ef4444', bg: '#fee2e2' },
  { id: 2, type: 'warning', text: 'Inverter temp slightly high at Solar Array A.', time: '1 hour ago', icon: AlertTriangle, color: '#f59e0b', bg: '#fef3c7' },
  { id: 3, type: 'info', text: 'Grid connection minor voltage fluctuation.', time: '3 hours ago', icon: Info, color: '#3b82f6', bg: '#dbeafe' }
];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 1.25; 
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#475569" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12" fontWeight="700">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const Dashboard = () => {
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mốc XAxis 4 giờ 1 lần chung cho cả 2 đồ thị
  const timeTicks = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const API_KEY = '8aab13ee33ef0be171d31a98618f4b76'; 
        const url = `https://api.openweathermap.org/data/2.5/weather?q=Hanoi,VN&appid=${API_KEY}&units=metric`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status}`);
        
        const data = await response.json();
        setWeather({
          temp: data.main.temp,
          humidity: data.main.humidity,
          weather_main: data.weather[0].main, 
          wind_speed: data.wind.speed,
          rain_1h: data.rain ? (data.rain['1h'] || 0) : 0,
          clouds: data.clouds.all,
          location: `${data.name}, ${data.sys.country}`,
          iconCode: data.weather[0].icon
        });
        setLoadingWeather(false);
      } catch (error) {
        console.error("Lỗi gọi thời tiết thật:", error);
        setWeather(null);
        setLoadingWeather(false);
      }
    };

    fetchWeather();
    const timer = setInterval(fetchWeather, 15 * 60 * 1000); 
    return () => clearInterval(timer);
  }, []);

  const getWeatherIcon = (iconCode) => {
    if (!iconCode) return WiCloudy;
    if (iconCode.includes('01')) return WiDaySunny;
    if (iconCode.includes('02') || iconCode.includes('03') || iconCode.includes('04')) return WiCloudy;
    if (iconCode.includes('09') || iconCode.includes('10')) return WiRain;
    if (iconCode.includes('11')) return WiThunderstorm;
    if (iconCode.includes('13')) return WiSnow;
    if (iconCode.includes('50')) return WiFog;
    return WiCloudy;
  };
  const WeatherIcon = weather ? getWeatherIcon(weather.iconCode) : WiCloudy ;

  const getWeatherBg = (iconCode) => {
    if (!iconCode) return weatherCloudsImg;
    if (iconCode.includes('01')) return weatherClearImg;
    if (iconCode.includes('02') || iconCode.includes('03') || iconCode.includes('04')) return weatherCloudsImg;
    if (iconCode.includes('09') || iconCode.includes('10')) return weatherRainImg;
    if (iconCode.includes('11')) return weatherStormImg;
    if (iconCode.includes('13')) return weatherSnowImg;
    if (iconCode.includes('50')) return weatherFogImg;
    return weatherCloudsImg;
  };
  const currentWeatherBg = weather ? getWeatherBg(weather.iconCode) : weatherCloudsImg;

  const formatDate = (date) => {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Custom Legend tĩnh (cursor default, không onClick)
  const renderTrendLegend = () => {
    const legendItems = [
      { name: 'Biogas', color: '#10b981' },
      { name: 'Solar PV', color: '#f59e0b' },
      { name: 'Wind', color: '#3b82f6' },
      { name: 'BESS', color: '#8b5cf6' },
      { name: 'Farm Load', color: '#334155' }
    ];
    return (
      <div className="dashboard-custom-legend-biogas" style={{ marginTop: '0px', marginBottom: '15px' }}>
        {legendItems.map((item, index) => (
          <div key={`item-${index}`} className="dashboard-legend-item-biogas" style={{ cursor: 'default' }}>
            <div className="dashboard-legend-color-biogas" style={{ background: item.color }}></div>{item.name}
          </div>
        ))}
      </div>
    );
  };

  // Custom Legend tĩnh cho Flow (cursor default, không onClick)
  const renderFlowLegend = () => {
    const legendItems = [
      { name: 'Volume', color: '#10b981' },
      { name: 'CH4 Level', color: '#f59e0b' }
    ];
    return (
      <div className="dashboard-custom-legend-biogas" style={{ marginTop: '0px', marginBottom: '15px' }}>
        {legendItems.map((item, index) => (
          <div key={`item-${index}`} className="dashboard-legend-item-biogas" style={{ cursor: 'default' }}>
            <div className="dashboard-legend-color-biogas" style={{ background: item.color }}></div>{item.name}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard-wrapper">
      <Topbar />

      <div className="dashboard-content">
        
        <div className="dashboard-header">
          {/* --- BREADCRUMB --- */}
          <nav aria-label="breadcrumb" className="dashboard-breadcrumb">
            <Link to="/dashboard">
              Home
            </Link>
            
            <ChevronRight size={14} color="#94a3b8" aria-hidden="true" />
            
            <span className="current-page" aria-current="page">
              Dashboard
            </span>
          </nav>
        </div>

        {/* --- TẦNG 1 --- */}
        <div className="dashboard-row-top">
          <div className="dashboard-card-panel">
            <div className="dashboard-panel-title">Sources Status</div>
            <div className="dashboard-kpi-grid-2x2">
              <div className="dashboard-kpi-inner-card">
                <div className="dashboard-kpi-icon-box" style={{background: 'transparent', color: '#10b981'}}><Flame size={32}/></div>
                <div className="dashboard-kpi-info-box">
                  <span className="dashboard-kpi-title">Biogas Generator</span>
                  <span className="dashboard-kpi-value">120 <span>kW</span></span>
                  <span className="dashboard-kpi-rated">Total: 1.2 MWh</span>
                  <span className="dashboard-kpi-rated dashboard-muted">Rated: 150 kW</span>
                </div>
              </div>
              <div className="dashboard-kpi-inner-card">
                <div className="dashboard-kpi-icon-box" style={{background: 'transparent', color: '#f59e0b'}}><Sun size={32}/></div>
                <div className="dashboard-kpi-info-box">
                  <span className="dashboard-kpi-title">Solar Panel</span>
                  <span className="dashboard-kpi-value">80 <span>kW</span></span>
                  <span className="dashboard-kpi-rated">Total: 450 kWh</span>
                  <span className="dashboard-kpi-rated dashboard-muted">Rated: 100 kWp</span>
                </div>
              </div>
              <div className="dashboard-kpi-inner-card">
                <div className="dashboard-kpi-icon-box" style={{background: 'transparent', color: '#3b82f6'}}><Wind size={32}/></div>
                <div className="dashboard-kpi-info-box">
                  <span className="dashboard-kpi-title">Wind Turbine</span>
                  <span className="dashboard-kpi-value">45 <span>kW</span></span>
                  <span className="dashboard-kpi-rated">Total: 210 kWh</span>
                  <span className="dashboard-kpi-rated dashboard-muted">Rated: 50 kW</span>
                </div>
              </div>
              <div className="dashboard-kpi-inner-card">
                <div className="dashboard-kpi-icon-box" style={{background: 'transparent', color: '#8b5cf6'}}><Battery size={32}/></div>
                <div className="dashboard-kpi-info-box">
                  <span className="dashboard-kpi-title">BESS</span>
                  <span className="dashboard-kpi-value">95 <span>% SoC</span></span>
                  <span className="dashboard-kpi-rated">Cap: 200 kWh</span>
                  <span className="dashboard-kpi-rated dashboard-muted">State: Discharge</span>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-card-panel">
            <div className="dashboard-panel-title">Power Allocation</div>
            <div className="dashboard-donuts-container">
              
              {/* Kéo cụm PieChart 1 lên bằng marginTop */}
              <div className="dashboard-donut-box" style={{ marginTop: '-15px' }}>
                <div className="dashboard-donut-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                      <Pie data={genMixData} innerRadius={65} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none" label={renderCustomizedLabel} labelLine={false}>
                        {genMixData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                      </Pie>
                      <RechartsTooltip contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 10px 30px rgba(0,0,0,0.1)', fontWeight: 600}} formatter={(value, name) => [`${value} kW`, name]}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="dashboard-donut-center-text"><h3>{totalGen}</h3><p>Total Gen</p></div>
                </div>
                <div className="dashboard-custom-legend-biogas">
                  {genMixData.map((item, idx) => (
                    <div key={idx} className="dashboard-legend-item-biogas" style={{ cursor: 'default' }}><div className="dashboard-legend-color-biogas" style={{background: item.color}}></div> {item.name}</div>
                  ))}
                </div>
              </div>

              {/* Kéo cụm PieChart 2 lên bằng marginTop */}
              <div className="dashboard-donut-box" style={{ marginTop: '-15px' }}>
                <div className="dashboard-donut-wrapper">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                      <Pie data={loadMixData} innerRadius={65} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none" label={renderCustomizedLabel} labelLine={false}>
                        {loadMixData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                      </Pie>
                      <RechartsTooltip contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 10px 30px rgba(0,0,0,0.1)', fontWeight: 600}} formatter={(value, name) => [`${value} kW`, name]}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="dashboard-donut-center-text"><h3>{totalLoad}</h3><p>Total Load</p></div>
                </div>
                <div className="dashboard-custom-legend-biogas">
                  {loadMixData.map((item, idx) => (
                    <div key={idx} className="dashboard-legend-item-biogas" style={{ cursor: 'default' }}><div className="dashboard-legend-color-biogas" style={{background: item.color}}></div> {item.name}</div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* --- TẦNG 2 --- */}
        <div className="dashboard-row-mid">
          <div className="dashboard-card-panel" style={{padding: '0'}}>
            <div className="dashboard-panel-title" style={{padding: '24px 24px 0 24px'}}>Facility Map</div>
            <div className="dashboard-map-facility-container" style={{backgroundImage: `url(${farmLayoutImg})`, margin: '0 24px 24px 24px'}}>
              <div className="dashboard-map-overlay-dark"></div>
              <div className="dashboard-map-marker-gis dashboard-marker-biogas" style={{top: '40%', left: '30%'}}>
                <Factory size={20}/>
                <div className="dashboard-map-gis-tooltip"><h4>Biogas Plant 01</h4><p>Gen-Set 01: 120kW<br/>Status: Nominal</p></div>
              </div>
              <div className="dashboard-map-marker-gis dashboard-marker-solar" style={{top: '60%', left: '70%'}}>
                <Sun size={20}/>
                <div className="dashboard-map-gis-tooltip"><h4>Solar Array Area A</h4><p>Yield: 80kW<br/>Irradiance: 850W/m²</p></div>
              </div>
              <div className="dashboard-map-marker-gis dashboard-marker-wind" style={{top: '20%', left: '55%'}}>
                <Wind size={20}/>
                <div className="dashboard-map-gis-tooltip"><h4>Wind Turbine 1</h4><p>Output: 45kW<br/>RPM: 25</p></div>
              </div>
              <div className="dashboard-map-marker-gis dashboard-marker-bess" style={{top: '45%', left: '45%'}}>
                <Battery size={20}/>
                <div className="dashboard-map-gis-tooltip"><h4>BESS Bank</h4><p>SoC: 95%<br/>Status: Standby</p></div>
              </div>
            </div>
          </div>

          <div className="dashboard-weather-card-real">
            <div className="dashboard-weather-vertical-panel" style={{backgroundImage: `url(${currentWeatherBg})`}}>
              <div className="dashboard-weather-bg-overlay"></div> 
              <div className="dashboard-weather-header">
                <h4><MapPin size={18} color="#0ea5e9"/> {weather?.location || "Loading..."}</h4>
                <p>{formatDate(currentTime)} - {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              </div>

              {loadingWeather ? (
                <div style={{display:'flex', flex:1, alignItems:'center', justifyContent: 'center', zIndex: 2}}>
                  <Loader2 className="lucide-spin" size={32} color="#002d5b"/>
                </div>
              ) : weather ? (
                <>
                  <div className="dashboard-weather-center-display">
                    <div className="dashboard-weather-huge-icon"><WeatherIcon size={80} /></div>
                    <div className="dashboard-weather-desc-text">{weather.weather_main}</div>
                    <div className="dashboard-weather-temp-huge">{weather.temp.toFixed(1)}°C</div>
                  </div>

                  <div className="dashboard-weather-details-grid">
                    <div className="dashboard-w-detail-item">
                      <WindIcon size={20} color="#3b82f6"/>
                      <div className="dashboard-w-detail-info"><span className="dashboard-w-detail-val">{weather.wind_speed.toFixed(1)} m/s</span><span className="dashboard-w-detail-lbl">Wind</span></div>
                    </div>
                    <div className="dashboard-w-detail-item">
                      <Droplet size={20} color="#0ea5e9"/>
                      <div className="dashboard-w-detail-info"><span className="dashboard-w-detail-val">{weather.humidity}%</span><span className="dashboard-w-detail-lbl">Humidity</span></div>
                    </div>
                    <div className="dashboard-w-detail-item">
                      <CloudLightning size={20} color="#8b5cf6"/>
                      <div className="dashboard-w-detail-info"><span className="dashboard-w-detail-val">{weather.rain_1h} mm</span><span className="dashboard-w-detail-lbl">Rain/hour</span></div>
                    </div>
                    <div className="dashboard-w-detail-item">
                      <Cloud size={20} color="#94a3b8"/>
                      <div className="dashboard-w-detail-info"><span className="dashboard-w-detail-val">{weather.clouds}%</span><span className="dashboard-w-detail-lbl">Clouds</span></div>
                    </div>
                  </div>
                </>
              ) : ( 
                <div style={{display:'flex', flex:1, alignItems:'center', justifyContent: 'center', textAlign: 'center', color: '#ef4444', fontWeight: 600, zIndex: 2}}>
                  <p>Cannot fetch weather data.<br/>Check API Key or Network.</p>
                </div> 
              )}
            </div>
          </div>
        </div>

        {/* --- TẦNG 3: TREND VÀ BIOGAS --- */}
        <div className="dashboard-row-bot">
          
          <div className="dashboard-card-panel dashboard-trend-chart-panel">
            <div className="dashboard-panel-title">Power Trend</div>
            <div className="dashboard-trend-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                {/* Đã đổi BarChart và xếp chồng 2 cột */}
                <BarChart data={trendData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }} barGap={2} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} ticks={timeTicks}/> 
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                  <RechartsTooltip 
                    contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 10px 30px rgba(0,0,0,0.1)'}} 
                    formatter={(value, name) => {
                      if (value === 0 || value === "0.0") return ['0 kW', name];
                      return [`${Number(value).toFixed(1)} kW`, name];
                    }}
                    cursor={{fill: '#f1f5f9'}}
                  />
                  <Legend content={renderTrendLegend} verticalAlign="top" />
                  
                  {/* Cột Phát Điện */}
                  <Bar dataKey="bess_discharge" name="BESS Discharge" stackId="gen" fill="#8b5cf6" />
                  <Bar dataKey="wind" name="Wind" stackId="gen" fill="#3b82f6" />
                  <Bar dataKey="pv" name="Solar PV" stackId="gen" fill="#f59e0b" />
                  <Bar dataKey="biogas" name="Biogas" stackId="gen" fill="#10b981" />
                  
                  {/* Cột Tiêu Thụ */}
                  <Bar dataKey="load" name="Farm Load" stackId="load" fill="#334155" />
                  <Bar dataKey="bess_charge" name="BESS Charge" stackId="load" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="dashboard-card-panel">
            <div className="dashboard-panel-title">Biogas Fuel</div>
            <div className="dashboard-flow-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={flowData} margin={{ top: 10, right: -10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="flowColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} ticks={timeTicks}/>
                  
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} domain={['dataMin - 50', 'auto']}/>
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} domain={['auto', 'auto']} tickFormatter={(val) => `${val}%`}/>
                  
                  <RechartsTooltip 
                    contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 10px 30px rgba(0,0,0,0.1)'}} 
                    formatter={(val, name) => [name === "Volume" ? `${val} m³` : `${val}%`, name]}
                  />
                  <Legend content={renderFlowLegend} verticalAlign="top" />

                  <Area yAxisId="left" type="monotone" dataKey="volume" name="Volume" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#flowColor)" />
                  <Line yAxisId="right" type="monotone" dataKey="ch4" name="CH4 Level" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* --- TẦNG 4: ACTIVITY LOG, SCHEDULE, ALERTS --- */}
        <div className="dashboard-row-bot-3-cols">
          
          <div className="dashboard-card-panel">
            <div className="dashboard-panel-title-small">Activity Log</div>
            <div className="dashboard-info-list">
              {activityLogData.map(item => (
                <div className="dashboard-list-item" key={item.id}>
                  <div className="dashboard-item-icon" style={{background: item.bg, color: item.color}}><item.icon size={18}/></div>
                  <div className="dashboard-item-content">
                    <span className="dashboard-item-text">{item.text}</span>
                    <span className="dashboard-item-time"><Clock size={12}/> {item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-card-panel">
            <div className="dashboard-panel-title-small">Upcoming Schedule</div>
            <div className="dashboard-info-list">
              {scheduleData.map(item => (
                <div className="dashboard-list-item" key={item.id}>
                  <div className="dashboard-item-icon" style={{background: item.bg, color: item.color}}><item.icon size={18}/></div>
                  <div className="dashboard-item-content">
                    <span className="dashboard-item-text">{item.task}</span>
                    <span className="dashboard-item-time"><Clock size={12}/> {item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-card-panel">
            <div className="dashboard-panel-title-small">Recent Alerts</div>
            <div className="dashboard-info-list">
              {alertsData.map(item => (
                <div className="dashboard-list-item" key={item.id}>
                  <div className="dashboard-item-icon" style={{background: item.bg, color: item.color}}><item.icon size={18}/></div>
                  <div className="dashboard-item-content">
                    <span className="dashboard-item-text">{item.text}</span>
                    <span className="dashboard-item-time"><Clock size={12}/> {item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;