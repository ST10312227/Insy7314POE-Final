#  The Vault — Banking App

![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue?logo=react)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green?logo=node.js)
![Database](https://img.shields.io/badge/Database-MongoDB-brightgreen?logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Status](https://img.shields.io/badge/Status-In%20Development-orange)


The **Vault** is a secure banking web application built using **React + Vite** for the frontend and **Node.js + MongoDB** for the backend.  
It supports **local and international payments**, **beneficiary management**, and **JWT authentication**.

---

# Features

-  Secure login & JWT-based authentication  
- Add & manage beneficiaries  
-  Local and international fund transfers  
-  Real-time form validation and feedback  
- Built with Vite for fast development  
-  RESTful API integration  
-  Clean, responsive design
  
## Tech Stack

**Frontend**
- React + Vite  
- React Router  
- Context API  
- Axios or Fetch wrapper  
- CSS (modularized per component)

**Backend**
- Node.js  
- Express.js  
- MongoDB (with Mongoose)  
- JWT Authentication


## Project Structure

```bash
vault/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LocalTransferBeneficiaries.jsx
│   │   │   ├── LocalTransferPassword.jsx
│   │   │   ├── InternationalPayments.jsx
│   │   ├── context/
│   │   │   ├── LocalTransferContext.jsx
│   │   │   ├── InternationalContext.jsx
│   │   ├── lib/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   │   └── international.svg
│   ├── index.html
│   └── vite.config.js
└── backend/
    ├── server.js
    ├── routes/
    ├── controllers/
    ├── models/
    └── config/
```
---

## Setup Instructions
1. Clone the Repository
```
git clone https://github.com/st10312227/INSY7314POE.git
cd vault
```

2. Install Dependencies
   
**Frontend**
```
cd frontend
npm install
```
**Backend**
```
cd ../backend
npm install
```
3. Environment Variables
   
Create .env files for both frontend and backend.

Frontend (frontend/.env)
```
VITE_API_BASE=http://localhost:5000/api
```
Backend (backend/.env)
```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/vault
JWT_SECRET=your_jwt_secret
```
4. Run the Application
   
Start Backend
```
cd backend
npm run dev
```
Start Frontend
```
cd frontend
npm run dev
```
Now open your browser at 👉 http://localhost:5173

## API Endpoints

**Authentication**
| Method | Endpoint             | Description              |
| ------ | -------------------- | ------------------------ |
| `POST` | `/api/auth/register` | Register new user        |
| `POST` | `/api/auth/login`    | Login user and get token |

**Local Payments**
| Method | Endpoint                            | Description                 |
| ------ | ----------------------------------- | --------------------------- |
| `GET`  | `/api/payments/local/beneficiaries` | Get all local beneficiaries |
| `POST` | `/api/payments/local/beneficiaries` | Add new beneficiary         |
| `POST` | `/api/payments/local/transfers`     | Perform a local transfer    |

**International Payments**
| Method | Endpoint                                    | Description                         |
| ------ | ------------------------------------------- | ----------------------------------- |
| `GET`  | `/api/payments/international/beneficiaries` | Get all international beneficiaries |
| `POST` | `/api/payments/international/beneficiaries` | Add new international beneficiary   |
| `POST` | `/api/payments/international/transfers`     | Perform international transfer      |

## Context Providers 

Wrap your app in both providers to ensure state persistence across components:

```
import { LocalTransferProvider } from "./context/LocalTransferContext";
import { InternationalProvider } from "./context/InternationalContext";

<LocalTransferProvider>
  <InternationalProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </InternationalProvider>
</LocalTransferProvider>
```
## Authentication Flow
1. User logs in via /api/auth/login.
2. Backend responds with a JWT token.
3. Token is stored in sessionStorage or localStorage.
4. Every request automatically attaches:

```
Authorization: Bearer <token>
```
5. Expired tokens prompt user to re-login.

## Screens

**Dashboard**

(Insert here)

Overview of Accounts

**Local Transfer**

(Insert here)

Add Beneficiaries, send local payments

**International Payments**

(Insert here)

Send Money abroad

**Settings**

(Insert here)

Manage profile and preferences

# Project Team

-  Kresen Naicker (ST102312227) 
-  Keenia Geemooi (ST10263301)
-  Thania Mathews (ST10381071)
-  Thando Fredericks (ST10187895)
