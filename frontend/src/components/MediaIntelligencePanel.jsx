import React, { useState, useEffect } from 'react';
import { FaNewspaper, FaVideo, FaTwitter, FaExclamationTriangle, 
         FaChevronDown, FaChevronRight, FaExternalLinkAlt, 
         FaThumbsUp, FaComment, FaShare, FaCheckCircle } from 'react-icons/fa';
import RiskApi from '../services/apiService';

// Mock data for testing
const MOCK_MEDIA_DATA = {
  query: {
    location: "Northern Nigeria",
    keywords: ["conflict", "Boko Haram"],
    timeframe: "Past 30 days"
  },
  updated_at: new Date().toISOString(),
  sentiment_score: -0.6,
  risk_indicators: {
    overall_risk_level: "high",
    sentiment_trend: "deteriorating",
    key_concerns: [
      "Violence against civilians", 
      "Increased militant activity", 
      "Humanitarian crisis"
    ],
    credibility_score: 0.85
  },
  news_articles: [
    {
      title: "Heightened Security Concerns Following Recent Attacks in Maiduguri",
      source: "Africa Security Review",
      publication_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Local authorities have implemented additional security measures following a series of coordinated attacks in the outskirts of Maiduguri. At least 12 civilians were reportedly affected by the incident.",
      sentiment: "negative",
      url: "https://example.com/news/1"
    },
    {
      title: "Humanitarian Organizations Respond to Growing Crisis in Northeast Region",
      source: "Global Aid Monitor",
      publication_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      description: "International aid groups have mobilized resources in response to the deteriorating situation in Nigeria's northeastern regions, with estimates suggesting over 50,000 people have been displaced in recent months.",
      sentiment: "slightly negative",
      url: "https://example.com/news/2"
    },
    {
      title: "Regional Security Summit Addresses Cross-Border Threats",
      source: "Continental Affairs",
      publication_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Leaders from neighboring countries met to discuss coordinated responses to security challenges affecting the Lake Chad Basin. The summit focused on intelligence sharing and joint operations.",
      sentiment: "neutral",
      url: "https://example.com/news/3"
    },
    {
      title: "Military Reports Strategic Gains in Northeastern Campaign",
      source: "Defense Monitor",
      publication_date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Government forces claim to have recaptured several key areas previously under militant control. Officials report the operation has disrupted supply lines used by insurgent groups.",
      sentiment: "slightly positive",
      url: "https://example.com/news/4"
    }
  ],
  video_content: [
    {
      title: "Footage Shows Aftermath of Recent Incident in Borno State",
      platform: "YouTube",
      channel: "Africa News Network",
      publication_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      url: "https://example.com/videos/1",
      thumbnail_url: "https://via.placeholder.com/320x180?text=Conflict+Scene",
      views: 245763,
      duration: "5:42",
      sentiment: "negative",
      verified: true,
      engagement: {
        likes: 12400,
        comments: 3580,
        shares: 8900
      }
    },
    {
      title: "Eyewitness Accounts from Displaced Villagers Near Maiduguri",
      platform: "Vimeo",
      channel: "Human Rights Watch",
      publication_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      url: "https://example.com/videos/2",
      thumbnail_url: "https://via.placeholder.com/320x180?text=Eyewitness+Reports",
      views: 112890,
      duration: "9:17",
      sentiment: "negative",
      verified: true,
      engagement: {
        likes: 7500,
        comments: 1340,
        shares: 5200
      }
    },
    {
      title: "Analysis: Understanding the Current Security Dynamics in Nigeria",
      platform: "YouTube",
      channel: "Conflict Studies Center",
      publication_date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      url: "https://example.com/videos/3",
      thumbnail_url: "https://via.placeholder.com/320x180?text=Security+Analysis",
      views: 87659,
      duration: "14:05",
      sentiment: "neutral",
      verified: true,
      engagement: {
        likes: 5900,
        comments: 870,
        shares: 2100
      }
    }
  ],
  social_media_trends: {
    trending_hashtags: [
      "NigeriaConflict", 
      "BornoSecurity", 
      "NortheastCrisis", 
      "MaiduguriAttack", 
      "HumanitarianAid"
    ],
    hashtag_volume: { 
      "NigeriaConflict": 75, 
      "BornoSecurity": 62, 
      "NortheastCrisis": 48, 
      "MaiduguriAttack": 41, 
      "HumanitarianAid": 29
    },
    sentiment_distribution: {
      negative: 0.65,
      neutral: 0.25,
      positive: 0.1
    },
    trending_topics: [
      "Recent attacks on villages near Maiduguri", 
      "Military response to insurgent activities",
      "Humanitarian situation in displaced persons camps",
      "International response to regional security concerns",
      "Impact on civilian population in conflict zones"
    ],
    key_influencers: [
      {
        name: "Nigeria Security Analysis",
        handle: "@NigeriaSecurity",
        followers: 245000,
        recent_post: "Our latest assessment shows concerning patterns of escalation in northeastern regions. New report available on our website. #NigeriaConflict"
      },
      {
        name: "Africa Crisis Reporter",
        handle: "@AfricaCrisis",
        followers: 187000,
        recent_post: "Breaking: New reports of incidents in villages 30km outside Maiduguri. Local sources confirming at least 15 affected. Details emerging. #BornoSecurity"
      },
      {
        name: "Humanitarian Watch",
        handle: "@HumWatch",
        followers: 163000,
        recent_post: "Our teams on the ground report critical shortages of supplies in northeastern displacement camps. Situation deteriorating rapidly. #HumanitarianAid"
      }
    ]
  },
  summary: "Media analysis for Northern Nigeria reveals heightened concern regarding security incidents in Borno State, particularly around Maiduguri. News coverage over the past month has focused on recent attacks, humanitarian challenges, and military operations. Social media sentiment is predominantly negative (65%), with trending topics centered on security incidents and humanitarian needs. Video evidence from the region corroborates reports of increased militant activity and civilian displacement."
};

export default function MediaIntelligencePanel({ hotspotId }) {
  const [mediaData, setMediaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('news'); // 'news', 'video', 'social'
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    riskIndicators: true
  });

  // Use mock data instead of API call temporarily
  useEffect(() => {
    async function fetchMediaIntelligence() {
      if (!hotspotId) return;
      
      setLoading(true);
      setError(null);
      
      // Simulate API loading
      setTimeout(() => {
        setMediaData(MOCK_MEDIA_DATA);
        setLoading(false);
      }, 1000);
      
      // Comment out API call for now
      /* 
      try {
        const response = await RiskApi.getMediaIntelligence(hotspotId);
        setMediaData(response.data);
      } catch (err) {
        console.error("Failed to fetch media intelligence:", err);
        setError(err.friendlyMessage || "Media intelligence data unavailable.");
        if (err.response?.status === 404) {
          setError("Media intelligence service is not available yet.");
        }
      } finally {
        setLoading(false);
      }
      */
    }
    
    fetchMediaIntelligence();
  }, [hotspotId]);
  
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
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
  
  // Render loading state
  if (loading) {
    return (
      <div className="bg-gray-900/95 border border-gray-800/50 rounded-lg p-4 backdrop-blur-lg animate-pulse">
        <div className="w-2/3 h-6 bg-gray-800 rounded mb-4"></div>
        <div className="space-y-2">
          <div className="w-full h-4 bg-gray-800 rounded"></div>
          <div className="w-5/6 h-4 bg-gray-800 rounded"></div>
          <div className="w-4/6 h-4 bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="bg-gray-900/95 border border-gray-800/50 rounded-lg p-4 backdrop-blur-lg">
        <div className="flex items-center text-red-500 mb-2">
          <FaExclamationTriangle className="mr-2" />
          <h3 className="text-lg font-bold">Error Loading Media Intelligence</h3>
        </div>
        <p className="text-gray-300">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }
  
  // Render no data state
  if (!mediaData) {
    return (
      <div className="bg-gray-900/95 border border-gray-800/50 rounded-lg p-4 backdrop-blur-lg">
        <p className="text-gray-400">Select a hotspot to view media intelligence</p>
      </div>
    );
  }
  
  // Main render with data
  return (
    <div className="bg-gray-900/95 border border-gray-800/50 rounded-lg overflow-hidden backdrop-blur-lg">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-1 flex items-center">
          Media Intelligence
        </h2>
        
        <div className="text-sm text-gray-400 mb-4">
          {mediaData.query?.location} • {mediaData.query?.timeframe} • Updated {formatDate(mediaData.updated_at)}
        </div>
        
        {/* Summary Section */}
        <div className="mb-4">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('summary')}
          >
            <h3 className="font-bold text-gray-300 flex items-center">
              {expandedSections.summary ? <FaChevronDown className="mr-1" /> : <FaChevronRight className="mr-1" />}
              Summary
            </h3>
            {renderSentimentBadge(mediaData.sentiment_score)}
          </div>
          
          {expandedSections.summary && (
            <div className="mt-2 text-gray-300 text-sm">
              <p>{mediaData.summary}</p>
            </div>
          )}
        </div>
        
        {/* Risk Indicators Section */}
        <div className="mb-4">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('riskIndicators')}
          >
            <h3 className="font-bold text-gray-300 flex items-center">
              {expandedSections.riskIndicators ? <FaChevronDown className="mr-1" /> : <FaChevronRight className="mr-1" />}
              Risk Indicators
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded ${
              mediaData.risk_indicators?.overall_risk_level === 'high' ? 'bg-red-600 text-white' :
              mediaData.risk_indicators?.overall_risk_level === 'medium' ? 'bg-yellow-600 text-white' :
              'bg-green-600 text-white'
            }`}>
              {mediaData.risk_indicators?.overall_risk_level?.toUpperCase() || 'UNKNOWN'} RISK
            </span>
          </div>
          
          {expandedSections.riskIndicators && mediaData.risk_indicators && (
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-800/50 p-2 rounded">
                <div className="text-xs text-gray-400">Sentiment Trend</div>
                <div className="font-medium">{mediaData.risk_indicators.sentiment_trend}</div>
              </div>
              <div className="bg-gray-800/50 p-2 rounded">
                <div className="text-xs text-gray-400">Credibility Score</div>
                <div className="font-medium">{(mediaData.risk_indicators.credibility_score * 100).toFixed(0)}%</div>
              </div>
              <div className="col-span-2 bg-gray-800/50 p-2 rounded">
                <div className="text-xs text-gray-400 mb-1">Key Concerns</div>
                <ul className="list-disc list-inside">
                  {mediaData.risk_indicators.key_concerns?.map((concern, i) => (
                    <li key={i} className="text-gray-300">{concern}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        
        {/* Content Tabs */}
        <div className="mb-3 border-b border-gray-800">
          <div className="flex">
            <button 
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'news' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
              onClick={() => setActiveTab('news')}
            >
              <FaNewspaper className="inline mr-1" />
              News Articles
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'video' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
              onClick={() => setActiveTab('video')}
            >
              <FaVideo className="inline mr-1" />
              Videos
            </button>
            <button 
              className={`px-4 py-2 text-sm font-medium ${activeTab === 'social' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
              onClick={() => setActiveTab('social')}
            >
              <FaTwitter className="inline mr-1" />
              Social Media
            </button>
          </div>
        </div>
        
        {/* News Articles Tab */}
        {activeTab === 'news' && (
          <div className="space-y-3 overflow-y-auto max-h-72">
            {mediaData.news_articles?.length > 0 ? (
              mediaData.news_articles.map((article, i) => (
                <div key={i} className="p-3 bg-gray-800/40 rounded">
                  <h4 className="font-medium mb-1 text-gray-100">{article.title}</h4>
                  <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span>{article.source}</span>
                    <span>{formatDate(article.publication_date)}</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2 line-clamp-2">{article.description}</p>
                  <div className="flex justify-between items-center">
                    {renderSentimentBadge(article.sentiment)}
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:underline flex items-center"
                    >
                      Read More <FaExternalLinkAlt className="ml-1" />
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No news articles available</p>
            )}
          </div>
        )}
        
        {/* Videos Tab */}
        {activeTab === 'video' && (
          <div className="space-y-3 overflow-y-auto max-h-72">
            {mediaData.video_content?.length > 0 ? (
              mediaData.video_content.map((video, i) => (
                <div key={i} className="p-3 bg-gray-800/40 rounded flex">
                  <div className="w-1/3 mr-3 flex-shrink-0">
                    <img 
                      src={video.thumbnail_url} 
                      alt={video.title}
                      className="w-full h-auto rounded"
                    />
                  </div>
                  <div className="w-2/3">
                    <h4 className="font-medium mb-1 text-gray-100 line-clamp-2">{video.title}</h4>
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                      <span className="flex items-center">
                        {video.channel} 
                        {video.verified && (
                          <FaCheckCircle className="ml-1 text-blue-400" title="Verified Account" />
                        )}
                      </span>
                      <span>{formatDate(video.publication_date)}</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      {video.views?.toLocaleString()} views • {video.duration}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex space-x-2 text-xs text-gray-400">
                        <span className="flex items-center"><FaThumbsUp className="mr-1" /> {video.engagement?.likes?.toLocaleString() || 0}</span>
                        <span className="flex items-center"><FaComment className="mr-1" /> {video.engagement?.comments?.toLocaleString() || 0}</span>
                        <span className="flex items-center"><FaShare className="mr-1" /> {video.engagement?.shares?.toLocaleString() || 0}</span>
                      </div>
                      <a 
                        href={video.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:underline flex items-center"
                      >
                        Watch <FaExternalLinkAlt className="ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No video content available</p>
            )}
          </div>
        )}
        
        {/* Social Media Tab */}
        {activeTab === 'social' && mediaData.social_media_trends && (
          <div className="space-y-4 overflow-y-auto max-h-72">
            {/* Trending Topics */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Trending Topics</h4>
              <div className="space-y-1">
                {mediaData.social_media_trends.trending_topics?.map((topic, i) => (
                  <div key={i} className="bg-gray-800/40 px-3 py-2 rounded text-sm">{topic}</div>
                ))}
              </div>
            </div>
            
            {/* Trending Hashtags */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Trending Hashtags</h4>
              <div className="flex flex-wrap gap-2">
                {mediaData.social_media_trends.trending_hashtags?.map((tag, i) => (
                  <div key={i} className="bg-blue-900/40 px-2 py-1 rounded text-xs">
                    #{tag}
                    {mediaData.social_media_trends.hashtag_volume?.[tag] && (
                      <span className="text-gray-400 ml-1">{mediaData.social_media_trends.hashtag_volume[tag]}K</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Key Influencers */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Key Influencers</h4>
              <div className="space-y-2">
                {mediaData.social_media_trends.key_influencers?.map((influencer, i) => (
                  <div key={i} className="bg-gray-800/40 p-3 rounded">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium text-gray-200">{influencer.name}</div>
                        <div className="text-blue-400 text-sm">{influencer.handle}</div>
                      </div>
                      <div className="text-sm text-gray-400">
                        {(influencer.followers / 1000).toFixed(0)}K followers
                      </div>
                    </div>
                    {influencer.recent_post && (
                      <div className="mt-2 text-sm text-gray-300 bg-gray-800/60 p-2 rounded">
                        "{influencer.recent_post}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Sentiment Distribution */}
            {mediaData.social_media_trends.sentiment_distribution && (
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Social Media Sentiment</h4>
                <div className="bg-gray-800/40 p-3 rounded">
                  <div className="w-full bg-gray-700 rounded-full h-2.5 mb-1">
                    <div className="flex h-2.5 rounded-full">
                      <div 
                        style={{ width: `${mediaData.social_media_trends.sentiment_distribution.negative * 100}%` }}
                        className="bg-red-600 h-2.5 rounded-l-full"
                      ></div>
                      <div 
                        style={{ width: `${mediaData.social_media_trends.sentiment_distribution.neutral * 100}%` }}
                        className="bg-gray-500 h-2.5"
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}