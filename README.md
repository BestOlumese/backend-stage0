# API Integration & Data Processing - Stage 0

A lightweight Node.js/Express GET endpoint that integrates with the external Genderize API, processes the raw response based on specific logic, and returns a structured JSON result.

## 🚀 Live Endpoint

`GET https://best-backend-stage0.vercel.app/api/classify?name=john`

## ⚙️ Features & Processing Rules

* **External Integration:** Calls the Genderize API to determine gender based on a name.
* **Data Transformation:** Renames the upstream `count` field to `sample_size`.
* **Confidence Logic:** Computes an `is_confident` boolean. Returns `true` **only** if `probability >= 0.7` AND `sample_size >= 100`.
* **Timestamps:** Injects a dynamic `processed_at` timestamp formatted in UTC ISO 8601.
* **CORS Enabled:** Includes `Access-Control-Allow-Origin: *` to pass automated grading scripts.

## 🛠️ Error Handling

The API strictly adheres to the following error structures:

* **400 Bad Request:** Thrown when the `name` parameter is missing or empty.
* **422 Unprocessable Entity:** Thrown if the `name` parameter is not a valid string.
* **404 Not Found (Edge Case):** Thrown if the Genderize API returns `gender: null` or `count: 0` (Message: `"No prediction available for the provided name"`).
* **500/502 Server Error:** Handles upstream external API timeouts or internal crashes.

## 💻 Local Development

1. Clone the repository.
2. Run `npm install` to install dependencies (Express, Cors, Axios).
3. Run `npm start` to boot the local server on port 3000.
4. Test the endpoint: `http://localhost:3000/api/classify?name=john`