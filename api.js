class ApiService {

  constructor() {
    this.base = "http://localhost:8080/quantity";
  }

  getToken() {
    return localStorage.getItem("token");
  }

  async request(endpoint, body) {
    try {
      const res = await fetch(this.base + endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + this.getToken()
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error("API Error");

      return await res.json();

    } catch (err) {
      throw err;
    }
  }

}

const api = new ApiService();