import pandas as pd
from sklearn.model_selection import train_test_split

# Load the Excel dataset
file_path = "Northeast_India_Landslide_ML_Dataset.xlsx"
df = pd.read_excel(file_path)

# Keep only the 3 required columns
data = df[
    [
        "rainfall_24h_mm",
        "soil_moisture_vol_frac",
        "landslide_occurred"
    ]
]

# Check for missing values
print("Missing values:")
print(data.isnull().sum())

# Separate inputs and target
X = data[
    [
        "rainfall_24h_mm",
        "soil_moisture_vol_frac"
    ]
]

y = data["landslide_occurred"]

# Check target values
print("\nTarget values:")
print(y.value_counts())

# Split into 80% training and 20% testing
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("\nData preparation completed!")
print("Total records:", len(data))
print("Training records:", len(X_train))
print("Testing records:", len(X_test))
from sklearn.tree import DecisionTreeClassifier

# Create the Decision Tree model
model = DecisionTreeClassifier(
    class_weight="balanced",
    random_state=42
)

# Train the model
model.fit(X_train, y_train)

print("\nModel training completed!")
from sklearn.metrics import accuracy_score

# Make predictions on the test data
y_pred = model.predict(X_test)

# Calculate accuracy
accuracy = accuracy_score(y_test, y_pred)

print("\nModel Accuracy:", round(accuracy * 100, 2), "%")
from sklearn.metrics import confusion_matrix

# Create confusion matrix
cm = confusion_matrix(y_test, y_pred)

print("\nConfusion Matrix:")
print(cm)
# Test the model with a new situation
rainfall = 180
soil_moisture = 0.72

prediction = model.predict([[rainfall, soil_moisture]])

if prediction[0] == 1:
    print("\nPredicted Risk: HIGH")
else:
    print("\nPredicted Risk: LOW")
    from sklearn.metrics import classification_report

print("\nClassification Report:")
print(classification_report(y_test, y_pred))
print("\nAverage values by landslide occurrence:")
print(
    data.groupby("landslide_occurred")[
        ["rainfall_24h_mm", "soil_moisture_vol_frac"]
    ].mean()
)
from sklearn.linear_model import LogisticRegression

# Create and train Logistic Regression model
logistic_model = LogisticRegression(
    class_weight="balanced",
    random_state=42
)

logistic_model.fit(X_train, y_train)

# Make predictions
logistic_pred = logistic_model.predict(X_test)

# Check performance
print("\nLogistic Regression Report:")
print(classification_report(y_test, logistic_pred))
# Get probability of landslide
probabilities = logistic_model.predict_proba(X_test)[:, 1]

print("\nSample landslide probabilities:")
print(probabilities[:10])
# Convert probability into risk level
def get_risk_level(probability):
    if probability < 0.30:
        return "LOW"
    elif probability < 0.60:
        return "MEDIUM"
    else:
        return "HIGH"


# Test the risk-level system
print("\nSample Risk Levels:")

for probability in probabilities[:10]:
    risk = get_risk_level(probability)
    print(f"Probability: {probability:.2f} -> Risk: {risk}")
    
def predict_landslide_risk(rainfall, soil_moisture):
    probability = logistic_model.predict_proba(
        [[rainfall, soil_moisture]]
    )[0][1]

    risk = get_risk_level(probability)

    return {
        "rainfall_24h_mm": rainfall,
        "soil_moisture": soil_moisture,
        "landslide_probability": round(probability, 3),
        "risk_level": risk
    }


# Test the final prediction function
result = predict_landslide_risk(180, 0.72)

print("\nFinal Prediction:")
print(result)
import joblib

# Save the trained model
joblib.dump(logistic_model, "landslide_model.pkl")

print("\nModel saved successfully!")
    