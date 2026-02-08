# 🌌 RuhVerse

> **Your Gateway to the Digital Universe**

RuhVerse is a modern, immersive web application designed to bring users into a vibrant digital ecosystem. Built with cutting-edge technologies, it features a sleek, responsive interface, secure authentication, and a dynamic dashboard for both regular users and administrators.

---

## ✨ Features

- **🚀 Modern UI/UX**: Crafted with React and Tailwind CSS for a premium, responsive feel.
- **🔐 Secure Authentication**: Powered by Supabase for safe and seamless Login/Signup experiences.
- **📱 Dashboard**: A personalized user dashboard to manage your digital presence.
- **🛠️ Admin Panel**: Dedicated administrative interface for platform management.
- **👤 Public Profiles**: Share your RuhVerse identity with the world.
- **⚡ Fast & Smooth**: Optimized with Vite and Framer Motion for buttery smooth animations.

---

## 🛠️ Tech Stack

**Frontend:**
- ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) **React**
- ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white) **Vite**
- ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white) **Tailwind CSS**
- ![Framer Motion](https://img.shields.io/badge/Framer-Motion?style=for-the-badge&logo=framer&logoColor=black) **Framer Motion**
- ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white) **Supabase**

**Backend:**
- ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) **Node.js**
- ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) **Express.js**

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Rahul-Bhardwaj-2108/RuhVerse.git
    cd RuhVerse
    ```

2.  **Install Frontend Dependencies**
    ```bash
    cd frontend
    npm install
    ```

3.  **Install Backend Dependencies**
    ```bash
    cd ../backend
    npm install
    ```

4.  **Environment Setup**
    Create a `.env` file in the `frontend` directory based on `.env.example`:
    ```bash
    cp frontend/.env.example frontend/.env
    ```
    *Fill in your Supabase credentials and other necessary API keys.*

### Running the App

1.  **Start the Backend Server**
    ```bash
    cd backend
    npm start
    ```

2.  **Start the Frontend Development Server**
    ```bash
    cd frontend
    npm run dev
    ```

3.  **Open your browser**
    Navigate to `http://localhost:5173` to view the app.

---

## 📂 Project Structure

```
RuhVerse/
├── frontend/          # React Frontend Application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Application pages (Home, Dashboard, etc.)
│   │   ├── context/     # State management (Authentication)
│   │   └── lib/         # Utility libraries (Supabase client)
│   └── ...
├── backend/           # Express Backend Server
│   ├── server.js        # Entry point
│   └── ...
└── ...
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Created with ❤️ by **Rahul Bhardwaj**
