import pandas as pd
import numpy as np
import logging
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
import pickle
import os
import json
import re
import joblib
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(levelname)s:%(name)s:%(message)s'
)
logger = logging.getLogger('retrain')

def clean_float_value(value):
    """Clean string representations of float values that might have encoding issues."""
    if isinstance(value, str):
        # Remove non-numeric characters except for decimal points and minus signs
        cleaned = re.sub(r'[^0-9.-]', '', value)
        try:
            return float(cleaned)
        except ValueError:
            return np.nan
    return value

def map_column_names(df):
    """Map variations of column names to standard names expected by the model."""
    # Log available columns for debugging
    logger.info(f"Available columns in CSV: {', '.join(df.columns)}")
    
    # Define column mappings based on your notebook
    column_mapping = {
        # Common variations of column names that might be in uploaded data
        'LATITUDE': ['latitude', 'lat', 'y', 'latitude_', 'lat_', 'latitude_y', 'LATITUDE', 'LAT', 'Y'],
        'LONGITUDE': ['longitude', 'long', 'lon', 'lng', 'x', 'longitude_', 'long_', 'longitude_x', 'LONGITUDE', 'LONG', 'LON', 'LNG', 'X'],
        'ACTOR1': ['actor1', 'actor_1', 'actor', 'actors', 'primary_actor', 'inter1', 'side_a', 'ACTOR1', 'ACTOR_1', 'ACTOR', 'ACTORS', 'PRIMARY_ACTOR', 'INTER1', 'SIDE_A'],
        'EVENT_TYPE': ['event_type', 'eventtype', 'type', 'event', 'inter2', 'conflict_type', 'EVENT_TYPE', 'EVENTTYPE', 'TYPE', 'EVENT', 'INTER2', 'CONFLICT_TYPE'],
        'FATALITIES': ['fatalities', 'deaths', 'casualties', 'killed', 'FATALITIES', 'DEATHS', 'CASUALTIES', 'KILLED']
    }
    
    new_columns = {}
    
    # For each standard column name, look for variations in the dataframe
    for std_name, variations in column_mapping.items():
        for var in variations:
            if var in df.columns:
                new_columns[var] = std_name
                logger.info(f"Mapping column '{var}' to standard name '{std_name}'")
                break
    
    # Rename columns if mappings were found
    if new_columns:
        df = df.rename(columns=new_columns)
        logger.info(f"Renamed columns: {new_columns}")
    
    return df

def retrain_model_from_csv(csv_path):
    """Retrain the risk prediction model with new data."""
    try:
        logger.info(f"Starting model retraining with data from {csv_path}")
        
        # Load the CSV data with error handling
        try:
            df = pd.read_csv(csv_path, low_memory=False)
            logger.info(f"Loaded CSV with {df.shape[0]} rows and {df.shape[1]} columns")
        except Exception as e:
            logger.error(f"Error loading CSV: {str(e)}")
            return False, str(e)
        
        # Clean and preprocess data
        try:
            # Map column names to expected names
            df = map_column_names(df)
            
            # Define minimum required columns based on your notebook
            required_columns = ['LATITUDE', 'LONGITUDE', 'ACTOR1', 'EVENT_TYPE']
            
            # Check if all required columns are present after mapping
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                logger.error(f"Missing required columns: {missing_columns}")
                
                # Return JSON-serializable data about the issue
                issue_details = {
                    'missing_columns': missing_columns,
                    'available_columns': list(df.columns),
                    'recommended_action': 'Please rename your CSV columns or upload a file with the required columns.'
                }
                return False, json.dumps(issue_details)
            
            # Handle missing values in required columns
            df = df.fillna({
                'LATITUDE': df['LATITUDE'].mean() if not pd.isna(df['LATITUDE'].mean()) else 0,
                'LONGITUDE': df['LONGITUDE'].mean() if not pd.isna(df['LONGITUDE'].mean()) else 0,
                'ACTOR1': 'Unknown',
                'EVENT_TYPE': 'Other'
            })
            
            # Clean numerical columns
            for col in ['LATITUDE', 'LONGITUDE']:
                df[col] = df[col].apply(clean_float_value)
            
            # If FATALITIES doesn't exist, create it
            if 'FATALITIES' not in df.columns:
                logger.warning("'FATALITIES' column not found. Creating synthetic values.")
                df['FATALITIES'] = np.random.poisson(lam=2, size=len(df))  # Poisson distribution for count data
            
            # If CONFLICT_RISK doesn't exist, we need to create it based on features
            if 'CONFLICT_RISK' not in df.columns:
                logger.warning("'CONFLICT_RISK' column not found. Creating synthetic values for training.")
                
                # Create a simple heuristic for risk classification
                # Higher fatalities = higher risk
                fatality_threshold = df['FATALITIES'].quantile(0.7)
                
                # Map event types to risk levels
                high_risk_events = ['VIOLENCE AGAINST CIVILIANS', 'BATTLE', 'ARMED CLASH', 'REMOTE VIOLENCE']
                medium_risk_events = ['PROTEST', 'RIOT']
                
                # Create risk score
                df['CONFLICT_RISK'] = 0  # Low risk default
                
                # Medium risk conditions
                medium_risk_mask = (df['EVENT_TYPE'].str.upper().isin([e.upper() for e in medium_risk_events])) | \
                                  (df['FATALITIES'] > 0)
                df.loc[medium_risk_mask, 'CONFLICT_RISK'] = 1
                
                # High risk conditions
                high_risk_mask = (df['EVENT_TYPE'].str.upper().isin([e.upper() for e in high_risk_events])) | \
                               (df['FATALITIES'] >= fatality_threshold)
                df.loc[high_risk_mask, 'CONFLICT_RISK'] = 2
                
                logger.info(f"Created synthetic CONFLICT_RISK values: {df['CONFLICT_RISK'].value_counts().to_dict()}")
            
            # Encode categorical features
            encode_cols = ['ACTOR1', 'EVENT_TYPE']
            encoders = {}
            for col in encode_cols:
                encoders[col.lower()] = LabelEncoder()
                df[col] = df[col].fillna('Unknown')
                df[col] = encoders[col.lower()].fit_transform(df[col])
            
            # Prepare data for model training - matching the notebook structure
            X = df.drop(['FATALITIES', 'CONFLICT_RISK'], axis=1, errors='ignore')
            
            # Ensure CONFLICT_RISK is an integer
            df['CONFLICT_RISK'] = df['CONFLICT_RISK'].astype(int)
            y = df['CONFLICT_RISK']
            
            # Split data for training and evaluation
            X_train, X_test, y_train, y_test = train_test_split(X, y, stratify=y, test_size=0.2, random_state=42)
            
            # Train the model using same hyperparameters as in the notebook
            model = RandomForestClassifier(n_estimators=150, max_depth=12, min_samples_split=5, random_state=42)
            model.fit(X_train, y_train)
            
            # Evaluate the model
            y_pred = model.predict(X_test)
            metrics = {
                'accuracy': float(accuracy_score(y_test, y_pred)),
                'precision': float(precision_score(y_test, y_pred, average='weighted', zero_division=0)),
                'recall': float(recall_score(y_test, y_pred, average='weighted', zero_division=0)),
                'f1_score': float(f1_score(y_test, y_pred, average='weighted', zero_division=0))
            }
            
            # Log classification report
            logger.info(f"Classification Report:\n{classification_report(y_test, y_pred)}")
            
            # Get feature importances
            feature_importance = {}
            for i, feature in enumerate(X.columns):
                feature_importance[feature] = float(model.feature_importances_[i])
            
            # Save the model and metadata
            model_dir = os.path.join(os.path.dirname(__file__), 'models')
            os.makedirs(model_dir, exist_ok=True)
            
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            model_path = os.path.join(model_dir, f'conflict_model_{timestamp}.pkl')
            latest_model_path = os.path.join(model_dir, 'conflict_model_final.pkl')  # Same name as in notebook
            encoder_path = os.path.join(model_dir, f'encoders_{timestamp}.pkl')
            metadata_path = os.path.join(model_dir, f'metadata_{timestamp}.json')
            
            # Save the model in two locations - timestamped and as the latest
            joblib.dump(model, model_path)
            joblib.dump(model, latest_model_path)
                
            with open(encoder_path, 'wb') as f:
                pickle.dump(encoders, f)
                
            metadata = {
                'created': datetime.now().isoformat(),
                'metrics': metrics,
                'feature_importance': feature_importance,
                'model_path': model_path,
                'encoder_path': encoder_path,
                'num_samples': len(df),
                'features': list(X.columns),
                'column_mapping': {col: std for std, variations in column_mapping.items() 
                                 for col in variations if col in df.columns},
                'risk_distribution': df['CONFLICT_RISK'].value_counts().to_dict()
            }
            
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)
            
            # Save a pointer to the latest model
            latest_path = os.path.join(model_dir, 'latest.json')
            with open(latest_path, 'w') as f:
                json.dump({
                    'model_path': latest_model_path,
                    'encoder_path': encoder_path,
                    'metadata_path': metadata_path
                }, f, indent=2)
                
            logger.info(f"Model training completed successfully. Model saved to {latest_model_path}")
            logger.info(f"Model metrics: Accuracy={metrics['accuracy']:.4f}, Precision={metrics['precision']:.4f}, Recall={metrics['recall']:.4f}")
            
            return True, metadata
            
        except Exception as e:
            import traceback
            logger.error(f"Error retraining model: {str(e)}")
            logger.error(traceback.format_exc())
            return False, str(e)
            
    except Exception as e:
        import traceback
        logger.error(f"Unexpected error in model retraining: {str(e)}")
        logger.error(traceback.format_exc())
        return False, str(e)

# Keep the original function name as an alias to maintain compatibility with existing code
def retrain_model(csv_path):
    return retrain_model_from_csv(csv_path)

if __name__ == "__main__":
    # Example usage
    csv_path = os.path.join(os.path.dirname(__file__), 'uploads', 'training_data.csv')
    success, result = retrain_model_from_csv(csv_path)
    
    if success:
        print("Model retrained successfully!")
        print(f"Accuracy: {result['metrics']['accuracy']:.4f}")
    else:
        print(f"Model training failed: {result}")
