# 🎯 ModiPix — AI-Powered Image Moderation Microservice

ModiPix is a modular image moderation system designed to detect NSFW content in images using deep learning. Built using ##Node.js## (Express) and ##Python## (FastAPI), the system utilizes ##NudeNet## as the core detection engine and streams image data securely between services.

> 🧠 This microservice is part of a larger vision for building a scalable, AI-powered video moderation platform.

---

🚀 ##Current Features (Phase 1 Complete)##

- Image Upload & NSFW Moderation (via Multer)
- Python-based FastAPI microservice running NudeNet
- Axios-based communication between Node.js and Python apps
- Cleanup of temporary files after processing
- Fully CORS-enabled for cross-service compatibility
- Docker Compose setup to run Node + Python in isolated services

---

🧠 ##Planned (Phase 2 & 3)##

- Frontend interface for drag-and-drop image moderation
- Dashboard with moderation history
- Real-time logs & webhook callbacks
- Persistent media storage (S3/GCS)
- Database integration for moderation metadata

---

🏗 ##Tech Stack##

| Layer         | Tech                                     |
|---------------|------------------------------------------|
| Backend       | Node.js, Express.js                      |
| Microservice  | Python, FastAPI                          |
| Model         | NudeNet (pretrained)                     |
| Uploads       | Multer (DiskStorage)                     |
| API Comm      | Axios (Node ↔ Python)                    |
| Config        | dotenv                                   |
| Docker        | Docker Compose (multi-container setup)   |

---

📁 ##Folder Structure##

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
├── docker-compose.yml
├── .gitignore
└── README.md

---

##🛠 Installation##

```bash
git clone https://github.com/ishto05/modipix.git
cd modipix
```
---

#🔧 Local Dev (Without Docker)#

```bash
# Backend
cd backend
npm install

# Microservice
cd ../modipix-microservice
pip install -r requirements.txt
```
---

##🐳 Docker Setup (Complete Phase 1 )##

```bash
# Build containers (no-cache optional)
docker compose build --no-cache

# Run services
docker compose up

```

---

##⚙️ Environment Variables##
```bash
# backend/.env.development.local
PORT=3000
PYTHON_MICROSERVICE=http://moderation_service:8000

# modipix-microservice/.env.development.local
ALLOWED_ORIGINS=http://localhost:3000

```

---

##📦 API Testing##

-Use Postman/ThunderClient:

1. Upload Image for Moderation

```bash
POST http://localhost:3000/api/moderate
Form-Data:
  image: <image_file>
```

2. Internal Python Endpoint (via backend)
```bash
POST http://localhost:8000/moderate
Form-Data:
  image: <image_file>
```

Example response:
```bash
{
  "success": true,
  "label": "unsafe",
  "confidence": 0.98
}
```
---

##🔐 Security Notes##

CORS is restricted via .env config

Axios uses internal Docker DNS to communicate securely

Uploaded files and temp files are auto-deleted after processing

---

##📌 Next Steps##

🧑‍🎨 Frontend (React + Vite)

☁️ Cloud media storage

🧾 Moderation log database

✅ Unit testing for all routes & services

---

##✨ Note##
This project is a modular building block for an AI-powered content moderation suite. Contributions and feedback welcome!

---