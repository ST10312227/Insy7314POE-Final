#  The Vault — Banking App

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

---



# Project Team

-  Kresen Naicker (ST102312227) 
-  Keenia Geemooi (ST10263301)
-  Thania Mathews (ST10381071)
-  Thando Fredericks (ST10187895)
