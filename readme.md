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
CORS_ORIGIN=*
MONGO_URI=your_mongodb_connection_string

ACCESS_TOKEN_SECRET=your_jwt_access_secret
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=your_jwt_refresh_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

```


[- Models link](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)