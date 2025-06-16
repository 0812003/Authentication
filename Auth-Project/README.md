📝 Notes App
A simple and secure web app that allows users to:
Register and login using email/password or Google OAuth
Add, view, and delete personal notes
Protect data with authentication using Passport.js
Store everything in MongoDB with Mongoose

🔐 Features
✅ User registration with hashed passwords (bcrypt)
✅ Google OAuth 2.0 login
✅ Persistent login sessions with Passport.js
✅ Add / View / Delete personal notes
✅ Flash messages for errors (e.g. wrong password, unregistered email)
✅ Responsive UI with Tailwind CSS

📦 Tech Stack
Frontend: EJS + Tailwind CSS
Backend: Node.js + Express
Database: MongoDB + Mongoose
Auth: Passport.js (Local & Google OAuth)

🚀 Getting Started
1. Clone the repo
git clone https://github.com/your-username/notes-app.git
cd notes-app

2. Install dependencies
npm install

3. Setup environment variables
Create a .env file:
PORT=3000
MONGO_URI=mongodb://localhost:27017/notesDB
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

💡 You can get your Google Client ID/Secret from the Google Developer Console

4. Run the app
node index.js
Visit: http://localhost:3000

🛡 Security Notes
Passwords are hashed using bcrypt
Google login uses secure OAuth2
Sessions stored safely using express-session

📬 Contact
Made by Soham Sangare
If you found this helpful, leave a ⭐ on the repo!
