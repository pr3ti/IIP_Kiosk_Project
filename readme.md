# 🌳 DP KIOSK - ESG Feedback & Digital Tree System

A digital kiosk system for collecting visitor feedback and displaying contributions on an interactive digital tree.

---

## 🚀 Quick Start for New Team Members

### First Time Setup (When Pulling from Git)

```bash
# 1. Clone repository
git clone <your-repo-url>
cd DP_KIOSK

# 2. Install dependencies
cd backend
npm install

# 3. Setup database & tables
cd Procedural_Orchestration_Module
node Datastore_Assembly.js
# Enter your MySQL root password when prompted

# 4. Hash passwords & encrypt existing data
node AuthLayer_Reconstitution.js

# 5. Start server
cd ..
node server.js
```

**That's it!** Visit `https://localhost:3000/feedback` to see it in action.

---

## 📋 Prerequisites

Before you begin, make sure you have these installed:

- **Node.js** v14 or higher → [Download](https://nodejs.org/)
- **MySQL Server** 8.0 or higher → [Download](https://dev.mysql.com/downloads/)
- **Git** → [Download](https://git-scm.com/)

### Verify Installation

```bash
# Check Node.js
node --version
# Should show: v14.x.x or higher

# Check npm
npm --version
# Should show a version number

# Check MySQL
mysql --version
# Should show: mysql Ver 8.0.x or higher
```

---

## 🗂️ Project Structure

```
DP_KIOSK/
├── backend/
│   ├── Procedural_Orchestration_Module/
│   │   ├── SystemicDataPlaneManifoldsValidatedTable.js 
│   │   ├── AuthLayer_Reconstitution.js                  
│   │   ├── Encrypted_Feedback_Simulation_Generator.js   
│   │   └── Purge_Actuator.js                           
│   ├── server.js              # Main server
│   ├── db.js                  # MySQL database connection
│   ├── auth.js                # Authentication middleware
│   ├── emailService.js        # Email functionality
│   ├── emailQueue.js          # Email queue management
│   ├── dataRetentionCleanup.js# GDPR data cleanup
│   ├── adminRoutes.js         # Admin API routes
│   ├── feedbackRoutes.js      # Feedback API routes
│   ├── treeRoutes.js          # Tree API routes
│   └── .env                   # Environment variables (create this)
├── database/
│   └── schema.sql             # MySQL database schema
├── frontend/
│   ├── feedback/
│   │   ├── feedback.html      # Feedback submission form
│   │   ├── feedback.js        # Frontend logic
│   │   └── feedback.css       # Styling
│   ├── admin/
│   │   ├── admin.html         # Admin dashboard
│   │   ├── admin.js           # Admin panel logic
│   │   └── admin.css          # Admin styling
│   └── tree/
│       ├── tree.html          # Digital tree visualization
│       ├── tree.js            # Tree rendering
│       └── tree.css           # Tree styling
├── assets/
│   ├── overlays/              # Photo overlay themes
│   │   ├── DesktopOverlay/
│   │   └── MobileOverlay/
│   └── Tree/                  # Tree images
└── uploads/
    ├── photos/                # Original photos
    └── processed/             # Photos with overlays
```

---

## 🛠️ Detailed Setup Instructions

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd DP_KIOSK
```

### Step 2: Install Dependencies

```bash
cd backend
npm install
```

This installs all required packages:
- express
- mysql2
- bcrypt
- crypto
- nodemailer
- dotenv
- and more...

### Step 3: Create Environment File

Create a `.env` file in the `backend` folder:

```bash
cd backend
touch .env
# or on Windows:
# type nul > .env
```

Add the following content to `.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=kiosk_user
DB_PASSWORD=kiosk123
DB_NAME=dp_kiosk_db

# Encryption Key (CRITICAL - 64 hex characters)
ENCRYPTION_KEY=73b7a3917d846546457cbd72ba22c2f9ab5668dd42d954843f713d778c85ce8d

# Server Configuration
PORT=3000
NODE_ENV=development

# Email Configuration (optional - for sending feedback emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

⚠️ **IMPORTANT:** Never commit the `.env` file to git!

### Step 4: Setup Database (CRITICAL STEP)

Navigate to the Procedural_Orchestration_Module folder and run the database setup:

```bash
cd backend/Procedural_Orchestration_Module
node SystemicDataPlaneManifoldsValidatedTable.js
```

**What this script does:**
1. Creates database `dp_kiosk_db`
2. Creates user `kiosk_user` with password `kiosk123`
3. Creates all 8 required tables
4. Adds archive management (auto-archive feedback >3 months old)
5. Enables MySQL Event Scheduler
6. Inserts sample data (admin user, overlays, demo questions)

**You will be prompted for:**
- MySQL root password (your MySQL installation password)

**Expected output:**
```
╔═══════════════════════════════════════════════════╗
║     DP KIOSK - AUTOMATED DATABASE SETUP          ║
╚═══════════════════════════════════════════════════╝

This script will:
  ✓ Create database: dp_kiosk_db
  ✓ Create user: kiosk_user (password: kiosk123)
  ✓ Create all tables
  ✓ Add archive_status column for feedback management
  ✓ Set up automatic archiving (3-month threshold)
  ✓ Insert sample data (overlays, questions, admin user)
  ✓ Enable event scheduler for auto-archiving
  ✓ Verify everything is working

Enter your MySQL root password: [enter password]

📡 [1/8] Connecting to MySQL as root...
    ✅ Connected successfully!

[... continues through all 8 steps ...]

╔═══════════════════════════════════════════════════╗
║              🎉 SETUP COMPLETE! 🎉               ║
╚═══════════════════════════════════════════════════╝
```

### Step 5: Run Security Migration (CRITICAL STEP)

Still in the Procedural_Orchestration_Module folder, run:

```bash
node AuthLayer_Reconstitution.js
```

**What this script does:**
1. Hashes all plain-text passwords using bcrypt
2. Encrypts all plain-text emails using AES-256-GCM
3. Ensures your data is secure

**Expected output:**
```
🔄 Starting database migration...

📡 Connecting to MySQL database...
✅ Connected successfully!

📋 Step 1: Migrating admin passwords...
Found 1 admin users to check
🔄 Hashing password for user: systemadmin
✅ Updated 'systemadmin'

📊 Password Migration Summary:
   ✅ Already hashed: 0
   🔄 Newly migrated: 1
   ❌ Errors: 0

📋 Step 2: Migrating user emails...
⚠️  No users with emails found

✅ Migration complete!
```

### Step 6: Start the Server

```bash
cd .. # Go back to backend folder
node server.js
```

**Expected output:**
```
✅ Connected to MySQL database: dp_kiosk_db

🌐 FEEDBACK KIOSK SERVER
═══════════════════════════════════════════════════
   📍 Local IP: 192.168.x.x
   🔗 HTTPS URL: https://192.168.x.x:3000
   🔗 HTTP URL:  http://192.168.x.x:3000
═══════════════════════════════════════════════════

🧹 DATA RETENTION CLEANUP SYSTEM
⏰ Cleanup Schedule:
   1. On server startup (in 5 seconds)
   2. Every 6 hours while running
   3. Manual trigger via admin panel
```

---

## 🎯 Access the Application

Once the server is running, open your browser and visit:

| Page | URL | Purpose |
|------|-----|---------|
| **Feedback Form** | `https://localhost:3000/feedback` | Visitor feedback submission |
| **Admin Panel** | `https://localhost:3000/admin` | System management |
| **Digital Tree** | `https://localhost:3000/tree` | Tree visualization |

### Default Admin Credentials

```
Username: systemadmin
Password: SystemAdmin123!
```

⚠️ **IMPORTANT:** Change this password after first login!

---

## 🔧 Configuration

### Database Connection

Default credentials (local development):
- **Host:** localhost
- **User:** kiosk_user
- **Password:** kiosk123
- **Database:** dp_kiosk_db

These are set by `SystemicDataPlaneManifoldsValidatedTable.js` during setup.

### Email Configuration (Optional)

To enable email functionality, update `backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

For Gmail, create an [App Password](https://support.google.com/accounts/answer/185833).

---

## 📊 What's in the Database?

After running `SystemicDataPlaneManifoldsValidatedTable.js`, you'll have:

### Tables Created (8 total)
1. **users** - Visitor information with encrypted emails
2. **feedback** - Feedback submissions with archive management
3. **questions** - Dynamic feedback questions
4. **question_options** - Question choices (for multiple choice)
5. **feedback_answers** - User responses to questions
6. **admin_users** - Admin accounts with hashed passwords
7. **audit_logs** - System activity tracking
8. **overlays** - Photo overlay themes

### Sample Data Included
- ✅ **1 Admin User** (systemadmin / SystemAdmin123!)
- ✅ **6 Photo Overlay Themes** (Nature, Ocean, Energy, Recycle, Tech, Cute)
- ✅ **3 Demo Questions** (Rating, Text, Multiple Choice)
- ✅ **Archive Management** (Auto-archives feedback >3 months old)

---

## 🎓 Understanding the Setup Scripts

### SystemicDataPlaneManifoldsValidatedTable.js
**Purpose:** Complete database initialization
**When to run:** First time setup, or to reset database
**What it does:**
- Creates MySQL database and user
- Loads schema.sql and creates all tables
- Adds archive management features
- Enables event scheduler for auto-archiving
- Inserts initial data (admin, overlays, questions)

### AuthLayer_Reconstitution.js
**Purpose:** Security migration for existing data
**When to run:** After database setup, or if you have plain-text data
**What it does:**
- Hashes all plain-text passwords with bcrypt
- Encrypts all plain-text emails with AES-256-GCM
- Makes your data secure

**Note:** This is safe to run multiple times - it checks if data is already encrypted/hashed.

---

## 🧪 Testing Your Setup

### Quick Test Checklist

- [ ] Server starts without errors
- [ ] Can access feedback form at `https://localhost:3000/feedback`
- [ ] Can login to admin panel at `https://localhost:3000/admin`
- [ ] Can view digital tree at `https://localhost:3000/tree`
- [ ] Feedback submission works
- [ ] Photo upload works
- [ ] Email sending works (if configured)
- [ ] Admin panel shows data
- [ ] Archive tab exists in admin panel

### Generate Test Data (Optional)

Want to populate your database with test data?

```bash
cd backend/Procedural_Orchestration_Module
node Encrypted_Feedback_Simulation_Generator.js
```

This creates:
- 500 test feedback entries
- 500 test users with encrypted emails
- Mix of archived and active feedback
- Data distributed over 12 months

---

## 🆘 Troubleshooting

### Issue: "Error: connect ECONNREFUSED"

**Problem:** MySQL server not running

**Solution:**
```bash
# Windows: Services → MySQL80 → Start
# Mac:
brew services start mysql
# Linux:
sudo systemctl start mysql
```

### Issue: "Access denied for user 'kiosk_user'"

**Problem:** Database setup didn't complete

**Solution:**
```bash
cd backend/Procedural_Orchestration_Module
node SystemicDataPlaneManifoldsValidatedTable.js
# Enter MySQL root password
```

### Issue: "Port 3000 already in use"

**Problem:** Another process is using port 3000

**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Issue: "Cannot find module 'mysql2'"

**Problem:** Dependencies not installed

**Solution:**
```bash
cd backend
npm install
```

### Issue: "ENCRYPTION_KEY not found"

**Problem:** `.env` file missing or incorrect

**Solution:**
1. Create `backend/.env` file
2. Add the encryption key (see Step 3 above)
3. Make sure it's exactly 64 characters

### Issue: Admin login fails

**Problem:** Password might not be hashed yet

**Solution:**
```bash
cd backend/Procedural_Orchestration_Module
node AuthLayer_Reconstitution.js
```

---

## 📝 Common Operations

### Starting the Server
```bash
cd backend
node server.js
```

### Stopping the Server
Press `Ctrl + C` in the terminal

### Resetting Database (Fresh Start)
```bash
cd backend/Procedural_Orchestration_Module
node SystemicDataPlaneManifoldsValidatedTable.js
node AuthLayer_Reconstitution.js
```

### Pulling Latest Changes
```bash
git pull origin main
cd backend
npm install  # Install any new dependencies
# If schema changed:
cd Procedural_Orchestration_Module
node SystemicDataPlaneManifoldsValidatedTable.js
```

### Checking Database Contents
```bash
mysql -u kiosk_user -p
# Password: kiosk123

USE dp_kiosk_db;
SHOW TABLES;
SELECT * FROM admin_users;
SELECT * FROM feedback;
```

---

## 🎯 Features

### For Visitors
- ✅ Submit feedback through interactive form
- ✅ Take photos with themed overlays
- ✅ Make pledges displayed on digital tree
- ✅ Receive email with commemorative photo
- ✅ Choose data retention period (7 days or indefinite)

### For Administrators
- ✅ View all feedback submissions
- ✅ Manage questions dynamically
- ✅ Monitor system statistics
- ✅ Download data as Excel
- ✅ View audit logs
- ✅ Manage photo overlay themes
- ✅ User management with role-based access
- ✅ Archive management (auto-archive >3 months)

### Privacy & Security
- ✅ GDPR-compliant data retention
- ✅ Automatic data cleanup after retention period
- ✅ Encrypted email storage (AES-256-GCM)
- ✅ Hashed passwords (bcrypt with 12 rounds)
- ✅ Role-based access control
- ✅ Audit logging for all admin actions

---

## 🔐 Security Best Practices

### Local Development (✅ Safe)
- Uses default credentials (kiosk_user/kiosk123)
- Data stored locally
- Self-signed SSL certificates

### Production Deployment (⚠️ Important!)
Before deploying to production:
- [ ] Change database credentials in `.env`
- [ ] Change admin password via admin panel
- [ ] Use environment variables for all secrets
- [ ] Get proper SSL certificate (Let's Encrypt)
- [ ] Enable firewall rules
- [ ] Set up regular database backups
- [ ] Update dependencies regularly
- [ ] Review and update ENCRYPTION_KEY
- [ ] Enable HTTPS only
- [ ] Configure proper CORS settings

---

## 📚 Documentation

- **INSTALLATION_CHECKLIST.md** - Detailed setup with checkboxes
- **QUICK_REFERENCE_DATABASE.md** - SQL queries and commands
- **TROUBLESHOOTING_GUIDE.md** - Solutions for common issues
- **PACKAGE_SUMMARY.md** - Complete system overview
- **SYSTEM_FLOW_DIAGRAM.md** - Visual architecture
- **schema.sql** - Complete database structure

---

## 🤝 Team Workflow

### Daily Development
```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
cd backend
npm install

# 3. Start server
node server.js

# 4. Make your changes

# 5. Test thoroughly

# 6. Commit and push
git add .
git commit -m "Description of changes"
git push origin your-branch
```

### When Schema Changes
If the database schema was updated:
```bash
# Re-run database setup
cd backend/Procedural_Orchestration_Module
node SystemicDataPlaneManifoldsValidatedTable.js
```

### Adding New Team Members
1. Send them this README
2. Have them follow "Quick Start for New Team Members"
3. Verify they can:
   - Start the server
   - Access all pages
   - Login to admin panel

---

## 🎓 Learning Path

### Day 1: Setup
- Follow Quick Start guide
- Get everything running
- Explore the feedback form

### Day 2: Understanding
- Review project structure
- Explore admin panel
- Check database tables

### Day 3: Development
- Make a small change
- Test it locally
- Commit and push

---

## 📞 Getting Help

### Before Asking for Help
1. Check this README
2. Review TROUBLESHOOTING_GUIDE.md
3. Check server logs (terminal output)
4. Verify MySQL is running
5. Confirm all setup steps completed

### Common Questions

**Q: Do I need to run setup scripts every time?**
A: No! Only run once during first-time setup, or when resetting database.

**Q: What's the difference between the two setup scripts?**
A: 
- `SystemicDataPlaneManifoldsValidatedTable.js` - Creates database and tables
- `AuthLayer_Reconstitution.js` - Secures existing data

**Q: Can I use a different database name?**
A: Yes, but update it in both the setup script and `.env` file.

**Q: How do I add more admin users?**
A: Through the admin panel → User Management (after first login).

**Q: Where are uploaded photos stored?**
A: `uploads/photos/` (original) and `uploads/processed/` (with overlays).

---

## 🎉 You're Ready!

If you've completed all setup steps:
- ✅ Database is created and populated
- ✅ Data is encrypted and secure
- ✅ Server is running
- ✅ You can access all pages
- ✅ You can login to admin panel

**Welcome to the team! Happy coding! 🚀**

---

**Project Version:** 2.0 (MySQL with Archive Management)  
**Last Updated:** December 2025  
**Maintained by:** [Your Team Name]

**Questions?** Check the documentation folder or ask in team chat.