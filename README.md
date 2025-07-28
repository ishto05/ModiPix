# 🎯 ModiPix — AI-Powered Image Moderation Microservice

ModiPix is a modular image moderation system designed to detect NSFW content in images using deep learning. Built using **Node.js** (Express) and **Python** (FastAPI), the system utilizes **NudeNet** as the core detection engine and streams image data securely between services.

> 🧠 This microservice is part of a larger vision for building a scalable, AI-powered video moderation platform.

---

🚀 **Features**

✅ MVP Features:

- Image Upload & NSFW Moderation (via Multer)
- Python-based FastAPI microservice running NudeNet
- Axios-based communication between Node.js and Python apps
- Cleanup of temporary files after processing
- Fully CORS-enabled for cross-service compatibility

---

🧠 **Additional Features (Planned)**

- Frontend interface for drag-and-drop image moderation
- Dashboard with moderation history
- Real-time logs & webhook callbacks
- Docker orchestration with volume mounts

---

🏗 **Tech Stack**

| Layer         | Tech                                     |
|---------------|------------------------------------------|
| Backend       | Node.js, Express.js                      |
| Microservice  | Python, FastAPI                          |
| Model         | NudeNet (pretrained)                     |
| Uploads       | Multer (DiskStorage)                     |
| API Comm      | Axios (Node ↔ Python)                    |
| Config        | dotenv for env management                |

---

📁 **Folder Structure**

```bash
modipix/
├── backend/
│   ├── node_modules/
│   ├── src/
│   │   ├── config/
│   │   │   └── env.config.js
│   │   ├── controllers/
│   │   │   └── uploads.controller.js
│   │   ├── middlewares/
│   │   │   └── multer.config.middleware.js
│   │   ├── routes/
│   │   │   └── moderation.routes.js
│   │   └── app.js
│   ├── uploads/                     # (ignored via .gitignore)
│   ├── .env.development.local
│   ├── eslint.config.js
│   ├── package-lock.json
│   └── package.json
├── modipix-microservice/
│   ├── src/
│   │   ├── config/
│   │   │   └── env_config.py
│   │   ├── controller/
│   │   │   └── moderation_controller.py
│   ├── temp/                        # (ignored via .gitignore)
│   ├── app.py
│   ├── requirements.txt
│   └── .env.development.local
├── .gitignore
|__ Readme.md

```

---

🛠 **Installation**

```bash
git clone https://github.com/ishto05/modipix.git
cd modipix
```

---
*Install Dependencies*

```bash
cd backend
npm install
```

```bash
cd ../modipix-microservice
pip install -r requirements.txt
```

---
⚙️ **Set up Environment Variables**

* Express.env *
```bash
PORT=3000
PYTHON_MICROSERVICE=http://localhost:8000
```

* Python.env *
```bash
ALLOWED_ORIGINS=http://localhost:3000
```
---

📦 **Docker Support (Planned)**

> Docker Compose setup to manage both Node + Python services in a shared network with volume bindings is planned for Phase 2.

---


### 🧪 Testing

Use Postman/ThunderClient or any other tools to test API endpoints.

#### 1. Upload Image for Moderation

- **POST** `http://localhost:3000/api/moderate`
- **Form-data**:
  - `image`: (select an image file)

#### 2. Microservice Endpoint (internal)

- **POST** `http://localhost:8000/moderate`
- FormData: `image` (used internally by backend using `axios`)

#### Responce 
```bash
{
  "success": true,
  "label": "unsafe",
  "confidence": 0.98
}
```
---

🧠 **Concepts**

- Image Moderation Flow:

- Express receives image via /moderate

- Image saved locally using Multer

- Axios streams the image buffer to FastAPI

- NudeNet processes and returns classification

- Temporary file is deleted after response


🔐 **CORS:**

- Allowed origins are managed through .env in Python service

- Express only accepts requests to specific endpoints for security

---

📌 **TODO (Upcoming)**

-  Frontend upload interface (React/Vite)

-  S3/GCS integration for persistent media

-  Docker Compose orchestration

-  Database integration for moderation logs

-  Unit tests for all components

---

✨ **Note**

- This project is a modular building block for a future AI-powered video content moderation system. Feedback, contributions, and ideas are welcome!
