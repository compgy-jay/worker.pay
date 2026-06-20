================================================================
  ProjectHub v1.0.0 - Offline Project Management System
================================================================

WHAT IS PROJECTHUB?
-------------------
ProjectHub is a complete project management and cost tracking
system for managing teams, materials, budgets, and project
resources. It runs entirely offline using a local SQLite database
- no internet connection or cloud services required.

SYSTEM REQUIREMENTS
-------------------
- Node.js 18 or later (download from https://nodejs.org/)
- Any operating system: Windows, macOS, or Linux
- No internet connection needed after installation
- No database server required (uses local SQLite)

FEATURES
--------
- Team member management with roles and departments
- Weekly wage/labor cost tracking with paid/unpaid status
- Material and supply procurement tracking
- Budget monitoring with visual progress indicators
- World currency support (54+ currencies, default: KES)
- CSV export for wages and materials
- Print-ready reports
- Admin authentication with password protection
- Complete offline operation

INSTALLATION
------------
1. Install Node.js 18+ from https://nodejs.org/
2. Extract this archive to any folder on your computer
3. Start the app:
   - Windows: Double-click start.bat
   - macOS/Linux: Open terminal in this folder and run:
     ./start.sh

4. Open your browser to: http://localhost:3000

FIRST-TIME LOGIN
----------------
- Username: Admin
- Password: newday

Change the password immediately via the Settings > Admin
Management section.

CONFIGURATION
-------------
- Change currency, project name, and budget in Settings
- Choose from 54+ world currencies (KES default for Kenya)
- All data is stored locally in the local.db SQLite file
- Export data as CSV or print reports anytime

PORTABLE USAGE
--------------
The entire application runs from a single folder:
- No installation required (just extract and run)
- No registry changes
- No admin privileges needed
- Data is stored in the local.db file within this folder
- To back up, simply copy the entire folder or just local.db

TROUBLESHOOTING
---------------
"Node.js not found" - Install Node.js from https://nodejs.org/
"Port 3000 in use" - Set PORT environment variable before starting
  Windows: set PORT=3001 && start.bat
  Unix: PORT=3001 ./start.sh
"Database errors" - Delete local.db and restart to create a fresh DB
================================================================