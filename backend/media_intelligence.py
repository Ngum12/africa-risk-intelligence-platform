try:
    import requests
except ImportError:
    # Fallback if requests is not installed
    requests = None
    print("WARNING: requests module not installed. Using mock data only.")

import os
import re
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import random  # For demo purposes only

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MediaIntelligenceService:
    """Service for collecting and analyzing media intelligence data from various sources."""
    
    def __init__(self, cache_dir: str = "media_cache"):
        """Initialize the media intelligence service."""
        self.cache_dir = cache_dir
        os.makedirs(cache_dir, exist_ok=True)
        
        # API keys would normally be in environment variables
        self.news_api_key = os.getenv("NEWS_API_KEY", "demo_key")
        self.youtube_api_key = os.getenv("YOUTUBE_API_KEY", "demo_key")
        self.twitter_api_key = os.getenv("TWITTER_API_KEY", "demo_key")
        
        # Flag to determine if we can make real API calls
        self.can_make_api_calls = requests is not None
        
    def get_media_intelligence(self, 
                               location: str,
                               keywords: List[str] = None, 
                               days_back: int = 30,
                               max_results: int = 20) -> Dict[str, Any]:
        """
        Get media intelligence data for a specific location and keywords.
        
        Args:
            location: Country or region name
            keywords: List of keywords to search for (e.g., actors, event types)
            days_back: How many days back to search
            max_results: Maximum number of results to return
            
        Returns:
            Dictionary of media intelligence data
        """
        if keywords is None:
            keywords = []
            
        # Create a cache key based on parameters
        cache_key = f"{location}_{'-'.join(keywords)}_{days_back}"
        cache_file = os.path.join(self.cache_dir, re.sub(r'[^\w]', '_', cache_key) + ".json")        
        # Check if we have cached data that's less than 6 hours old
        if os.path.exists(cache_file):
            file_age = datetime.now() - datetime.fromtimestamp(os.path.getmtime(cache_file))
            if file_age < timedelta(hours=6):
                try:
                    with open(cache_file, 'r') as f:
                        cached_data = json.load(f)
                        logger.info(f"Using cached media data for {cache_key}")
                        return cached_data
                except Exception as e:
                    logger.error(f"Error reading cache file: {e}")
        
        # Always use demo data since this is a prototype
        intelligence_data = self._get_demo_data(location, keywords)
        
        # Save to cache
        try:
            with open(cache_file, 'w') as f:
                json.dump(intelligence_data, f, indent=2)
        except Exception as e:
            logger.error(f"Error writing to cache: {e}")
                
        return intelligence_data
            
    def _get_news_articles(self, location: str, keywords: List[str], days_back: int, max_results: int) -> List[Dict[str, Any]]:
        """Get news articles from news API."""
        # In production, this would call a news API like NewsAPI.org
        # For demo, returning simulated data
        
        # Demo implementation
        return self._generate_demo_news(location, keywords, max_results)
    
    def _get_video_content(self, location: str, keywords: List[str], days_back: int, max_results: int) -> List[Dict[str, Any]]:
        """Get video content from YouTube and other sources."""
        # In production, this would call YouTube Data API and other sources
        # For demo, returning simulated data
        
        # Demo implementation
        return self._generate_demo_videos(location, keywords, max_results)
        
    def _get_social_media_trends(self, location: str, keywords: List[str], days_back: int) -> Dict[str, Any]:
        """Get social media trends related to the location and keywords."""
        # In production, this would call social media APIs
        # For demo, returning simulated data
        
        # Demo implementation
        return self._generate_demo_social_trends(location, keywords)
        
    def _analyze_media_sentiment(self, news_articles: List[Dict], videos: List[Dict], social_media: Dict) -> tuple:
        """Analyze sentiment across all media sources."""
        # In production, this would use NLP services or libraries
        
        # Demo: Generate a sentiment score between -1.0 and 1.0
        # Where negative numbers indicate negative sentiment
        
        # For demo purposes, generate random sentiment based on keywords in content
        sentiment_scores = []
        risk_words = ['violence', 'attack', 'killed', 'conflict', 'war', 'disaster', 
                      'terrorist', 'unrest', 'protest', 'casualties', 'deaths']
        
        # Check news articles for risk words
        for article in news_articles:
            article_text = f"{article['title']} {article['description']}"
            article_score = 0
            
            # Count risk words
            risk_word_count = sum(1 for word in risk_words if word.lower() in article_text.lower())
            
            if risk_word_count > 3:
                article_score = -0.8  # Very negative
            elif risk_word_count > 1:
                article_score = -0.4  # Moderately negative
            else:
                article_score = 0.2   # Slightly positive
                
            sentiment_scores.append(article_score)
            
        # Get average sentiment
        if sentiment_scores:
            avg_sentiment = sum(sentiment_scores) / len(sentiment_scores)
        else:
            avg_sentiment = 0.0
            
        # Generate risk indicators based on sentiment
        risk_indicators = {
            "overall_risk_level": "high" if avg_sentiment < -0.5 else 
                                "medium" if avg_sentiment < 0 else "low",
            "sentiment_trend": "deteriorating" if avg_sentiment < -0.3 else 
                              "stable" if -0.3 <= avg_sentiment <= 0.3 else "improving",
            "key_concerns": self._extract_key_concerns(news_articles, videos),
            "credibility_score": random.uniform(0.7, 0.95)  # Demo value
        }
        
        return avg_sentiment, risk_indicators
    
    def _extract_key_concerns(self, news_articles: List[Dict], videos: List[Dict]) -> List[str]:
        """Extract key concerns from media content."""
        # In production, this would use NLP to extract topics and concerns
        # For demo, use predefined concerns based on content
        
        concerns = set()
        
        # Extract concerns from article titles
        for article in news_articles:
            title = article['title'].lower()
            
            if 'violence' in title or 'attack' in title:
                concerns.add("Violence against civilians")
                
            if 'protest' in title or 'demonstration' in title:
                concerns.add("Civil unrest")
                
            if 'humanitarian' in title or 'aid' in title or 'refugee' in title:
                concerns.add("Humanitarian crisis")
                
            if 'military' in title or 'troops' in title or 'forces' in title:
                concerns.add("Military activity")
        
        # Return top concerns or generic concerns if none found
        if not concerns:
            return ["General security concerns", "Potential for escalating tensions"]
            
        return list(concerns)[:3]
        
    def _generate_summary(self, location: str, news: List[Dict], videos: List[Dict], social: Dict) -> str:
        """Generate a summary of the media intelligence data."""
        # In production, this might use NLP summarization techniques
        
        # Simple summary generation
        num_news = len(news)
        num_videos = len(videos)
        
        summary_lines = [
            f"Media analysis for {location} reveals {num_news} recent news articles and {num_videos} video reports.",
        ]
        
        # Add trending topics if available
        if social and 'trending_topics' in social and social['trending_topics']:
            topics = social['trending_topics'][:3]
            summary_lines.append(f"Top trending topics include {', '.join(topics)}.")
        
        # Add sentiment info
        sentiment_score = self._analyze_media_sentiment(news, videos, social)[0]
        if sentiment_score < -0.5:
            summary_lines.append("Overall media sentiment is strongly negative, indicating significant concerns.")
        elif sentiment_score < 0:
            summary_lines.append("Overall media sentiment is moderately negative, suggesting potential issues.")
        else:
            summary_lines.append("Overall media sentiment is neutral to positive, suggesting relative stability.")
        
        # Add recent significant event if one exists
        if news and len(news) > 0:
            most_recent = news[0]
            summary_lines.append(f"Most recent significant media coverage: \"{most_recent['title']}\"")
        
        return " ".join(summary_lines)
    
    # DEMO DATA GENERATION METHODS
    # In a production system, these would be replaced with actual API calls
    
    def _generate_demo_news(self, location: str, keywords: List[str], count: int) -> List[Dict]:
        """Generate demo news articles data."""
        articles = []
        
        # Templates for generating believable article data
        templates = [
            {"title": "Tensions rise in {location} as {actor} increases presence", 
             "source": "Global News Network"},
            {"title": "Humanitarian concerns grow in {location} following recent events", 
             "source": "International Aid Monitor"},
            {"title": "Diplomatic efforts underway to address {location} crisis", 
             "source": "Diplomatic Affairs"},
            {"title": "Analysis: Understanding the conflict dynamics in {location}", 
             "source": "Conflict Research Institute"},
            {"title": "{actor} involvement in {location} raises international concerns", 
             "source": "World Politics Today"},
            {"title": "Civilian displacement reported in {location} conflict zone", 
             "source": "Refugee Watch"},
            {"title": "Security forces deployed to {location} following incidents", 
             "source": "Security Monitor Weekly"},
            {"title": "Economic impact of ongoing situation in {location}", 
             "source": "Global Economics Review"},
            {"title": "UN calls for restraint in {location} as situation develops", 
             "source": "United Nations Press"}
        ]
        
        # Potential actors for the articles
        actors = ["armed groups", "government forces", "military faction", "rebel alliance", 
                 "peacekeeping forces", "regional militias", "foreign actors"]
        
        # Generate articles
        for i in range(min(count, len(templates))):
            template = templates[i]
            actor = random.choice(actors)
            
            # Create article with template
            days_ago = random.randint(0, 14)
            article_date = (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d")
            
            article = {
                "title": template["title"].format(location=location, actor=actor),
                "source": template["source"],
                "publication_date": article_date,
                "url": f"https://example.com/news/{location.lower().replace(' ', '-')}-{i}",
                "description": f"This article discusses developments in {location} involving {actor}, with implications for regional security and civilian safety.",
                "sentiment": random.choice(["negative", "neutral", "slightly negative", "very negative"]),
                "image_url": f"https://via.placeholder.com/600x400?text={location}+News"
            }
            
            # Add keywords if they match
            if keywords:
                for keyword in keywords:
                    if random.random() > 0.7:  # 30% chance to include keyword
                        article["title"] += f" related to {keyword}"
            
            articles.append(article)
        
        return articles
    
    def _generate_demo_videos(self, location: str, keywords: List[str], count: int) -> List[Dict]:
        """Generate demo video content data."""
        videos = []
        
        # Video templates
        templates = [
            {"title": "Situation Report: {location} conflict zone", 
             "platform": "YouTube", "channel": "Global News Network"},
            {"title": "Eyewitness footage from {location} shows aftermath of incident", 
             "platform": "Twitter", "channel": "Citizen Journalism"},
            {"title": "Expert analysis: Understanding the crisis in {location}", 
             "platform": "YouTube", "channel": "Conflict Analysis Center"},
            {"title": "Breaking: New developments in {location} situation", 
             "platform": "YouTube", "channel": "24/7 News"},
            {"title": "Documentary: The roots of conflict in {location}", 
             "platform": "Vimeo", "channel": "Historical Context"},
            {"title": "Interview with {location} officials on security measures", 
             "platform": "YouTube", "channel": "Political Insights"}
        ]
        
        # Generate videos
        for i in range(min(count, len(templates))):
            template = templates[i]
            
            # Create video with template
            days_ago = random.randint(0, 21)
            video_date = (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d")
            views = random.randint(1000, 500000)
            
            video = {
                "title": template["title"].format(location=location),
                "platform": template["platform"],
                "channel": template["channel"],
                "publication_date": video_date,
                "url": f"https://example.com/videos/{location.lower().replace(' ', '-')}-{i}",
                "thumbnail_url": f"https://via.placeholder.com/320x180?text={location}+Video",
                "views": views,
                "duration": f"{random.randint(1, 15)}:{random.randint(10, 59)}",
                "sentiment": random.choice(["negative", "neutral", "slightly negative"]),
                "verified": random.choice([True, False]),
                "engagement": {
                    "likes": int(views * random.uniform(0.01, 0.1)),
                    "comments": int(views * random.uniform(0.001, 0.01)),
                    "shares": int(views * random.uniform(0.005, 0.02))
                }
            }
            
            videos.append(video)
        
        return videos
    
    def _generate_demo_social_trends(self, location: str, keywords: List[str]) -> Dict[str, Any]:
        """Generate demo social media trends data."""
        
        # Base hashtags related to conflict reporting
        base_hashtags = [
            f"{location}Crisis", 
            f"{location}Conflict",
            "BreakingNews", 
            "HumanitarianAid", 
            "PeaceProcess",
            "CivilianSafety",
            "WarCrimes",
            "RefugeeCrisis",
            "UnitedNations"
        ]
        
        # Add keywords to hashtags if they exist
        hashtags = base_hashtags.copy()
        for keyword in keywords:
            keyword_no_spaces = keyword.replace(" ", "")
            hashtags.append(f"{keyword_no_spaces}")
            hashtags.append(f"{location}{keyword_no_spaces}")
        
        # Select a subset for trending hashtags
        trending_hashtags = random.sample(hashtags, min(5, len(hashtags)))
        
        # Generate volume for each hashtag (thousands of mentions)
        hashtag_volume = {}
        for tag in trending_hashtags:
            hashtag_volume[tag] = random.randint(5, 100)
        
        # Sort by volume
        trending_hashtags = sorted(hashtag_volume.keys(), key=lambda x: hashtag_volume[x], reverse=True)
        
        # Create sentiment distribution
        sentiment_distribution = {
            "negative": random.uniform(0.4, 0.7),  # 40-70% negative
            "neutral": random.uniform(0.2, 0.4),   # 20-40% neutral
            "positive": random.uniform(0.1, 0.2)   # 10-20% positive
        }
        
        # Generate trending topics
        trending_topics = [
            f"Violence in {location}",
            f"Humanitarian situation in {location}",
            f"International response to {location} crisis",
            f"Refugee crisis from {location} conflict",
            f"Peace talks for {location}"
        ]
        
        # Generate influencer accounts
        influencers = [
            {"name": "Crisis Reporter", "handle": "@crisis_reporter", "followers": 250000, "recent_post": f"Breaking: New developments in the {location} situation #BreakingNews"},
            {"name": "Humanitarian Watch", "handle": "@humanwatch", "followers": 180000, "recent_post": f"Our team on the ground in {location} reports increasing civilian displacement #RefugeeCrisis"},
            {"name": "Conflict Analysis", "handle": "@conflictanalyst", "followers": 120000, "recent_post": f"Thread: Understanding the current dynamics in the {location} conflict 1/7"}
        ]
        
        return {
            "trending_hashtags": trending_hashtags,
            "hashtag_volume": hashtag_volume,
            "sentiment_distribution": sentiment_distribution,
            "trending_topics": trending_topics,
            "key_influencers": influencers,
            "data_period": "Past 7 days"
        }
        
    def _get_demo_data(self, location: str, keywords: List[str]) -> Dict[str, Any]:
        """Generate complete demo data set for testing."""
        
        news = self._generate_demo_news(location, keywords, 12)
        videos = self._generate_demo_videos(location, keywords, 6)
        social = self._generate_demo_social_trends(location, keywords)
        
        sentiment_score, risk_indicators = self._analyze_media_sentiment(news, videos, social)
        
        return {
            "query": {
                "location": location,
                "keywords": keywords,
                "timeframe": "Past 30 days"
            },
            "updated_at": datetime.now().isoformat(),
            "sentiment_score": sentiment_score,
            "risk_indicators": risk_indicators,
            "news_articles": news,
            "video_content": videos,
            "social_media_trends": social,
            "summary": self._generate_summary(location, news, videos, social)
        }

# Instantiate for direct usage
media_intelligence_service = MediaIntelligenceService()

def get_media_intelligence(location, keywords=None):
    """Helper function to get media intelligence from the service."""
    return media_intelligence_service.get_media_intelligence(location, keywords)

# For testing
if __name__ == "__main__":
    result = get_media_intelligence("Nigeria", ["Boko Haram"])
    print(json.dumps(result, indent=2))