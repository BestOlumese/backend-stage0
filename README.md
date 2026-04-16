# API Integration & Data Persistence - Stage 1

This is a backend service for Stage 1, expanding on Stage 0. It accepts a name, communicates concurrently with three external APIs (Genderize, Agify, Nationalize) for classification logic, and persists the payload securely in a SQLite database with idempotent properties. 

It provides four core CRUD endpoints compliant with exact response schemas and handles edge-cause external API failures gracefully.

## 🚀 Key Features

* **Concurrency:** Uses `Promise.all` to fetch Gender, Age, and Nationality endpoints simultaneously.
* **SQLite Persistence:** Uses zero-config SQLite (`sqlite3`) storing data locally, handling duplicates based on case-insensitive matches.
* **UUID v7 Identifiers:** Generates structurally sequential UUIDs (v7).
* **Idempotent Creations:** Duplicate incoming `name` parameters return HTTP 200 containing the existing db record instead of mutating the schema.
* **CORS Compatible:** Ensures `Access-Control-Allow-Origin: *` to satisfy remote grading scripts.
* **Rigorous Validation & Status Codes:** Thorough handling of 400 (Bad Requests), 422 (Unprocessable Entities), 404 (Not Found), and bespoke 502 logic for invalid external responses (e.g. `gender: null`, `age: null`, null country).

## 📡 Endpoints

### 1. Create Profile
**POST** `/api/profiles`
Request body: `{ "name": "ella" }`
Will orchestrate external data fetching or return an existing configuration idempotently. 

### 2. Get Single Profile
**GET** `/api/profiles/{id}`
Returns the specified `id` record with complete fetched probability, confidence, and nested details.

### 3. Get All Profiles (with filtering)
**GET** `/api/profiles?gender=female&age_group=adult`
Lists mapped profiles without meta probability details. Supports arbitrary query filtering by `gender`, `country_id`, and `age_group` (case insensitive).

### 4. Delete Profile
**DELETE** `/api/profiles/{id}`
Erases existing profile metadata. Returns 204 No Content.

## 💻 Local Development

1. Clone or download the repository.
2. Install dependencies (Requires Node 18+):
   ```bash
   npm install
   ```
3. Boot the local server (Port `3000` by default):
   ```bash
   npm start
   ```
4. Perform testing targeting `http://localhost:3000/api/profiles` with a POST JSON body `{ "name": "sample" }`.