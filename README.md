# 🌍 Africa Risk Intelligence Platform

A real-time, AI-powered, full-stack intelligence system that predicts and visualizes conflict and disaster risks across Africa — built for governments, humanitarian agencies, and decision-makers.

---

## ✨ Key Features

- ✅ Machine learning conflict prediction model (Random Forest)
- ✅ Retraining engine (Upload CSV → update model + metrics)
- ✅ Real-time prediction API (FastAPI)
- ✅ React frontend with:
  - 📍 Interactive map
  - 📈 Risk dashboards
  - 🔁 Retraining interface
  - 📰 Media tension signals (free NLP)
- ✅ AI-generated recommendations + scenario simulations
- ✅ Locust load testing
- ✅ IBM Cloud deployment ready (Dockerized backend & frontend)

---

## 📁 Project Structure

```
africa-risk-intelligence-platform/
├── backend/               # FastAPI backend with model, retraining, media NLP
├── frontend/              # React frontend (Tailwind, Recharts, MapLibre)
├── data/                  # Training/testing sets
├── locust/                # Load testing script
├── Dockerfile.api         # Backend container
├── Dockerfile.web         # Frontend container
├── docker-compose.yml     # Local test runner
├── conflict_model_final.pkl
├── africa_conflict_risk_model_pro_v2.ipynb
└── README.md              # You're here
```

---

## 🛠 How to Run (Local)

```bash
docker-compose up --build
```
Frontend: `http://localhost:5173`  
Backend: `http://localhost:8000/docs`

---

## ⚡ Load Test

```bash
locust -f locust/locustfile.py --host=http://localhost:8000
```
Dashboard: `http://localhost:8089`

---

## ☁️ IBM Cloud Deployment

- Deploy backend using `Dockerfile.api` → IBM Code Engine
- Deploy frontend using `Dockerfile.web` or host static `/dist`
- Use `deploy_to_ibm.sh` for scripted deployment

---

## 📊 Evaluation Summary

| Metric     | Status |
|------------|--------|
| Accuracy   | ✅     |
| Precision  | ✅     |
| Recall     | ✅     |
| F1 Score   | ✅     |
| Live Prediction | ✅ |
| Retraining | ✅     |
| Visual Dashboard | ✅ |
| Media NLP Detection | ✅ |
| Cloud Deployment Ready | ✅ |
| Load Tested | ✅     |

---

## 🎥 Demo Video

📽️ [Insert YouTube link here]

---

## 👨‍💻 Built With

- Python, scikit-learn, FastAPI, TextBlob, newspaper3k
- React, TailwindCSS, Recharts, MapLibre
- Docker, IBM Cloud Code Engine, Locust

---

## 🤝 License

Open-source and free to use for humanitarian, research, and government purposes.
