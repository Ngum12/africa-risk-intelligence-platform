from locust import HttpUser, task, between
import random

class MLModelUser(HttpUser):
    wait_time = between(1, 3)

    @task
    def predict_risk(self):
        payload = {
            "country": "Nigeria",
            "admin1": "Kaduna",
            "event_type": "Violence against civilians",
            "actor1": "Boko Haram",
            "latitude": 10.2 + random.random(),
            "longitude": 7.4 + random.random(),
            "year": 2025
        }
        self.client.post("/predict", json=payload)
