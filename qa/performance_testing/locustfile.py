from locust import HttpUser, task, between

class CognivueXUser(HttpUser):
    wait_time = between(1, 2)
    @task
    def load_dashboard(self):
        self.client.get("/")
