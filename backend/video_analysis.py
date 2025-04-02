import random
import json
from datetime import datetime, timedelta
from typing import Dict, Any, List

def analyze_video(video_id: str) -> Dict[str, Any]:
    """
    Demo video analysis function that returns pre-generated analysis results.
    In a real system, this would connect to video analysis services.
    
    Args:
        video_id: Video identifier
        
    Returns:
        Dictionary containing video analysis results
    """
    # Demo video database
    demo_videos = {
        "v1": {
            "title": "Tensions rise in Northern Nigeria after recent clashes",
            "source_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",  # Demo URL
            "thumbnail_url": "https://via.placeholder.com/640x360?text=Nigeria+Conflict+Analysis",
            "verification_status": "verified",
            "analysis_results": {
                "objects_detected": [
                    {"name": "Military Vehicle", "confidence": 0.92},
                    {"name": "Crowd", "confidence": 0.88},
                    {"name": "Weapons", "confidence": 0.76},
                    {"name": "Smoke", "confidence": 0.65}
                ],
                "location_verification": {
                    "claimed_location": "Maiduguri, Nigeria",
                    "match_confidence": 0.85,
                    "details": "Geo-features and architecture consistent with Maiduguri, Nigeria. Landmark buildings visible at 0:34 confirm location."
                },
                "timestamp_analysis": {
                    "claimed_date": "2023-03-15",
                    "estimated_date": "2023-03-14 to 2023-03-16",
                    "is_consistent": True
                },
                "analyst_notes": "This video shows authentic footage of the aftermath of the reported incident. The military vehicles match those known to be used in the region."
            }
        },
        "v2": {
            "title": "Refugee movements across Somalia border - aerial footage",
            "source_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",  # Demo URL
            "thumbnail_url": "https://via.placeholder.com/640x360?text=Somalia+Border+Footage",
            "verification_status": "unverified",
            "analysis_results": {
                "objects_detected": [
                    {"name": "Large Group of People", "confidence": 0.94},
                    {"name": "Vehicles", "confidence": 0.82},
                    {"name": "Tents", "confidence": 0.79},
                    {"name": "Border Barrier", "confidence": 0.67}
                ],
                "location_verification": {
                    "claimed_location": "Somalia-Kenya Border",
                    "match_confidence": 0.65,
                    "details": "Terrain appears consistent with Somalia-Kenya border area, but specific location cannot be verified with high confidence."
                },
                "timestamp_analysis": {
                    "claimed_date": "2023-02-20",
                    "estimated_date": "2022-11-15 to 2023-01-30",
                    "is_consistent": False
                },
                "analyst_notes": "While this appears to show genuine refugee movement, the footage is likely older than claimed based on weather patterns and vegetation visible."
            }
        },
        "v3": {
            "title": "Alleged chemical weapons deployment in Ethiopia",
            "source_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",  # Demo URL
            "thumbnail_url": "https://via.placeholder.com/640x360?text=Ethiopia+Incident+Analysis",
            "verification_status": "misleading",
            "analysis_results": {
                "objects_detected": [
                    {"name": "Smoke/Cloud", "confidence": 0.91},
                    {"name": "People", "confidence": 0.87},
                    {"name": "Urban Setting", "confidence": 0.84}
                ],
                "location_verification": {
                    "claimed_location": "Tigray, Ethiopia",
                    "match_confidence": 0.35,
                    "details": "Analysis of buildings and terrain shows this footage was likely captured in Syria (2019), not Ethiopia."
                },
                "timestamp_analysis": {
                    "claimed_date": "2023-05-10",
                    "estimated_date": "2019-03-22 to 2019-04-15",
                    "is_consistent": False
                },
                "analyst_notes": "This video has been misattributed. It shows footage from a 2019 industrial fire in Syria, not a chemical weapons attack in Ethiopia. The smoke pattern is consistent with industrial chemicals, not weaponized agents."
            }
        }
    }
    
    # Return the video if it exists, otherwise return a randomized one
    if video_id in demo_videos:
        return demo_videos[video_id]
    else:
        # Return a random video from the demo set
        return random.choice(list(demo_videos.values()))

# Add an endpoint to your FastAPI app
# filepath: c:\Users\Ngum\Downloads\africa-risk-intelligence-platform\backend\main.py
# Add this import
from video_analysis import analyze_video

# Add this endpoint
@app.get("/video-analysis/{video_id}")
def get_video_analysis(video_id: str):
    """Get analysis of video content."""
    try:
        analysis = analyze_video(video_id)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video analysis failed: {str(e)}")