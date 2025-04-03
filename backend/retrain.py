import pandas as pd
import numpy as np
import pickle
import os
import logging
import time
from datetime import datetime
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

logger = logging.getLogger(__name__)

def retrain_model_from_csv(csv_path):
    """Retrain model from CSV file"""
    try:
        start_time = time.time()
        logger.info(f"Starting model retraining from {csv_path}")
        
        # Load data
        df = pd.read_csv(csv_path)
        logger.info(f"Loaded CSV with {len(df)} records and {len(df.columns)} columns")
        
        # Verify minimum data requirements
        if len(df) < 10:
            return False, f"Not enough training data: {len(df)} records (minimum 10 required)"
        
        # Check for expected column names (case-insensitive)
        expected_columns = ["COUNTRY", "ADMIN1", "EVENT_TYPE", "ACTOR1", "LATITUDE", "LONGITUDE", "YEAR", "FATALITIES"]
        df_columns_upper = [col.upper() for col in df.columns]
        
        missing_columns = []
        for col in expected_columns:
            if col not in df_columns_upper:
                missing_columns.append(col)
                
        if missing_columns:
            return False, f"Missing expected columns: {missing_columns}. Required columns: {expected_columns}"
        
        # Map actual column names to expected column names (accounting for case differences)
        column_mapping = {}
        for expected_col in expected_columns:
            for actual_col in df.columns:
                if actual_col.upper() == expected_col:
                    column_mapping[actual_col] = expected_col
        
        # Rename columns to standardized uppercase names
        df = df.rename(columns=column_mapping)
        
        # Check for target column with flexible naming 
        target_column = None
        possible_target_columns = ['CONFLICT_RISK', 'TARGET', 'RISK', 'LABEL']
        
        for col in possible_target_columns:
            if col in df_columns_upper:
                for actual_col in df.columns:
                    if actual_col.upper() == col:
                        target_column = actual_col
                        break
        
        if not target_column:
            return False, (
                f"Missing target column. Your CSV has all feature columns but is missing a target/label column. "
                f"Please add one of these columns: {', '.join(possible_target_columns)}. "
                f"This column should contain 0 (low risk) or 1 (high risk) values."
            )
        
        # Verify target values are binary (0/1)
        unique_values = df[target_column].unique()
        if not set(unique_values).issubset({0, 1}):
            return False, f"Target column must contain only binary values (0 or 1). Found: {unique_values}"
        
        # Prepare features (using all columns except target and optionally excluding fatalities)
        feature_columns = [col for col in df.columns if col.upper() != target_column.upper()]
        
        # Prepare X and y
        X = df[feature_columns]
        y = df[target_column]
        
        # One-hot encode categorical columns
        categorical_cols = ['COUNTRY', 'ADMIN1', 'EVENT_TYPE', 'ACTOR1']
        X_encoded = pd.get_dummies(X, columns=[col for col in categorical_cols if col in X.columns])
        
        # Train test split
        X_train, X_test, y_train, y_test = train_test_split(X_encoded, y, test_size=0.2, random_state=42)
        
        # Train model
        model = RandomForestClassifier(n_estimators=150, max_depth=12, min_samples_split=5, random_state=42)
        model.fit(X_train, y_train)
        
        # Evaluate model
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, average='weighted')
        recall = recall_score(y_test, y_pred, average='weighted')
        f1 = f1_score(y_test, y_pred, average='weighted')
        
        metrics = {
            'accuracy': float(accuracy),
            'precision': float(precision),
            'recall': float(recall),
            'f1': float(f1)
        }
        
        # Save model
        model_dir = os.path.join(os.path.dirname(__file__), 'models')
        os.makedirs(model_dir, exist_ok=True)
        model_path = os.path.join(model_dir, 'conflict_model_final.pkl')
        
        with open(model_path, 'wb') as f:
            pickle.dump(model, f)
        
        # Return success info
        training_info = {
            'metrics': metrics,
            'num_samples': len(df),
            'features': list(X_encoded.columns),
            'training_time_seconds': time.time() - start_time,
            'timestamp': datetime.now().isoformat(),
            'target_column': target_column
        }
        
        return True, training_info
        
    except Exception as e:
        logger.exception(f"Error during model retraining: {str(e)}")
        return False, str(e)

if __name__ == "__main__":
    # Example usage
    csv_path = os.path.join(os.path.dirname(__file__), 'uploads', 'training_data.csv')
    success, result = retrain_model_from_csv(csv_path)
    
    if success:
        print("Model retrained successfully!")
        print(f"Accuracy: {result['metrics']['accuracy']:.4f}")
    else:
        print(f"Model training failed: {result}")
