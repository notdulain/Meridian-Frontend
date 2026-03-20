import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

if (!baseURL) {
  // Keep runtime explicit so missing env is caught early in non-local environments.
  // Local fallback keeps developer experience smooth.
  console.warn("NEXT_PUBLIC_API_URL is not set. Falling back to http://localhost:5050");
}

const apiClient = axios.create({
  baseURL: baseURL || "http://localhost:5050",
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
