# 🎬 YouTube Backend

A **production-ready backend** built with **Node.js, Express, and MongoDB (Mongoose)** that replicates core features of YouTube.  
This project is designed with **scalability, modularity, and clean architecture (MVC)** in mind — a solid foundation for learning backend development and building real-world applications.  

---

## 🚀 Features  
- **User Management** – Sign up, login, JWT-based authentication, profile management  
- **Video Management** – Upload, update, delete, publish/unpublish videos  
- **Playlists** – Create, update, delete, and fetch playlists  
- **Likes & Comments** – Like/unlike videos, add/manage comments  
- **Subscriptions** – Subscribe/unsubscribe to channels, fetch subscribed channels  
- **Community Posts** – CRUD operations for posts  
- **Watch History** – Track user watch history  
- **File Uploads** – Handled with **Multer + Cloudinary**  
- **Error Handling** – Centralized error responses with `ApiError` & `ApiResponse`  
- **Production Practices** – Environment variables, middlewares, modular routes & controllers  

---

## 🛠️ Tech Stack  
- **Backend**: Node.js, Express.js  
- **Database**: MongoDB (Mongoose ODM)  
- **Authentication**: JWT (JSON Web Token)  
- **File Storage**: Cloudinary + Multer  
- **API Testing**: Postman (well-structured API collection included)  

---
## 📌 Getting Started 
### 1. Clone the repo:
```
git clone https://github.com/Ms-Solanki-07/YouTube-Backend

cd youtube-backend
```

### 2. Install dependencies:
```
npm install
```

### 3. Add your .env file with required variables:
```
PORT=8000
CORS_ORIGIN=* (only on development)
MONGO_URI=your_mongodb_connection_string

ACCESS_TOKEN_SECRET=your_jwt_access_secret
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=your_jwt_refresh_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

```

### 4. Run the server:
```
npm run dev
```

###  Server will start on:
```
http://localhost:8000
```

---
## 🔍 API Documentation

All API routes are tested and documented in Postman.

👉 Download Postman Collection
[Link ⤓](https://team88-8547.postman.co/workspace/Express-API~581f047c-e082-4a75-87d5-da9f0113b88c/collection/41667722-d701253a-ea46-4615-91b1-9784b4f9313c?action=share&creator=41667722&active-environment=41667722-70a4958e-cae3-44b5-a6d2-2e61fcfcba4a)

---

## 📊 Entity Relationship Diagram (ERD)

Here’s the database schema  designed using MongoDB (Mongoose):
[ERD Data Model Diagram](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)

---
## 🤝 Contributing

Contributions are welcome! 🎉
If you find a bug or have suggestions, please open an issue or create a pull request.

---

## 🎉 Connect with Me  

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/ms-solanki-07-ms/)  [![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://x.com/Ms_Solanki_07)  [![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Ms-Solanki-07)  [![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/ms_solanki_07)  

---

