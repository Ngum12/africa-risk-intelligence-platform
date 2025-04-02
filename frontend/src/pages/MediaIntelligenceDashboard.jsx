import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaNewspaper, FaVideo, FaTwitter, FaExclamationTriangle, FaSearch,
  FaChevronDown, FaChevronRight, FaExternalLinkAlt, FaMap, FaChartBar,
  FaThumbsUp, FaComment, FaShare, FaCheckCircle, FaFilter, FaDownload,
  FaRegCalendarAlt, FaArrowLeft, FaEye
} from 'react-icons/fa';
import RiskApi from '../services/apiService';

// Enhanced mock data with more realistic content
const DEMO_MEDIA_DATA = {
  query: {
    location: "Northern Nigeria",
    keywords: ["conflict", "terrorism", "Boko Haram"],
    timeframe: "Past 30 days"
  },
  updated_at: new Date().toISOString(),
  sentiment_score: -0.68,
  risk_indicators: {
    overall_risk_level: "high",
    sentiment_trend: "deteriorating",
    key_concerns: [
      "Increased frequency of violent incidents", 
      "Civilian targeting patterns",
      "Expanded territorial control by non-state actors", 
      "Infrastructure degradation",
      "Humanitarian access limitations"
    ],
    credibility_score: 0.85,
    data_points: 1247,
    alerts_triggered: 8,
    change_from_previous: "+15%"
  },
  news_articles: [
    {
      title: "Multiple Casualties Reported in Market Attack in Northeast Nigeria",
      source: "Africa Security Monitor",
      publication_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      description: "A crowded market in Maiduguri was targeted in an attack that left at least 17 civilians dead and dozens injured. Security forces responded within 30 minutes, but the perpetrators had already fled the scene. This marks the third such incident in the region this month.",
      sentiment: "negative",
      url: "https://example.com/news/1",
      image_url: "https://via.placeholder.com/400x200?text=Market+Attack+Scene",
      category: "violence",
      reliability: "high"
    },
    {
      title: "UN Relief Coordinator: Humanitarian Crisis in Northeast Nigeria Reaches Critical Level",
      source: "Global Aid Network",
      publication_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      description: "United Nations officials have escalated their assessment of the humanitarian situation in Northern Nigeria to 'critical' following reports of widespread food insecurity, limited medical supplies, and restricted access to affected communities. An estimated 2.1 million people now require immediate assistance.",
      sentiment: "negative",
      url: "https://example.com/news/2",
      image_url: "https://via.placeholder.com/400x200?text=Humanitarian+Crisis",
      category: "humanitarian",
      reliability: "high"
    },
    {
      title: "Regional Security Forces Launch Coordinated Operation Against Militant Strongholds",
      source: "Continental Defense Review",
      publication_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Military forces from Nigeria, Chad, and Niger have begun a major coordinated operation targeting militant strongholds in the Lake Chad region. The operation involves air support, ground troops, and intelligence sharing agreements. Officials report the operation aims to disrupt supply chains and command structures of non-state armed groups.",
      sentiment: "neutral",
      url: "https://example.com/news/3",
      image_url: "https://via.placeholder.com/400x200?text=Military+Operation",
      category: "military",
      reliability: "medium"
    },
    {
      title: "Village Leaders Report Increased Recruitment Activity by Armed Groups in Border Areas",
      source: "Regional Security Journal",
      publication_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Community leaders from villages near the Nigeria-Niger border have reported increased recruitment efforts by non-state armed groups targeting young men and boys. Economic incentives and coercion tactics are reportedly being employed. Local authorities have requested additional security presence in vulnerable communities.",
      sentiment: "negative",
      url: "https://example.com/news/4",
      image_url: "https://via.placeholder.com/400x200?text=Border+Village",
      category: "security",
      reliability: "medium"
    },
    {
      title: "International NGOs Collaborate on New Resilience Program for Conflict-Affected Communities",
      source: "Development Initiative Report",
      publication_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      description: "A consortium of international NGOs has launched a $45 million program to strengthen resilience in communities affected by ongoing conflict in Northern Nigeria. The initiative focuses on economic opportunities, infrastructure rehabilitation, and trauma support services.",
      sentiment: "slightly positive",
      url: "https://example.com/news/5",
      image_url: "https://via.placeholder.com/400x200?text=Community+Resilience+Project",
      category: "development",
      reliability: "high"
    },
    {
      title: "Analysis: Shifting Tactics in Militant Operations Across Northern Regions",
      source: "Conflict Studies Institute",
      publication_date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Security analysts have identified significant changes in tactical approaches by militant groups operating in Nigeria's northern territories. New patterns show increased use of mobile strike cells, sophisticated IED deployment, and targeted infrastructure sabotage, suggesting adaptation to counter-insurgency measures.",
      sentiment: "slightly negative",
      url: "https://example.com/news/6",
      image_url: "https://via.placeholder.com/400x200?text=Security+Analysis",
      category: "analysis",
      reliability: "high"
    }
  ],
  video_content: [
    {
      title: "Exclusive: On the Ground Footage from Recent Attack Site in Borno State",
      platform: "YouTube",
      channel: "Africa News Network",
      publication_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      url: "https://example.com/videos/1",
      embed_code: "<iframe width='100%' height='315' src='https://www.youtube.com/embed/dQw4w9WgXcQ' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen></iframe>",
      thumbnail_url: "https://via.placeholder.com/640x360?text=Attack+Site+Footage",
      views: 1245763,
      duration: "8:42",
      sentiment: "negative",
      verified: true,
      engagement: {
        likes: 67400,
        dislikes: 3200,
        comments: 14580,
        shares: 28900
      },
      description: "Our correspondent provides exclusive access to the aftermath of the recent attack in Borno State, showing the extent of damage and speaking with survivors and local officials about the security response.",
      location_verified: true,
      content_warnings: ["graphic content", "disturbing scenes"]
    },
    {
      title: "Eyewitness Accounts: Displaced Residents Describe Fleeing from Village Attack",
      platform: "Vimeo",
      channel: "Human Rights Watch",
      publication_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      url: "https://example.com/videos/2",
      embed_code: "<iframe src='https://player.vimeo.com/video/76979871' width='100%' height='315' frameborder='0' allow='autoplay; fullscreen' allowfullscreen></iframe>",
      thumbnail_url: "https://via.placeholder.com/640x360?text=Eyewitness+Accounts",
      views: 567890,
      duration: "14:17",
      sentiment: "negative",
      verified: true,
      engagement: {
        likes: 34500,
        comments: 6340,
        shares: 18200
      },
      description: "Displaced residents from villages in Borno State share their experiences of recent attacks and their current living conditions in temporary shelters. The video highlights the humanitarian challenges they face and their needs for assistance.",
      location_verified: true
    },
    {
      title: "Analysis: Understanding Strategic Shifts in the Lake Chad Basin Conflict",
      platform: "YouTube",
      channel: "Conflict Studies Center",
      publication_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      url: "https://example.com/videos/3",
      embed_code: "<iframe width='100%' height='315' src='https://www.youtube.com/embed/dQw4w9WgXcQ' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen></iframe>",
      thumbnail_url: "https://via.placeholder.com/640x360?text=Conflict+Analysis",
      views: 287659,
      duration: "24:05",
      sentiment: "neutral",
      verified: true,
      engagement: {
        likes: 18900,
        dislikes: 870,
        comments: 3120,
        shares: 7100
      },
      description: "Expert analysis of the strategic shifts in the Lake Chad Basin conflict, examining the changing tactics of armed groups, regional security responses, and the geopolitical dynamics affecting stability across the region.",
      expert_commentary: true,
      content_tags: ["analysis", "expert", "strategy"]
    },
    {
      title: "Drone Footage Reveals Extent of Damage to Infrastructure in Northern Villages",
      platform: "YouTube", 
      channel: "GlobalWitness",
      publication_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      url: "https://example.com/videos/4",
      embed_code: "<iframe width='100%' height='315' src='https://www.youtube.com/embed/dQw4w9WgXcQ' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen></iframe>",
      thumbnail_url: "https://via.placeholder.com/640x360?text=Aerial+Infrastructure+Damage",
      views: 398271,
      duration: "6:38",
      sentiment: "negative",
      verified: true,
      engagement: {
        likes: 21700,
        dislikes: 920,
        comments: 4350,
        shares: 12800
      },
      description: "High-definition drone footage showing the extent of damage to critical infrastructure in villages across northern Nigeria, including roads, water facilities, and public buildings. The footage helps document the humanitarian impact of ongoing conflict.",
      location_verified: true,
      content_tags: ["drone", "infrastructure", "damage assessment"]
    }
  ],
  social_media_trends: {
    trending_hashtags: [
      "NigeriaAttack", 
      "BornoSecurity", 
      "NortheastCrisis", 
      "MaiduguriAttack", 
      "HumanitarianAidNow",
      "LakeChad",
      "AfricaConflict"
    ],
    hashtag_volume: { 
      "NigeriaAttack": 182, 
      "BornoSecurity": 155, 
      "NortheastCrisis": 127, 
      "MaiduguriAttack": 93, 
      "HumanitarianAidNow": 78,
      "LakeChad": 64,
      "AfricaConflict": 52
    },
    sentiment_distribution: {
      negative: 0.68,
      neutral: 0.22,
      positive: 0.10
    },
    engagement_metrics: {
      total_mentions: 463200,
      unique_users: 87500,
      peak_activity: "2023-09-14T15:00:00Z",
      geographic_hotspots: ["Lagos", "Abuja", "London", "New York", "Nairobi"]
    },
    trending_topics: [
      "Market attack casualties and response", 
      "Regional military cooperation against militants",
      "Humanitarian access restrictions in conflict zones",
      "Civilian displacement and refugee conditions",
      "Infrastructure damage in northern villages",
      "International aid coordination efforts",
      "Security force operations in border areas"
    ],
    viral_content: [
      {
        type: "video",
        platform: "Twitter",
        description: "Survivor interview from market attack",
        views: 1.8,
        shares: 45600,
        url: "https://example.com/viral1"
      },
      {
        type: "image",
        platform: "Instagram",
        description: "Aid distribution at displacement camp",
        likes: 278900,
        shares: 32400,
        url: "https://example.com/viral2"
      }
    ],
    key_influencers: [
      {
        name: "Nigeria Security Analysis",
        handle: "@NigeriaSecurity",
        followers: 245000,
        recent_post: "Our latest assessment shows concerning patterns of escalation in northeastern regions with 3 major incidents in the past 14 days. Full security briefing available on our website. #NigeriaAttack #BornoSecurity",
        influence_score: 87,
        verified: true,
        platform: "Twitter"
      },
      {
        name: "Africa Crisis Reporter",
        handle: "@AfricaCrisis",
        followers: 187000,
        recent_post: "BREAKING: New reports of a significant incident at a market 15km outside Maiduguri. Local sources confirming multiple casualties. Security forces responding. Details emerging. #MaiduguriAttack #BornoSecurity",
        influence_score: 82,
        verified: true,
        platform: "Twitter"
      },
      {
        name: "Humanitarian Watch",
        handle: "@HumWatch",
        followers: 163000,
        recent_post: "Our teams on the ground report critical shortages of supplies in northeastern displacement camps. Access routes compromised by security concerns. International response urgently needed. #HumanitarianAidNow #NortheastCrisis",
        influence_score: 78,
        verified: true,
        platform: "Twitter"
      },
      {
        name: "Dr. Amina Osei",
        handle: "@DrAminaOsei",
        followers: 134000,
        recent_post: "The strategic shift in militant tactics in the Lake Chad Basin represents a concerning adaptation to counter-insurgency efforts. Thread on what this means for regional security: 1/12",
        influence_score: 85,
        verified: true,
        platform: "Twitter",
        expertise: "Security Studies"
      }
    ],
    narrative_analysis: {
      dominant_narratives: [
        "Security forces struggling to contain violence",
        "Humanitarian situation rapidly deteriorating",
        "Regional cooperation showing limited results",
        "Civilian populations increasingly vulnerable"
      ],
      emerging_narratives: [
        "New militant recruitment strategies targeting youth",
        "Economic impact spreading to neighboring countries",
        "Environmental factors exacerbating conflict dynamics"
      ],
      counter_narratives: [
        "Military gains in strategic territories",
        "Successful community resilience initiatives"
      ]
    }
  },
  media_source_analysis: {
    total_sources: 187,
    source_types: {
      "International Media": 42,
      "Regional Media": 63,
      "Local Media": 55,
      "Government": 15,
      "NGO Reports": 12
    },
    reliability_distribution: {
      "High": 0.45,
      "Medium": 0.38,
      "Low": 0.17
    },
    geographic_coverage: {
      "Urban Centers": 0.65,
      "Rural Areas": 0.25,
      "Border Regions": 0.10
    },
    information_gaps: [
      "Limited reporting from western border areas",
      "Minimal coverage of specific vulnerable groups",
      "Few sources with direct militant group access"
    ]
  },
  summary: "Media analysis for Northern Nigeria reveals a rapidly deteriorating security situation, with a significant attack on a market in Maiduguri being the focal point of recent coverage. News reporting shows increasing frequency of violent incidents, particularly targeting civilian gatherings. Security forces have launched coordinated operations with neighboring countries, but impact remains limited. Social media sentiment is overwhelmingly negative (68%), with trending topics centered on casualties, humanitarian needs, and military response. Video evidence confirms infrastructure damage, civilian displacement, and limited humanitarian access. The narrative analysis suggests growing concern about new militant tactics, including targeted recruitment and strategic shifts in operational patterns. Information gaps persist regarding conditions in western border areas and specific impacts on vulnerable populations."
};

export default function MediaIntelligenceDashboard() {
  const { hotspotId } = useParams();
  const navigate = useNavigate();
  const [mediaData, setMediaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'news', 'video', 'social', 'analysis'
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: '30days',
    sourceTypes: ['all'],
    sentimentFilter: 'all',
    reliabilityFilter: 'all'
  });
  
  // Use demo data
  useEffect(() => {
    async function fetchMediaIntelligence() {
      setLoading(true);
      setError(null);
      
      // Simulate API loading
      setTimeout(() => {
        setMediaData(DEMO_MEDIA_DATA);
        setLoading(false);
      }, 1500);
      
      // Real API call (commented out for now)
      /*
      try {
        const response = await RiskApi.getMediaIntelligence(hotspotId);
        setMediaData(response.data);
      } catch (err) {
        console.error("Failed to fetch media intelligence:", err);
        setError(err.friendlyMessage || "Media intelligence data unavailable.");
      } finally {
        setLoading(false);
      }
      */
    }
    
    fetchMediaIntelligence();
  }, [hotspotId]);
  
  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', { 
        year: 'numeric',
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };
  
  // Format relative time (e.g., "2 days ago")
  const formatRelativeTime = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (diffDays > 0) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      } else {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      }
    } catch (e) {
      return "Unknown time";
    }
  };
  
  // Render sentiment badge with appropriate color
  const renderSentimentBadge = (sentiment) => {
    if (!sentiment) return null;
    
    let color = "bg-gray-600"; // default
    let textColor = "text-white";
    
    if (typeof sentiment === 'string') {
      // Text sentiment
      if (sentiment.includes('negative')) {
        color = "bg-red-600";
      } else if (sentiment.includes('positive')) {
        color = "bg-green-600";
      } else {
        color = "bg-blue-600";
      }
    } else {
      // Numeric sentiment (-1 to 1)
      if (sentiment < -0.3) {
        color = "bg-red-600";
      } else if (sentiment > 0.3) {
        color = "bg-green-600";
      } else {
        color = "bg-blue-600";
      }
    }
    
    return (
      <span className={`${color} ${textColor} text-xs px-2 py-0.5 rounded`}>
        {typeof sentiment === 'string' ? sentiment : 
          sentiment < -0.3 ? 'Negative' : 
          sentiment > 0.3 ? 'Positive' : 'Neutral'}
      </span>
    );
  };
  
  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };
  
  // Download data as JSON
  const downloadData = () => {
    if (!mediaData) return;
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mediaData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `media_intelligence_${mediaData.query.location}_${new Date().toISOString()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-lg animate-pulse">
            <div className="w-60 h-8 bg-gray-700 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-2">
                <div className="h-60 bg-gray-700 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="w-full h-4 bg-gray-700 rounded"></div>
                  <div className="w-5/6 h-4 bg-gray-700 rounded"></div>
                  <div className="w-4/6 h-4 bg-gray-700 rounded"></div>
                </div>
              </div>
              <div>
                <div className="h-40 bg-gray-700 rounded mb-4"></div>
                <div className="h-20 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 backdrop-blur-lg">
            <div className="flex items-center text-red-500 mb-4">
              <FaExclamationTriangle className="text-2xl mr-3" />
              <h1 className="text-2xl font-bold">Error Loading Media Intelligence</h1>
            </div>
            <p className="text-gray-300 text-lg mb-4">{error}</p>
            <div className="flex space-x-4">
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
              >
                <FaSearch className="mr-2" /> Retry
              </button>
              <button 
                onClick={() => navigate(-1)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center"
              >
                <FaArrowLeft className="mr-2" /> Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render no data state
  if (!mediaData) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 backdrop-blur-lg">
            <h1 className="text-2xl font-bold mb-4">Media Intelligence</h1>
            <p className="text-gray-400 text-lg mb-6">No media intelligence data available for this location.</p>
            <button 
              onClick={() => navigate(-1)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center"
            >
              <FaArrowLeft className="mr-2" /> Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Main render with data
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center mb-3">
            <button 
              onClick={() => navigate(-1)} 
              className="mr-4 text-gray-300 hover:text-white"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <h1 className="text-3xl font-bold">Media Intelligence Dashboard</h1>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <div className="text-xl font-medium text-blue-200">
                {mediaData.query?.location}
              </div>
              <div className="text-sm text-gray-300">
                {mediaData.query?.timeframe} • Updated {formatDate(mediaData.updated_at)}
              </div>
            </div>
            
            <div className="mt-3 md:mt-0 flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-full font-medium flex items-center ${
                mediaData.risk_indicators?.overall_risk_level === 'high' ? 'bg-red-600 text-white' :
                mediaData.risk_indicators?.overall_risk_level === 'medium' ? 'bg-yellow-600 text-white' :
                'bg-green-600 text-white'
              }`}>
                {mediaData.risk_indicators?.overall_risk_level?.toUpperCase() || 'UNKNOWN'} RISK
              </div>
              
              <button 
                onClick={() => setFilterVisible(!filterVisible)}
                className="bg-blue-800 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center"
              >
                <FaFilter className="mr-2" /> Filters
              </button>
              
              <button 
                onClick={downloadData}
                className="bg-purple-800 hover:bg-purple-700 text-white px-3 py-1 rounded flex items-center"
              >
                <FaDownload className="mr-2" /> Export
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters panel */}
      {filterVisible && (
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Time Period</label>
                <select 
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                >
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                  <option value="90days">Last 90 days</option>
                  <option value="custom">Custom range...</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Source Types</label>
                <select 
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                  value={filters.sourceTypes}
                  onChange={(e) => handleFilterChange('sourceTypes', Array.from(e.target.selectedOptions, option => option.value))}
                  multiple
                >
                  <option value="all">All Sources</option>
                  <option value="international">International Media</option>
                  <option value="regional">Regional Media</option>
                  <option value="local">Local Media</option>
                  <option value="social">Social Media</option>
                  <option value="ngo">NGO Reports</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Sentiment</label>
                <select 
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                  value={filters.sentimentFilter}
                  onChange={(e) => handleFilterChange('sentimentFilter', e.target.value)}
                >
                  <option value="all">All Sentiment</option>
                  <option value="positive">Positive Only</option>
                  <option value="neutral">Neutral Only</option>
                  <option value="negative">Negative Only</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Reliability</label>
                <select 
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                  value={filters.reliabilityFilter}
                  onChange={(e) => handleFilterChange('reliabilityFilter', e.target.value)}
                >
                  <option value="all">All Sources</option>
                  <option value="high">High Reliability Only</option>
                  <option value="medium">Medium+ Reliability</option>
                  <option value="verified">Verified Only</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end mt-3">
              <button 
                onClick={() => setFilters({
                  dateRange: '30days',
                  sourceTypes: ['all'],
                  sentimentFilter: 'all',
                  reliabilityFilter: 'all'
                })}
                className="text-sm text-gray-400 hover:text-white mr-4"
              >
                Reset Filters
              </button>
              <button 
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1 text-sm rounded"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Content Tabs */}
      <div className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto hide-scrollbar">
            <button 
              className={`px-4 py-3 text-sm font-medium border-b-2 min-w-max ${activeTab === 'overview' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
              onClick={() => setActiveTab('overview')}
            >
              <FaChartBar className="inline mr-1" />
              Overview
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium border-b-2 min-w-max ${activeTab === 'news' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
              onClick={() => setActiveTab('news')}
            >
              <FaNewspaper className="inline mr-1" />
              News Articles
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium border-b-2 min-w-max ${activeTab === 'video' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
              onClick={() => setActiveTab('video')}
            >
              <FaVideo className="inline mr-1" />
              Video Content
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium border-b-2 min-w-max ${activeTab === 'social' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
              onClick={() => setActiveTab('social')}
            >
              <FaTwitter className="inline mr-1" />
              Social Media Analysis
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium border-b-2 min-w-max ${activeTab === 'sources' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
              onClick={() => setActiveTab('sources')}
            >
              <FaSearch className="inline mr-1" />
              Source Analysis
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - larger content */}
            <div className="col-span-2 space-y-6">
              {/* Summary */}
              <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
                <h2 className="text-xl font-bold mb-3">Intelligence Summary</h2>
                <p className="text-gray-300 leading-relaxed mb-3">
                  {mediaData.summary}
                </p>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-gray-700/60 p-3 rounded-lg">
                    <div className="text-xs text-gray-400">Sources Analyzed</div>
                    <div className="text-xl font-semibold">{mediaData.media_source_analysis?.total_sources || 'N/A'}</div>
                  </div>
                  <div className="bg-gray-700/60 p-3 rounded-lg">
                    <div className="text-xs text-gray-400">Data Points</div>
                    <div className="text-xl font-semibold">{mediaData.risk_indicators?.data_points?.toLocaleString() || 'N/A'}</div>
                  </div>
                  <div className="bg-gray-700/60 p-3 rounded-lg">
                    <div className="text-xs text-gray-400">Risk Change</div>
                    <div className={`text-xl font-semibold ${mediaData.risk_indicators?.change_from_previous?.includes('+') ? 'text-red-400' : 'text-green-400'}`}>
                      {mediaData.risk_indicators?.change_from_previous || 'N/A'}
                    </div>
                  </div>
                  <div className="bg-gray-700/60 p-3 rounded-lg">
                    <div className="text-xs text-gray-400">Alerts Triggered</div>
                    <div className="text-xl font-semibold">{mediaData.risk_indicators?.alerts_triggered || '0'}</div>
                  </div>
                </div>
              </div>
              
              {/* Recent News */}
              <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Recent News</h2>
                  <button 
                    onClick={() => setActiveTab('news')}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    View All &rarr;
                  </button>
                </div>
                <div className="space-y-4">
                  {mediaData.news_articles?.slice(0, 3).map((article, i) => (
                    <div key={i} className="flex bg-gray-700/40 rounded overflow-hidden">
                      {article.image_url && (
                        <div className="w-1/4 flex-shrink-0">
                          <img 
                            src={article.image_url} 
                            alt={article.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className={article.image_url ? "w-3/4 p-3" : "w-full p-3"}>
                        <h4 className="font-medium text-gray-100 mb-1">{article.title}</h4>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>{article.source}</span>
                          <span>{formatRelativeTime(article.publication_date)}</span>
                        </div>
                        <p className="text-sm text-gray-300 line-clamp-2 mb-2">{article.description}</p>
                        <div className="flex items-center justify-between">
                          {renderSentimentBadge(article.sentiment)}
                          {article.reliability && (
                            <span className="text-xs text-gray-400">
                              {article.reliability} reliability
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Featured Video */}
              {mediaData.video_content?.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Featured Video</h2>
                    <button 
                      onClick={() => setActiveTab('video')}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      View All &rarr;
                    </button>
                  </div>
                  <div className="bg-gray-900 rounded-lg overflow-hidden">
                    <div className="aspect-w-16 aspect-h-9">
                      <div dangerouslySetInnerHTML={{ __html: mediaData.video_content[0].embed_code }} />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-lg mb-1">{mediaData.video_content[0].title}</h3>
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span className="flex items-center">
                          {mediaData.video_content[0].channel}
                          {mediaData.video_content[0].verified && (
                            <FaCheckCircle className="ml-1 text-blue-400" title="Verified Account" />
                          )}
                        </span>
                        <span>{formatRelativeTime(mediaData.video_content[0].publication_date)}</span>
                      </div>
                      <p className="text-sm text-gray-300 mb-3">
                        {mediaData.video_content[0].description}
                      </p>
                      <div className="flex space-x-4 text-sm text-gray-400">
                        <span className="flex items-center"><FaEye className="mr-1" /> {mediaData.video_content[0].views?.toLocaleString()}</span>
                        <span className="flex items-center"><FaThumbsUp className="mr-1" /> {mediaData.video_content[0].engagement?.likes?.toLocaleString()}</span>
                        <span className="flex items-center"><FaComment className="mr-1" /> {mediaData.video_content[0].engagement?.comments?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Right column - sidebar content */}
            <div className="space-y-6">
              {/* Risk Indicators */}
              <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
                <h2 className="text-xl font-bold mb-3">Risk Indicators</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Overall Risk Level:</span>
                    <span className={`text-sm font-medium px-2 py-0.5 rounded ${
                      mediaData.risk_indicators?.overall_risk_level === 'high' ? 'bg-red-600 text-white' :
                      mediaData.risk_indicators?.overall_risk_level === 'medium' ? 'bg-yellow-600 text-white' :
                      'bg-green-600 text-white'
                    }`}>
                      {mediaData.risk_indicators?.overall_risk_level?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sentiment Trend:</span>
                    <span className="text-sm">{mediaData.risk_indicators?.sentiment_trend}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Credibility Score:</span>
                    <span className="text-sm">{(mediaData.risk_indicators?.credibility_score * 100).toFixed(0)}%</span>
                  </div>
                  <div className="pt-2">
                    <div className="text-sm font-medium mb-2">Key Concerns:</div>
                    <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                      {mediaData.risk_indicators?.key_concerns?.map((concern, i) => (
                        <li key={i}>{concern}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Sentiment Analysis */}
              <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
                <h2 className="text-xl font-bold mb-3">Media Sentiment</h2>
                <div className="mb-4">
                  <div className="text-sm font-medium mb-2">Overall Sentiment Score:</div>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-600 rounded-full h-4">
                      <div 
                        className={`h-4 rounded-full ${
                          mediaData.sentiment_score < -0.3 ? 'bg-red-600' : 
                          mediaData.sentiment_score > 0.3 ? 'bg-green-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${50 + (mediaData.sentiment_score * 50)}%` }}
                      ></div>
                    </div>
                    <span className="ml-3 text-lg font-bold">
                      {mediaData.sentiment_score.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>-1.0</span>
                    <span>0</span>
                    <span>+1.0</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-2">Social Media Sentiment:</div>
                  <div className="w-full bg-gray-600 rounded-full h-2.5 mb-1">
                    <div className="flex h-2.5 rounded-full">
                      <div 
                        style={{ width: `${mediaData.social_media_trends.sentiment_distribution.negative * 100}%` }}
                        className="bg-red-600 h-2.5 rounded-l-full"
                      ></div>
                      <div 
                        style={{ width: `${mediaData.social_media_trends.sentiment_distribution.neutral * 100}%` }}
                        className="bg-gray-400 h-2.5"
                      ></div>
                      <div 
                        style={{ width: `${mediaData.social_media_trends.sentiment_distribution.positive * 100}%` }}
                        className="bg-green-600 h-2.5 rounded-r-full"
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Negative ({(mediaData.social_media_trends.sentiment_distribution.negative * 100).toFixed(0)}%)</span>
                    <span>Neutral ({(mediaData.social_media_trends.sentiment_distribution.neutral * 100).toFixed(0)}%)</span>
                    <span>Positive ({(mediaData.social_media_trends.sentiment_distribution.positive * 100).toFixed(0)}%)</span>
                  </div>
                </div>
              </div>
              
              {/* Trending Hashtags */}
              <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
                <h2 className="text-xl font-bold mb-3">Trending Hashtags</h2>
                <div className="flex flex-wrap gap-2">
                  {mediaData.social_media_trends.trending_hashtags?.map((tag, i) => (
                    <div key={i} className="bg-blue-900/40 px-2 py-1 rounded text-sm flex items-center">
                      #{tag}
                      {mediaData.social_media_trends.hashtag_volume?.[tag] && (
                        <span className="text-xs bg-blue-700 rounded-full px-2 py-0.5 ml-2">{mediaData.social_media_trends.hashtag_volume[tag]}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Key Influencer */}
              {mediaData.social_media_trends.key_influencers?.[0] && (
                <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-xl font-bold">Key Influencer</h2>
                    <button 
                      onClick={() => setActiveTab('social')}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      View All &rarr;
                    </button>
                  </div>
                  <div className="bg-gray-700/40 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <div>
                        <div className="font-medium">{mediaData.social_media_trends.key_influencers[0].name}</div>
                        <div className="text-blue-400 text-sm">{mediaData.social_media_trends.key_influencers[0].handle}</div>
                      </div>
                      {mediaData.social_media_trends.key_influencers[0].verified && (
                        <FaCheckCircle className="text-blue-400" title="Verified Account" />
                      )}
                    </div>
                    <div className="text-sm text-gray-400 mb-2">
                      {mediaData.social_media_trends.key_influencers[0].followers?.toLocaleString()} followers
                      {mediaData.social_media_trends.key_influencers[0].influence_score && 
                        ` • Influence: ${mediaData.social_media_trends.key_influencers[0].influence_score}/100`
                      }
                    </div>
                    <div className="bg-gray-800/80 p-3 rounded-lg text-sm">
                      "{mediaData.social_media_trends.key_influencers[0].recent_post}"
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* News Tab */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mediaData.news_articles?.map((article, i) => (
                <div key={i} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                  {article.image_url && (
                    <img 
                      src={article.image_url} 
                      alt={article.title} 
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{article.title}</h3>
                    <div className="flex justify-between text-sm text-gray-400 mb-3">
                      <span>{article.source}</span>
                      <span>{formatDate(article.publication_date)}</span>
                    </div>
                    <p className="text-gray-300 mb-4">{article.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        {renderSentimentBadge(article.sentiment)}
                        {article.category && (
                          <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded">
                            {article.category}
                          </span>
                        )}
                      </div>
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center"
                      >
                        Read More <FaExternalLinkAlt className="ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Video Tab */}
        {activeTab === 'video' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mediaData.video_content?.map((video, i) => (
              <div key={i} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                <div className="aspect-w-16 aspect-h-9">
                  <div dangerouslySetInnerHTML={{ __html: video.embed_code }} />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{video.title}</h3>
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span className="flex items-center">
                      {video.channel}
                      {video.verified && (
                        <FaCheckCircle className="ml-1 text-blue-400" title="Verified Channel" />
                      )}
                    </span>
                    <span>{formatDate(video.publication_date)}</span>
                  </div>
                  <p className="text-gray-300 mb-4">{video.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {video.content_tags?.map((tag, i) => (
                      <span key={i} className="bg-gray-700 text-xs px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                    {video.location_verified && (
                      <span className="bg-green-900/60 text-green-300 text-xs px-2 py-0.5 rounded flex items-center">
                        <FaMap className="mr-1" /> Location verified
                      </span>
                    )}
                    {video.expert_commentary && (
                      <span className="bg-blue-900/60 text-blue-300 text-xs px-2 py-0.5 rounded">
                        Expert commentary
                      </span>
                    )}
                    {video.content_warnings?.map((warning, i) => (
                      <span key={i} className="bg-red-900/60 text-red-300 text-xs px-2 py-0.5 rounded">
                        {warning}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-4 text-sm text-gray-400">
                      <span className="flex items-center"><FaEye className="mr-1" /> {video.views?.toLocaleString()}</span>
                      <span className="flex items-center"><FaThumbsUp className="mr-1" /> {video.engagement?.likes?.toLocaleString()}</span>
                      <span className="flex items-center"><FaComment className="mr-1" /> {video.engagement?.comments?.toLocaleString()}</span>
                      <span className="flex items-center"><FaRegCalendarAlt className="mr-1" /> {video.duration}</span>
                    </div>
                    <a 
                      href={video.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center"
                    >
                      Watch Full Video <FaExternalLinkAlt className="ml-1" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Social Media Tab */}
        {activeTab === 'social' && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Narrative Analysis */}
                <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
                  <h2 className="text-xl font-bold mb-3">Narrative Analysis</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-700/40 p-4 rounded-lg">
                      <h3 className="text-blue-400 font-medium mb-2">Dominant Narratives</h3>
                      <ul className="space-y-2 text-sm text-gray-300">
                        {mediaData.social_media_trends.narrative_analysis?.dominant_narratives.map((narrative, i) => (
                          <li key={i} className="flex items-start">
                            <span className="inline-block w-5 text-center mr-2">•</span>
                            <span>{narrative}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-gray-700/40 p-4 rounded-lg">
                      <h3 className="text-yellow-400 font-medium mb-2">Emerging Narratives</h3>
                      <ul className="space-y-2 text-sm text-gray-300">
                        {mediaData.social_media_trends.narrative_analysis?.emerging_narratives.map((narrative, i) => (
                          <li key={i} className="flex items-start">
                            <span className="inline-block w-5 text-center mr-2">•</span>
                            <span>{narrative}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-gray-700/40 p-4 rounded-lg">
                      <h3 className="text-green-400 font-medium mb-2">Counter Narratives</h3>
                      <ul className="space-y-2 text-sm text-gray-300">
                        {mediaData.social_media_trends.narrative_analysis?.counter_narratives.map((narrative, i) => (
                          <li key={i} className="flex items-start">
                            <span className="inline-block w-5 text-center mr-2">•</span>
                            <span>{narrative}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Trending Topics */}
                <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
                  <h2 className="text-xl font-bold mb-3">Trending Topics</h2>
                  <div className="space-y-2">
                    {mediaData.social_media_trends.trending_topics?.map((topic, i) => (
                      <div key={i} className="bg-gray-700/40 px-4 py-3 rounded-lg flex justify-between items-center">
                        <span>{topic}</span>
                        <div className="bg-gray-600 h-1.5 w-24 rounded-full overflow-hidden">
                          <div 
                            className="bg-blue-500 h-full" 
                            style={{ width: `${100 - (i * 10)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Key Influencers */}
                <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
                  <h2 className="text-xl font-bold mb-3">Key Influencers</h2>
                  <div className="space-y-4">
                    {mediaData.social_media_trends.key_influencers?.map((influencer, i) => (
                      <div key={i} className="bg-gray-700/40 p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <div>
                            <div className="font-medium text-lg">{influencer.name}</div>
                            <div className="text-blue-400">{influencer.handle}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-400">{influencer.followers?.toLocaleString()} followers</div>
                            {influencer.expertise && (
                              <div className="bg-purple-900/60 text-purple-300 text-xs px-2 py-0.5 rounded mt-1">
                                {influencer.expertise}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="bg-gray-800/80 p-3 rounded-lg text-sm text-gray-300 mb-2">
                          "{influencer.recent_post}"
                        </div>
                        <div className="flex justify-between text-sm">
                          <div className="text-gray-400">Platform: {influencer.platform}</div>
                          {influencer.influence_score && (
                            <div className="flex items-center">
                              <span className="text-gray-400 mr-2">Influence Score:</span>
                              <div className="w-24 bg-gray-600 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-blue-500 h-full" 
                                  style={{ width: `${influencer.influence_score}%` }}
                                ></div>
                              </div>
                              <span className="ml-2 text-gray-300">{influencer.influence_score}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Right column */}
              <div className="space-y-6">
                {/* Social Media Sentiment */}
                <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
                  <h2 className="text-lg font-bold mb-3">Sentiment Distribution</h2>
                  <div className="mb-5">
                    <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                      <div className="flex h-3 rounded-full">
                        <div 
                          style={{ width: `${mediaData.social_media_trends.sentiment_distribution.negative * 100}%` }}
                          className="bg-red-600 h-3 rounded-l-full"
                        ></div>
                        <div 
                          style={{ width: `${mediaData.social_media_trends.sentiment_distribution.neutral * 100}%` }}
                          className="bg-gray-400 h-3"
                        ></div>
                        <div 
                          style={{ width: `${mediaData.social_media_trends.sentiment_distribution.positive * 100}%` }}
                          className="bg-green-600 h-3 rounded-r-full"
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Negative ({(mediaData.social_media_trends.sentiment_distribution.negative * 100).toFixed(0)}%)</span>
                      <span>Neutral ({(mediaData.social_media_trends.sentiment_distribution.neutral * 100).toFixed(0)}%)</span>
                      <span>Positive ({(mediaData.social_media_trends.sentiment_distribution.positive * 100).toFixed(0)}%)</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Mentions:</span>
                      <span className="text-sm font-medium">{mediaData.social_media_trends.engagement_metrics?.total_mentions?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Unique Users:</span>
                      <span className="text-sm font-medium">{mediaData.social_media_trends.engagement_metrics?.unique_users?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Peak Activity:</span>
                      <span className="text-sm font-medium">{formatDate(mediaData.social_media_trends.engagement_metrics?.peak_activity)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Geographic Hotspots */}
                <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
                  <h2 className="text-lg font-bold mb-3">Geographic Hotspots</h2>
                  <div className="space-y-2">
                    {mediaData.social_media_trends.engagement_metrics?.geographic_hotspots?.map((location, i) => (
                      <div key={i} className="bg-gray-700/40 px-4 py-2 rounded-lg flex justify-between items-center">
                        <span>{location}</span>
                        <div className="bg-gray-600 h-1.5 w-24 rounded-full overflow-hidden">
                          <div 
                            className="bg-blue-500 h-full" 
                            style={{ width: `${100 - (i * 10)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Social Media Tab - Source Analysis */}
        {activeTab === 'sources' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Source Types Distribution */}
            <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
              <h2 className="text-xl font-bold mb-3">Source Types</h2>
              <div className="space-y-3">
                {Object.entries(mediaData.media_source_analysis?.source_types || {}).map(([source, count], i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{source}</span>
                      <span>{count}</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(count / mediaData.media_source_analysis.total_sources) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Reliability Distribution */}
            <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
              <h2 className="text-xl font-bold mb-3">Source Reliability</h2>
              <div className="flex h-40 items-end justify-around">
                {Object.entries(mediaData.media_source_analysis?.reliability_distribution || {}).map(([level, value], i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="text-sm mb-2">{(value * 100).toFixed(0)}%</div>
                    <div 
                      className={`w-16 ${
                        level === 'High' ? 'bg-green-600' : 
                        level === 'Medium' ? 'bg-yellow-600' : 
                        'bg-red-600'
                      } rounded-t-lg`}
                      style={{ height: `${value * 150}px` }}
                    ></div>
                    <div className="text-sm mt-2">{level}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Geographic Coverage */}
            <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
              <h2 className="text-xl font-bold mb-3">Geographic Coverage</h2>
              <div className="space-y-3">
                {Object.entries(mediaData.media_source_analysis?.geographic_coverage || {}).map(([area, value], i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{area}</span>
                      <span>{(value * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${value * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Information Gaps */}
            <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
              <h2 className="text-xl font-bold mb-3">Information Gaps</h2>
              <ul className="space-y-2">
                {mediaData.media_source_analysis?.information_gaps?.map((gap, i) => (
                  <li key={i} className="flex items-start">
                    <FaExclamationTriangle className="text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-300">{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}