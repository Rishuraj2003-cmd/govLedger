# Bihar Government Fund Tracking Portal

A full-stack Web3 transparency platform for the Government of Bihar with:

- mandatory login before access
- public user and admin workflows
- OTP-based email verification
- forgot password with OTP reset
- Google sign-in support hook
- MetaMask wallet connection
- MongoDB persistence for users, projects, transactions, and announcements
- bilingual-ready responsive UI with Hindi and English switching
- Solidity contract support for blockchain-backed fund events

## Main capabilities

- Users can create accounts with first name, last name, mobile number, email, city, district, state, password, and confirm password.
- Email verification is done with OTP before login.
- Admin can create additional user accounts for district, department, contractor, vendor, or public roles.
- Admin can create projects, post announcements, allocate funds, and record transfers.
- Whatever admin records becomes visible in the logged-in user dashboard.
- Users can switch interface language between English and Hindi.
- Users can connect MetaMask and store wallet addresses with their account.

## Tech stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Authentication: JWT + bcrypt + OTP email verification
- Google login: Google OAuth frontend + backend token verification
- Wallet: MetaMask via `window.ethereum`
- Smart contracts: Solidity + Hardhat

## Project structure

- `frontend/` responsive web app
- `backend/` API server, auth, MongoDB models, OTP email logic
- `contracts/` Solidity contract and Hardhat scripts

## Setup

### 1. Install dependencies

```bash
npm install
npm install --workspace frontend
npm install --workspace backend
npm install --workspace contracts
```

### 2. Create environment files

Copy the examples below into:

- `backend/.env`
- `frontend/.env`

### `backend/.env`

```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/bihar-fund-tracker
JWT_SECRET=replace_with_secure_secret
CORS_ORIGIN=http://localhost:5173

# Required SMTP for OTP emails
SMTP_SERVICE=Gmail
SMTP_HOST=
SMTP_PORT=
SMTP_USER=yourgmail@gmail.com
SMTP_PASS=your_google_app_password
MAIL_FROM=yourgmail@gmail.com

# Optional Google login verification
GOOGLE_CLIENT_ID=

# Optional blockchain live mode
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=
CONTRACT_ADDRESS=
CHAIN_ID=31337
```

### `frontend/.env`

```env
VITE_API_URL=http://localhost:4000/api
VITE_GOOGLE_CLIENT_ID=
VITE_CHAIN_ID=31337
VITE_CONTRACT_ADDRESS=
```

## MongoDB

The backend now expects MongoDB.

Options:

1. Use local MongoDB:

```bash
mongod
```

2. Or use MongoDB Atlas and place the Atlas connection string in `MONGODB_URI`.

## Running the app

### Backend

```bash
npm run dev --workspace backend
```

### Frontend

```bash
npm run dev --workspace frontend
```

Then open:

- frontend: `http://localhost:5173`
- backend: `http://localhost:4000/api`

## Authentication flow

### First admin

- If no admin exists, the auth screen shows a `Create First Admin` option.
- Use that once to create the first Bihar portal admin.

### Public signup

1. Create account
2. Receive OTP by email
3. Verify OTP
4. Login
5. Access portal

### Password reset

1. Enter email
2. Receive OTP
3. Enter OTP and new password

### Google login

Google sign-in is wired in, but it needs a valid `GOOGLE_CLIENT_ID` in backend and frontend env files.

### OTP emails

- OTP is now sent only to the entered email address through SMTP.
- If SMTP is not configured correctly, OTP sending fails instead of printing in the terminal.
- For Gmail, use `SMTP_SERVICE=Gmail`, your Gmail address in `SMTP_USER`, and a Google app password in `SMTP_PASS`.

## Smart contract workflow

From the `contracts/` folder:

```bash
npm run compile
```

Start local chain:

```bash
npx hardhat node
```

Deploy contract:

```bash
npm run deploy:local
```

## Key API groups

- `/api/auth/*` authentication, OTP, login, Google login, wallet update
- `/api/projects` project creation and listing
- `/api/projects/:id/allocate` fund allocation
- `/api/projects/:id/transfer` fund transfer
- `/api/announcements` public notices
- `/api/users` admin user management
- `/api/overview` logged-in dashboard data

## Current notes

- Login is required before any dashboard access.
- The UI supports bilingual switching, but project names and admin-entered content are shown as entered by admins.
- Google login requires env configuration before it can be used live.
- MetaMask connection is implemented and stored on the user profile.
- Blockchain transactions fall back to mock-chain mode if RPC details are not configured.
