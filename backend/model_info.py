from model_loader import load_model, CompatibilityModel
import numpy as np

def print_model_categories():
    """Print the categories that the model knows about."""
    model = load_model()
    
    # If it's our compatibility model, we'll use defaults
    if isinstance(model, CompatibilityModel):
        print("Using compatibility model with default categories")
        return {
            "event_types": ["Battle", "Protest", "Riot", "Violence against civilians", "Strategic development"],
            "countries": ["Nigeria", "Somalia", "Sudan", "Kenya", "Ethiopia"],
            "actors": ["Boko Haram", "Government", "Military", "Civilians", "Protesters"]
        }
    
    # For real models, try to extract the categories
    try:
        # Check what type of model we have
        print(f"Model type: {type(model)}")
        
        # Different ways a scikit-learn model might store categories
        if hasattr(model, 'classes_'):
            print(f"Model classes: {model.classes_}")
        
        # For pipelines with preprocessors
        if hasattr(model, 'named_steps'):
            for step_name, step in model.named_steps.items():
                if hasattr(step, 'categories_'):
                    print(f"Categories in {step_name}:")
                    for i, cats in enumerate(step.categories_):
                        print(f"  Feature {i}: {cats}")
                
                # For column transformers
                if hasattr(step, 'transformers_'):
                    for name, transformer, cols in step.transformers_:
                        if hasattr(transformer, 'categories_'):
                            print(f"Categories in {name}:")
                            for i, cats in enumerate(transformer.categories_):
                                print(f"  {cols[i]}: {cats}")
        
        # For feature importances (if available)
        if hasattr(model, 'feature_importances_'):
            print("\nFeature importances:")
            # You'll need to get feature names from your training data or model
            try:
                if hasattr(model, 'feature_names_in_'):
                    feature_names = model.feature_names_in_
                    importances = model.feature_importances_
                    for feature, importance in zip(feature_names, importances):
                        print(f"  {feature}: {importance:.4f}")
            except:
                print("  Unable to map feature names to importances")
                
        # For Random Forest, we can see what features it uses
        if hasattr(model, 'estimators_'):
            print("\nThis appears to be an ensemble model with estimators.")
            print(f"Number of estimators: {len(model.estimators_)}")
            
        return "Model information printed"
    except Exception as e:
        print(f"Error examining model: {str(e)}")
        return "Error occurred"

if __name__ == "__main__":
    print_model_categories()