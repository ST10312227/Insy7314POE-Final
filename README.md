# The Vault Banking App

<img width="300" height="300" alt="logo" src="https://github.com/user-attachments/assets/0bbafbbb-335e-450f-8390-2ccaf8b1ad37" />

![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue?logo=react)  ![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green?logo=node.js)
![Database](https://img.shields.io/badge/Database-MongoDB-brightgreen?logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Status](https://img.shields.io/badge/Status-In%20Development-orange)

## Application Overview

**Vault** is a modern digital banking application built with React + Vite, Node.js, and MongoDB that provides a seamless experience for managing both local and international financial transactions. The app replicates the core features of an online banking system while focusing on usability, security, and performance.

Users can easily send money locally, make international payments, and manage beneficiaries — all from a unified dashboard. Vault’s secure backend architecture ensures that every transaction is authenticated and verified before processing, while the frontend offers clear guidance and feedback for each step of the user’s journey.

### Core Features and Functionality

- **Secure Login System**
  - User authentication using email and password.
  - Session-based access to sensitive pages and transactions.

- **Local Fund Transfers**
  - Add and manage local beneficiaries.
  - Make once-off or recurring transfers.
  - Validate beneficiary details and account information before confirming payment.
  - Password-protected payment confirmation for extra security.

- **International Payments**
  - Initiate payments to beneficiaries in other countries.
  - Store SWIFT and IBAN details for future transfers.
  - Manage both sending and receiving of international funds.

- **Beneficiary Management**
  - Add, view, edit, or delete saved beneficiaries.
  - Categorize beneficiaries as local or international.
  - Search and filter through existing beneficiaries.

- **Payment Confirmation & Validation**
  - Real-time validation of account numbers, branch codes, and payment references.
  - Display of clear success and error messages during the transfer process.
  - Redirects to the appropriate summary or beneficiary page upon successful transactions.

- **Transaction Overview**
  - Review past and pending transactions.
  - View payment status, type (EFT/Real-time), and related references.

- **Additional Features**
  - Responsive design for desktop and mobile users.
  - Integration with custom API endpoints for handling payments, beneficiaries, and authentication.
  - Error-handling mechanisms to prevent data loss or duplicate submissions.

  
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

## Home Page:



<img width="600" height="650" alt="image" src="https://github.com/user-attachments/assets/1dd5f094-7370-4951-89f8-c2bca8b30589" />

## Log In Page:



<img width="600" height="650" alt="image" src="https://github.com/user-attachments/assets/1bc00236-3b04-40b7-a26f-165acdccb977" />

## Create Account Page:



<img width="600" height="650" alt="image" src="https://github.com/user-attachments/assets/fd0de8e1-52ea-4be1-b2cd-649c38c4cfe4" />


Overview of Accounts



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
