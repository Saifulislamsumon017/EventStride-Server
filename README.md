# 🧠 Event Stride Server

**Event Stride Server** is the backend powerhouse of the Event Stride platform,
built with modern technologies like Express, MongoDB, JWT, and more. It manages
registration, authentication, secure data flow, and seamless API communication
with the frontend client.

---

## 🚀 Features

- ⚙️ **RESTful Express API**
- 🔐 **JWT Authentication**
- 🧾 **Cookie-Based Secure Tokens**
- 🌐 **CORS Configuration for Safe Cross-Origin Requests**
- 🧩 **MongoDB Native Driver Integration**
- 🔧 **Environment Variable Handling with dotenv**

---

## 🛠 Tech Stack

| Server          | Security & Auth     | Utilities       |
| --------------- | ------------------- | --------------- |
| Node.js v18+    | JWT (jsonwebtoken)  | dotenv          |
| Express v5.1.0  | Cookie-parser       | CORS            |
| MongoDB v6.17.0 | Access Token System | Modular Routing |

---

## 🚀 Tech Stack & Versions

- **Node.js** – ^18.x
- **Express** – ^5.1.0
- **MongoDB (Native Driver)** – ^6.17.0
- **jsonwebtoken** – ^9.0.2 _(JWT-based auth)_
- **cookie-parser** – ^1.4.7 _(cookie handling)_
- **cors** – ^2.8.5 _(CORS access)_
- **dotenv** – ^16.5.0 _(env variable handler)_

---

## 📁 Folder Structure

```bash
event-stride-server/
├── .env
├── index.js
├── package.json
├── routes/
│   └── registrationRoutes.js
├── controllers/
│   └── registrationController.js
├── middlewares/
│   └── verifyJWT.js
└── utils/
    └── dbConnect.js
```
