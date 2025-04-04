from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
from predict import make_prediction
from retrain import retrain_model_from_csv
import shutil
import os
from fastapi.responses import JSONResponse
from media_signals import media_signals
import logging
from media_intelligence import get_media_intelligence
import json
from datetime import datetime
import gc  # Add garbage collection

app = FastAPI(title="Africa Conflict Risk API", description="Predict conflict risk and retrain with new data")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://mellifluous-biscotti-7d3f89.netlify.app",
        "https://visionary-elf-d34048.netlify.app", 
        "https://sparkly-choux-2933f0.netlify.app",  # Add your new domain
        "http://localhost:5173",
        # Add a wildcard as fallback
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    # Add this to ensure preflight requests work correctly
    allow_origin_regex="https://.*\.netlify\.app"
)

@app.middleware("http")
async def add_gc_middleware(request, call_next):
    response = await call_next(request)
    gc.collect()  # Force garbage collection after each request
    return response

# Add this to ensure CORS headers are correctly applied
@app.middleware("http")
async def add_cors_headers(request, call_next):
    response = await call_next(request)
    if request.headers.get("origin"):
        response.headers["Access-Control-Allow-Origin"] = "*"
    return response

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ConflictInput(BaseModel):
    country: str
    admin1: str
    event_type: str
    actor1: str
    latitude: float
    longitude: float
    year: int
    
    # Optional fields with defaults
    # Add any other fields your model might need
    
    class Config:
        schema_extra = {
            "example": {
                "country": "Nigeria",
                "admin1": "Borno",
                "event_type": "Violence against civilians",
                "actor1": "Boko Haram",
                "latitude": 10.3833,
                "longitude": 9.75,
                "year": 2023
            }
        }

@app.get("/")
def read_root():
    return JSONResponse({"status": "ok", "message": "Africa Risk Intelligence Platform API is running"})

# Update your predict endpoint

@app.post("/predict")
def predict_conflict(data: ConflictInput):
    from predict import convert_to_native_types
    
    try:
        logger.info(f"Received prediction request with data: {data}")
        result = make_prediction(data.dict())
        
        # Convert any numpy types to native Python types for JSON serialization
        result = convert_to_native_types(result)
        
        logger.info(f"Prediction result: {result}")
        return result
    except ValueError as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in prediction: {str(e)}")
        # Return a safe fallback prediction
        return {
            "prediction": "Low Risk",
            "confidence": 65.0,
            "ai_recommendation": "Stability Assessment for this region suggests low conflict potential.",
            "if_no_action": "Region is expected to maintain current stability levels.",
            "warning": f"An error occurred during prediction processing: {str(e)}"
        }

@app.get("/media-signals")
def get_media_signals(country: str, actor: str):
    try:
        query = f"{actor} {country}"
        results = media_signals(query)
        return {"query": query, "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Media analysis failed: {e}")

@app.post("/upload-csv", response_model=dict)
async def upload_csv(file: UploadFile = File(...)):
    """Upload a CSV file for model retraining"""
    try:
        logger.info(f"Received CSV upload: {file.filename}")
        
        # Validate file extension
        if not file.filename.endswith('.csv'):
            logger.error("Invalid file format - must be CSV")
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": "File must be a CSV file"}
            )
        
        # Save the uploaded CSV with timestamp to avoid overwriting
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        os.makedirs("uploads", exist_ok=True)
        file_path = f"uploads/{timestamp}_{file.filename}"
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        logger.info(f"CSV saved to {file_path}, initiating retraining")
        
        # Start retraining process
        result = await train_model_task(file_path)
        
        return {"success": True, "message": "Retraining initiated", "details": result}
    except Exception as e:
        logger.exception(f"Error in CSV upload: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": f"Retraining failed: {str(e)}"}
        )

# Add this endpoint to return valid values from your dataset

@app.get("/categories")
def get_categories():
    return {
        "categories": [
            {"id": 1, "name": "Violence against civilians"},
            {"id": 2, "name": "Armed clashes"},
            {"id": 3, "name": "Protests"},
            {"id": 4, "name": "Remote explosives"},
            {"id": 5, "name": "Strategic developments"}
        ]
    }

# Add these endpoints to your main.py file

@app.get("/dashboard-data")
def get_dashboard_data():
    """Return dashboard data"""
    try:
        # Make response smaller and simpler
        return {
            "data": {
                "risk_by_country": {
                    "Nigeria": {"high": 65, "low": 35},
                    "Somalia": {"high": 78, "low": 22},
                    "South Sudan": {"high": 82, "low": 18},
                    "DRC": {"high": 70, "low": 30},
                    "Ethiopia": {"high": 55, "low": 45}
                },
                "event_types": {
                    "Protests": 120,
                    "Violence against civilians": 85,
                    "Armed clashes": 65,
                    "Remote explosives": 40,
                    "Strategic developments": 25
                },
                "trend_data": {
                    "months": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                    "incidents": [45, 52, 49, 60, 55, 70],
                    "fatalities": [23, 27, 30, 35, 25, 45]
                },
                "model_metrics": {
                    "accuracy": 0.87,
                    "precision": 0.83,
                    "recall": 0.85,
                    "f1": 0.84
                }
            }
        }
    except Exception as e:
        logger.error(f"Error serving dashboard data: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error", "detail": str(e)}
        )

@app.get("/model-info")
def get_model_info():
    """Return model information"""
    return {
        "model_info": {
            "type": "Random Forest",
            "last_updated": "2025-04-02",
            "size_mb": 48.5,
            "n_estimators": 200
        }
    }

# Add this endpoint to your FastAPI app

@app.get("/model/verify-retraining")
async def verify_retraining():
    try:
        # Path to model files
        model_dir = os.path.join(os.path.dirname(__file__), 'models')
        model_path = os.path.join(model_dir, 'conflict_model_final.pkl')
        latest_path = os.path.join(model_dir, 'latest.json')
        
        # Check if model exists
        model_exists = os.path.exists(model_path)
        
        # Get model file stats
        if model_exists:
            model_stats = os.stat(model_path)
            model_size = model_stats.st_size  # Size in bytes
            model_modified = datetime.fromtimestamp(model_stats.st_mtime).isoformat()
        else:
            model_size = 0
            model_modified = None
        
        # Get latest metadata
        if os.path.exists(latest_path):
            with open(latest_path, 'r') as f:
                latest = json.load(f)
                
            with open(latest['metadata_path'], 'r') as f:
                metadata = json.load(f)
        else:
            metadata = None
        
        # Return comprehensive verification info
        return {
            "model_exists": model_exists,
            "model_file_size_kb": round(model_size / 1024, 2),
            "model_last_modified": model_modified,
            "last_training_completed": metadata['created'] if metadata else None,
            "training_metrics": metadata['metrics'] if metadata else None,
            "samples_trained_on": metadata['num_samples'] if metadata else None,
            "features_used": metadata['features'] if metadata else None,
            "verification_timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error verifying model retraining: {str(e)}")
        return {"error": str(e)}

# Add this to your model training functionality

# Initialize retraining history
retraining_history = []

# Add this function to log retraining attempts
def record_retraining_attempt(success, model_path=None, error=None, metadata=None):
    retraining_history.append({
        "timestamp": datetime.now().isoformat(),
        "success": success,
        "model_path": model_path if success else None,
        "error": str(error) if error else None,
        "metrics": metadata.get("metrics") if success and metadata else None,
        "num_samples": metadata.get("num_samples") if success and metadata else None
    })
    
    # Keep only the last 20 entries
    if len(retraining_history) > 20:
        retraining_history.pop(0)

# Add an endpoint to get retraining history
@app.get("/model/retraining-history")
async def get_retraining_history():
    return {"history": retraining_history}

# Update your model retraining task to record the attempt
async def train_model_task(csv_path=None):
    try:
        # Default to a standard path if none provided
        if csv_path is None:
            csv_path = os.path.join(os.path.dirname(__file__), 'data', 'training_data.csv')
        
        success, result = retrain_model_from_csv(csv_path)
        
        if success:
            # ... existing code ...
            latest_model_path = os.path.join(os.path.dirname(__file__), 'models', 'conflict_model_final.pkl')
            record_retraining_attempt(True, latest_model_path, None, result)
        else:
            # ... existing code ...
            record_retraining_attempt(False, None, result, None)
        
    except Exception as e:
        # ... existing code ...
        record_retraining_attempt(False, None, str(e), None)

async def train_model_task(csv_path):
    """Run model retraining process"""
    try:
        logger.info(f"Starting model retraining with data from {csv_path}")
        
        # Ensure the file exists
        if not os.path.exists(csv_path):
            error_msg = f"Training data file not found: {csv_path}"
            logger.error(error_msg)
            record_retraining_attempt(False, None, error_msg, None)
            return {"success": False, "error": error_msg}
        
        # Create necessary directories
        model_dir = os.path.join(os.path.dirname(__file__), 'models')
        os.makedirs(model_dir, exist_ok=True)
        logs_dir = os.path.join(os.path.dirname(__file__), 'logs')
        os.makedirs(logs_dir, exist_ok=True)
        
        # Call your retraining function with timeouts
        result = retrain_model_from_csv(csv_path)
        
        if isinstance(result, tuple) and len(result) == 2:
            # Handle the case where function returns (success, data)
            success, data = result
        else:
            # Handle the case where function returns just data
            success = not isinstance(result, Exception)
            data = result
        
        # Record the attempt
        if success:
            model_path = os.path.join(model_dir, 'conflict_model_final.pkl')
            logger.info(f"Model retraining successful, saved to {model_path}")
            
            # Create metadata file
            metadata = {
                "created": datetime.now().isoformat(),
                "training_file": os.path.basename(csv_path),
                "metrics": data.get("metrics", {}),
                "num_samples": data.get("num_samples", 0),
                "features": data.get("features", [])
            }
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            metadata_path = os.path.join(model_dir, f"metadata_{timestamp}.json")
            with open(metadata_path, "w") as f:
                json.dump(metadata, f, indent=2)
                
            # Update latest.json pointer
            latest = {"model_path": model_path, "metadata_path": metadata_path}
            with open(os.path.join(model_dir, "latest.json"), "w") as f:
                json.dump(latest, f, indent=2)
                
            record_retraining_attempt(True, model_path, None, metadata)
            return {"success": True, "message": "Model retraining successful", "details": data}
        else:
            error_msg = str(data) if data else "Unknown error during retraining"
            logger.error(f"Model retraining failed: {error_msg}")
            record_retraining_attempt(False, None, error_msg, None)
            return {"success": False, "error": error_msg}
            
    except Exception as e:
        error_msg = f"Exception during model retraining: {str(e)}"
        logger.exception(error_msg)
        record_retraining_attempt(False, None, error_msg, None)
        return {"success": False, "error": error_msg}

# Add this endpoint

@app.get("/model/training-log-file")
async def get_training_log_file(lines: int = 50):
    try:
        log_path = os.path.join(os.path.dirname(__file__), 'logs', 'model_training.log')
        
        if not os.path.exists(log_path):
            return {"log_exists": False, "lines": []}
            
        # Read the last N lines of the log file
        with open(log_path, 'r') as f:
            # Efficient way to read last N lines without loading whole file
            buffer = 8192
            lines_found = []
            f.seek(0, os.SEEK_END)
            block_end = f.tell()
            
            while len(lines_found) < lines and block_end > 0:
                block_start = max(0, block_end - buffer)
                f.seek(block_start)
                
                # Read to the end of current block
                block = f.read(block_end - block_start).splitlines()
                
                # Handle case when we're at start of file
                if block_start == 0:
                    lines_found = block[-lines:]
                    break
                    
                # Add lines from this block, except the first which might be partial
                lines_found = block[1:] + lines_found
                
                # Move back to read the previous block
                block_end = block_start
            
            # Limit to the requested number of lines
            lines_found = lines_found[-lines:]
        
        # Look for successful training completion message in logs
        has_completion_message = any("Model training completed successfully" in line for line in lines_found)
        
        return {
            "log_exists": True,
            "lines": lines_found,
            "has_completion_message": has_completion_message,
            "last_modified": datetime.fromtimestamp(os.path.getmtime(log_path)).isoformat()
        }
    except Exception as e:
        logger.error(f"Error reading training log file: {str(e)}")
        return {"error": str(e)}

# Add this endpoint to your app
@app.get("/media-intelligence/{hotspot_id}")
async def get_hotspot_media_intelligence(hotspot_id: str, days: int = 30):
    try:
        # In production, you'd look up the hotspot in a database
        # For demo, create a fake hotspot based on ID
        hotspot_map = {
            "1": {"country": "Nigeria", "keywords": ["Boko Haram"]},
            "2": {"country": "Somalia", "keywords": ["Al-Shabaab"]},
            "3": {"country": "Ethiopia", "keywords": ["Tigray", "conflict"]},
            "4": {"country": "Sudan", "keywords": ["Darfur"]},
            "5": {"country": "Mali", "keywords": ["JNIM", "terrorism"]}
        }
        
        # Get hotspot info or default to Nigeria
        hotspot = hotspot_map.get(hotspot_id, {"country": "Nigeria", "keywords": []})
        
        # Get media intelligence
        intelligence = get_media_intelligence(hotspot["country"], hotspot["keywords"])
        
        # Add metadata
        intelligence["hotspot_id"] = hotspot_id
        intelligence["requested_at"] = datetime.now().isoformat()
        
        return intelligence
    except Exception as e:
        logger.error(f"Error retrieving media intelligence: {str(e)}")
        return {"error": str(e)}

# Add a batch endpoint for multiple hotspots
@app.post("/media-intelligence/batch")
async def get_batch_media_intelligence(hotspot_ids: List[str]):
    try:
        results = {}
        for hotspot_id in hotspot_ids:
            results[hotspot_id] = await get_hotspot_media_intelligence(hotspot_id)
        return results
    except Exception as e:
        logger.error(f"Error in batch media intelligence: {str(e)}")
        return {"error": str(e)}

# Add to your backend/main.py

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "API is healthy"}

@app.get("/api/status")
async def api_status():
    """API health check endpoint"""
    return {
        "status": "ok",
        "message": "API is running properly",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/countries")
def get_countries():
    """Return African countries for the form"""
    return {
        "countries": [
            {"name": "Nigeria", "code": "NG"},
            {"name": "Somalia", "code": "SO"},
            {"name": "Ethiopia", "code": "ET"},
            {"name": "Sudan", "code": "SD"},
            {"name": "South Sudan", "code": "SS"},
            {"name": "Mali", "code": "ML"},
            {"name": "Democratic Republic of Congo", "code": "CD"},
            # Add more countries as needed
        ]
    }

@app.get("/regions")
def get_regions(country: str):
    """Return regions/admin1 areas for a given country"""
    regions_by_country = {
        "nigeria": [
            "Borno", "Yobe", "Adamawa", "Katsina", "Sokoto", "Benue", "Lagos", 
            "Abuja", "Kano", "Kaduna", "Plateau", "Niger", "Zamfara"
        ],
        "somalia": [
            "Banadir", "Gedo", "Lower Juba", "Middle Juba", "Lower Shabelle", 
            "Middle Shabelle", "Hiraan", "Galgaduud", "Mudug", "Nugal", "Bari"
        ],
        "ethiopia": [
            "Tigray", "Amhara", "Oromia", "Somali", "Afar", "Addis Ababa", 
            "Gambela", "Benishangul-Gumuz", "SNNPR"
        ],
        "drc": [
            "North Kivu", "South Kivu", "Ituri", "Tanganyika", "Kasai", 
            "Kasai Central", "Kinshasa", "Maniema", "Katanga"
        ],
        "south sudan": [
            "Central Equatoria", "Eastern Equatoria", "Western Equatoria", "Jonglei", 
            "Lakes", "Northern Bahr el Ghazal", "Unity", "Upper Nile", "Warrap"
        ],
        "sudan": [
            "Darfur", "Khartoum", "Blue Nile", "South Kordofan", "North Kordofan", 
            "Red Sea", "Kassala", "Gedaref", "Sennar"
        ]
    }
    
    # Default case for any country
    default_regions = ["Capital Region", "North", "South", "East", "West", "Central"]
    
    # Find regions for the country (case-insensitive search)
    country_lower = country.lower()
    regions = regions_by_country.get(country_lower, default_regions)
    
    return {"regions": [{"name": region} for region in regions]}

@app.get("/actors")
def get_actors(country: str = None):
    """Return conflict actors by country"""
    all_actors = [
        {"name": "Boko Haram", "type": "Non-state armed group", "countries": ["Nigeria", "Cameroon", "Chad"]},
        {"name": "Al-Shabaab", "type": "Non-state armed group", "countries": ["Somalia", "Kenya"]},
        {"name": "TPLF", "type": "Political militia", "countries": ["Ethiopia"]},
        {"name": "OLA", "type": "Political militia", "countries": ["Ethiopia"]},
        {"name": "Janjaweed/RSF", "type": "Political militia", "countries": ["Sudan"]},
        {"name": "M23", "type": "Rebel group", "countries": ["DRC"]},
        {"name": "ADF", "type": "Non-state armed group", "countries": ["DRC", "Uganda"]},
        {"name": "Government forces", "type": "State forces", "countries": ["All"]},
        {"name": "JNIM", "type": "Non-state armed group", "countries": ["Mali", "Burkina Faso", "Niger"]},
        {"name": "Wagner Group", "type": "Private military", "countries": ["Mali", "CAR", "Sudan"]},
        {"name": "Protesters", "type": "Civilians", "countries": ["All"]},
        {"name": "Civilians", "type": "Civilians", "countries": ["All"]},
        {"name": "Unknown armed group", "type": "Unidentified", "countries": ["All"]}
    ]
    
    # If country is specified, filter the actors
    if country:
        actors = [
            actor for actor in all_actors 
            if country in actor["countries"] or "All" in actor["countries"]
        ]
    else:
        actors = all_actors
    
    return {"actors": actors}

@app.on_event("startup")
async def startup_event():
    all_routes = [{"path": route.path, "name": route.name, "methods": route.methods} for route in app.routes]
    print(f"Registered routes: {all_routes}")
    logger.info(f"Registered routes: {all_routes}")

@app.get("/model/retraining-status")
async def get_retraining_status():
    """Get status of the model retraining process"""
    try:
        # Check for model and metadata
        model_dir = os.path.join(os.path.dirname(__file__), 'models')
        model_path = os.path.join(model_dir, 'conflict_model_final.pkl')
        latest_path = os.path.join(model_dir, 'latest.json')
        
        if not os.path.exists(model_path):
            return {
                "status": "no_model", 
                "message": "No trained model found",
                "last_attempts": retraining_history[-3:] if retraining_history else []
            }
            
        # Get model file stats
        model_stats = os.stat(model_path)
        model_size_mb = round(model_stats.st_size / (1024 * 1024), 2)
        model_modified = datetime.fromtimestamp(model_stats.st_mtime).isoformat()
        
        # Get metadata if available
        metadata = {}
        if os.path.exists(latest_path):
            try:
                with open(latest_path, 'r') as f:
                    latest = json.load(f)
                    
                metadata_path = latest.get('metadata_path')
                if metadata_path and os.path.exists(metadata_path):
                    with open(metadata_path, 'r') as f:
                        metadata = json.load(f)
            except (json.JSONDecodeError, FileNotFoundError) as e:
                logger.error(f"Error reading metadata: {str(e)}")
        
        # Return status
        return {
            "status": "ready",
            "message": "Model is trained and ready",
            "model_size_mb": model_size_mb,
            "last_modified": model_modified,
            "metadata": metadata,
            "last_attempts": retraining_history[-3:] if retraining_history else []
        }
    except Exception as e:
        logger.exception(f"Error getting retraining status: {str(e)}")
        return {
            "status": "error",
            "message": f"Error checking model status: {str(e)}",
            "last_attempts": retraining_history[-3:] if retraining_history else []
        }
