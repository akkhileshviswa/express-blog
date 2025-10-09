# Blog App Using Express JS And SUPABASE
- A full-stack blog application built using **Express.js**, **EJS templates**, **Supabase**, and **Passport.js**.  
- It supports **JWT-based authentication** and **Google Single Sign-On (SSO)**.

## Features
- **JWT-based login/signup** with username and password.
- **Google OAuth (SSO)** integration using Passport.js.
- Input validation via **Zod**.
- **Helmet.js** for secure HTTP headers.
- **CORS** configured for frontend origin.
- Cookies secured with httpOnly, sameSite, and secure flags.
- Credentials and posts are stored in supabase with Row Level Security enabled.
- Reusable EJS templates for both create and edit modes.

## Setup Instructions
```bash
git clone [https://github.com/akkhileshviswa/express-blog.git
cd blog_express
npm install
npm start
```
