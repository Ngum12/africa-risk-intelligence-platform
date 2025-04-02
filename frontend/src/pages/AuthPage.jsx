import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser, FaLock, FaEnvelope, FaGlobe, FaShieldAlt,
  FaExclamationTriangle, FaSpinner, FaSignInAlt, FaUserPlus, 
  FaChartLine, FaMapMarkedAlt, FaNewspaper, FaSatellite
} from 'react-icons/fa';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentFeature, setCurrentFeature] = useState(0);
  const navigate = useNavigate();
  const starsCanvasRef = useRef(null);
  const globeRef = useRef(null);
  
  // Platform features for carousel
  const features = [
    { 
      title: "Real-time Risk Analysis", 
      description: "Monitor security incidents across African nations with advanced AI-powered risk assessment tools",
      icon: <FaChartLine className="text-yellow-400" size={24} />
    },
    { 
      title: "Geospatial Intelligence", 
      description: "Visualize conflict hotspots and track patterns with precise geographic mapping capabilities",
      icon: <FaMapMarkedAlt className="text-green-400" size={24} />
    },
    { 
      title: "Media Intelligence", 
      description: "Analyze news, social media and video content to understand regional sentiment and emerging threats",
      icon: <FaNewspaper className="text-blue-400" size={24} />
    },
    { 
      title: "Predictive Analytics", 
      description: "Forecast potential risk scenarios with machine learning models built on comprehensive historical data",
      icon: <FaSatellite className="text-purple-400" size={24} />
    },
  ];
  
  // Mock hotspots for visualization
  const hotspots = [
    { lat: 9.0820, lng: 8.6753, name: "Nigeria", intensity: 0.8, type: "conflict" },
    { lat: 9.1450, lng: 40.4897, name: "Ethiopia", intensity: 0.7, type: "political" },
    { lat: -1.9403, lng: 29.8739, name: "Rwanda", intensity: 0.4, type: "economic" },
    { lat: 26.8206, lng: 30.8025, name: "Egypt", intensity: 0.5, type: "civil_unrest" },
    { lat: 0.3476, lng: 32.5825, name: "Uganda", intensity: 0.6, type: "terror" },
    { lat: -29.8587, lng: 31.0218, name: "South Africa", intensity: 0.3, type: "protests" },
    { lat: 6.3690, lng: 34.8888, name: "Tanzania", intensity: 0.2, type: "economic" },
    { lat: 15.3872, lng: 38.9250, name: "Eritrea", intensity: 0.6, type: "conflict" },
    { lat: -1.2921, lng: 36.8219, name: "Kenya", intensity: 0.4, type: "political" },
    { lat: 17.5707, lng: 3.9962, name: "Mali", intensity: 0.7, type: "terror" }
  ];

  // Initialize stars background
  useEffect(() => {
    const createStars = () => {
      const canvas = starsCanvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      const width = canvas.width = window.innerWidth;
      const height = canvas.height = window.innerHeight;
      
      // Create stars
      const stars = [];
      const starCount = 200;
      
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.5,
          opacity: Math.random() * 0.8 + 0.2,
          speed: Math.random() * 0.05
        });
      }
      
      // Animation function
      const animate = () => {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        ctx.fillRect(0, 0, width, height);
        
        for (let i = 0; i < starCount; i++) {
          const star = stars[i];
          
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
          ctx.fill();
          
          // Twinkle effect
          star.opacity += (Math.random() * 0.1) - 0.05;
          if (star.opacity < 0.2) star.opacity = 0.2;
          if (star.opacity > 1) star.opacity = 1;
          
          // Move stars slightly
          star.x += star.speed;
          if (star.x > width) star.x = 0;
        }
        
        requestAnimationFrame(animate);
      };
      
      animate();
    };
    
    createStars();
    
    // Change feature every 5 seconds
    const featureInterval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length);
    }, 5000);
    
    // Initialize globe rotation
    const rotateGlobe = () => {
      if (!globeRef.current) return;
      
      let rotation = 0;
      const speed = 0.15;
      
      const animate = () => {
        if (!globeRef.current) return;
        
        rotation += speed;
        globeRef.current.style.transform = `rotate(${rotation}deg)`;
        
        requestAnimationFrame(animate);
      };
      
      animate();
    };
    
    rotateGlobe();
    
    // Clean up
    return () => {
      clearInterval(featureInterval);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate form
      if (isLogin) {
        if (!formData.email || !formData.password) {
          throw new Error('Please fill in all fields');
        }
      } else {
        if (!formData.email || !formData.password || !formData.confirmPassword || !formData.name) {
          throw new Error('Please fill in all fields');
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (formData.password.length < 6) {
          throw new Error('Password should be at least 6 characters');
        }
      }

      // For demo purposes, set a local storage flag to indicate authentication
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userName', formData.name || 'User');
      
      // Simulate API call delay
      await new Promise(r => setTimeout(r, 1000));

      // Redirect to dashboard
      navigate('/dashboard');
      window.location.reload(); // Force reload to update authentication state
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError(null);
  };

  return (
    <div className="relative flex flex-col md:flex-row h-screen bg-gray-900 overflow-hidden">
      {/* Stars background */}
      <canvas ref={starsCanvasRef} className="absolute inset-0 z-0" />
      
      {/* Left side with globe visualization */}
      <div className="relative w-full md:w-3/5 h-96 md:h-full overflow-hidden z-10">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Glowing particles background */}
          <div className="absolute inset-0 bg-blue-900 opacity-10 animate-pulse"></div>
          
          {/* Africa globe container with rotation */}
          <div 
            ref={globeRef}
            className="relative w-[800px] h-[800px] flex items-center justify-center"
          >
            {/* Orbit rings */}
            <div className="absolute w-full h-full border-2 border-blue-500/20 rounded-full"></div>
            <div className="absolute w-[90%] h-[90%] border border-blue-400/20 rounded-full"></div>
            <div className="absolute w-[80%] h-[80%] border border-blue-300/20 rounded-full"></div>
            
            {/* Africa map */}
            <div 
              className="w-[60%] h-[60%] bg-contain bg-center bg-no-repeat"
              style={{ 
                backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/8/86/Africa_%28orthographic_projection%29.svg')",
                filter: "drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))"
              }}
            ></div>
            
            {/* Hotspot indicators */}
            {hotspots.map((spot, i) => {
              // Convert lat/lng to position on the map
              const x = ((spot.lng + 20) / 70) * 100 - 10; // Adjust as needed
              const y = ((spot.lat + 35) / 80) * 100 - 5;  // Adjust as needed
              
              return (
                <div key={i} className="absolute">
                  <div 
                    className="w-3 h-3 rounded-full animate-ping"
                    style={{ 
                      left: `${x}%`, 
                      top: `${y}%`,
                      backgroundColor: spot.type === 'conflict' ? '#FF3A33' : 
                                      spot.type === 'political' ? '#33A1FF' : 
                                      spot.type === 'economic' ? '#33FF57' : 
                                      spot.type === 'terror' ? '#FF336A' : '#FFAA33',
                      opacity: spot.intensity,
                      animationDuration: `${3 + Math.random() * 2}s`
                    }}
                  ></div>
                  <div 
                    className="absolute text-xs text-white whitespace-nowrap"
                    style={{ 
                      left: `${x + 2}%`, 
                      top: `${y + 2}%`,
                      opacity: 0.8
                    }}
                  >
                    {spot.name}
                  </div>
                </div>
              );
            })}
            
            {/* Animated data flow lines */}
            <svg className="absolute inset-0 w-full h-full" style={{ transform: 'rotate(10deg)' }}>
              {hotspots.slice(0, 5).map((spot, i) => {
                const startX = ((spot.lng + 20) / 70) * 100;
                const startY = ((spot.lat + 35) / 80) * 100;
                const endX = 50 + (Math.random() - 0.5) * 30;
                const endY = 50 + (Math.random() - 0.5) * 30;
                
                return (
                  <g key={i}>
                    <line 
                      x1={`${startX}%`} 
                      y1={`${startY}%`} 
                      x2={`${endX}%`} 
                      y2={`${endY}%`} 
                      stroke={spot.type === 'conflict' ? '#FF3A33' : 
                             spot.type === 'political' ? '#33A1FF' : 
                             spot.type === 'economic' ? '#33FF57' : 
                             '#FFAA33'} 
                      strokeWidth="1"
                      strokeDasharray="5,5"
                      strokeOpacity="0.5"
                    >
                      <animate 
                        attributeName="stroke-dashoffset" 
                        values="0;100" 
                        dur={`${5 + i}s`} 
                        repeatCount="indefinite"
                      />
                    </line>
                    <circle 
                      cx={`${startX}%`} 
                      cy={`${startY}%`} 
                      r="2" 
                      fill="#fff"
                    />
                  </g>
                );
              })}
            </svg>
          </div>
          
          {/* Platform description */}
          <div className="absolute bottom-10 left-10 bg-black bg-opacity-50 backdrop-blur-md p-6 rounded-xl max-w-lg text-white">
            <h2 className="text-2xl font-bold flex items-center mb-3">
              <FaShieldAlt className="mr-2 text-yellow-500" />
              Africa Risk Intelligence Platform
            </h2>
            
            <div className="h-24 overflow-hidden relative">
              {features.map((feature, idx) => (
                <div 
                  key={idx}
                  className="absolute transition-all duration-500 w-full"
                  style={{ 
                    opacity: currentFeature === idx ? 1 : 0,
                    transform: `translateY(${currentFeature === idx ? 0 : 20}px)`
                  }}
                >
                  <div className="flex items-center mb-2">
                    {feature.icon}
                    <h3 className="ml-2 text-lg font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-gray-300">{feature.description}</p>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center mt-4">
              {features.map((_, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setCurrentFeature(idx)}
                  className={`mx-1 w-2 h-2 rounded-full ${
                    currentFeature === idx ? 'bg-blue-400' : 'bg-gray-600'
                  }`}
                  aria-label={`Feature ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right side with auth form */}
      <div className="w-full md:w-2/5 flex items-center justify-center p-8 z-10">
        <div className="w-full max-w-md space-y-8">
          <div>
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-900/30 rounded-full border-2 border-blue-700">
                <FaGlobe className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-center text-white">
              Welcome to ARIP
            </h1>
            <h2 className="mt-2 text-center text-xl font-bold text-gray-300">
              {isLogin ? 'Sign in to your account' : 'Create a new account'}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              Access comprehensive risk intelligence across the African continent
            </p>
          </div>

          {error && (
            <div className="bg-red-900/40 backdrop-blur-sm border border-red-800 text-red-300 px-4 py-3 rounded-lg relative">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form className="mt-8 space-y-6 backdrop-blur-sm bg-black/30 p-6 rounded-xl border border-gray-800" onSubmit={handleSubmit}>
            <div className="space-y-4 rounded-md shadow-sm">
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="sr-only">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="bg-gray-800/80 text-white appearance-none rounded-lg block w-full pl-10 px-3 py-3 border border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Full Name"
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-gray-800/80 text-white appearance-none rounded-lg block w-full pl-10 px-3 py-3 border border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Email address"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-gray-800/80 text-white appearance-none rounded-lg block w-full pl-10 px-3 py-3 border border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Password"
                  />
                </div>
              </div>
              
              {!isLogin && (
                <div>
                  <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="bg-gray-800/80 text-white appearance-none rounded-lg block w-full pl-10 px-3 py-3 border border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Confirm Password"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-900/30"
              >
                {loading ? (
                  <FaSpinner className="animate-spin h-5 w-5" />
                ) : isLogin ? (
                  <>
                    <FaSignInAlt className="mr-2" />
                    Sign in
                  </>
                ) : (
                  <>
                    <FaUserPlus className="mr-2" />
                    Sign up
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="text-center">
            <button
              onClick={toggleAuthMode}
              className="font-medium text-blue-400 hover:text-blue-300 transition-colors duration-300"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
          
          <div className="text-center text-xs text-gray-500 pt-4">
            <p>For demonstration purposes only. © 2025 Africa Risk Intelligence Platform</p>
          </div>
        </div>
      </div>
    </div>
  );
}