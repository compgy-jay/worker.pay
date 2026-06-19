# ProjectHub

**Professional Project Management & Cost Tracking Platform**

ProjectHub is a comprehensive project management system designed for project managers and team leads managing construction projects, facility work, or any labor-intensive initiatives. It enables centralized tracking of team members, labor costs, material procurement, payment status, project budgets, and financial reporting—all in one intuitive dashboard.

## ✨ Key Features

- **Team Management**: Maintain a comprehensive team roster with departments, contact information, and organizational structure
- **Labor Cost Tracking**: Record and track weekly labor costs with payment status (paid/pending), history, and worker details
- **Material & Supply Management**: Manage material procurement with supplier tracking, categorization, quantities, units, and detailed costing
- **Budget Monitoring**: Real-time budget overview with spent vs. allocated tracking, budget utilization percentage, and financial health indicators
- **Advanced Filtering & Search**: Filter data by date range, team member, payment status, category, and full-text search across records
- **Financial Reports**: Export comprehensive CSV reports for labor costs and materials for auditing, accounting, and stakeholder reporting
- **Project Dashboard**: Centralized dashboard with key performance metrics, pending payments, recent expenses, and project health indicators
- **Data Persistence**: Secure SQLite database with support for custom data storage paths and regular backups
- **Print Reports**: Generate and print project reports for documentation and distribution

## 🚀 Quick Start

### Installation & Development

```bash
# Clone and install
cd project-hub
npm install

# Start development server
npm run dev
```

Access the application at `http://localhost:3000`. The app is fully functional with test data immediately available.

### Production Deployment

```bash
# Verify code quality
npm run lint

# Build optimized version
npm run build

# Start production server
npm run start
```

## 📋 System Requirements

- **Node.js**: 18.x or later
- **Package Manager**: npm 9+ or yarn 3+
- **Disk Space**: Minimum 100MB (includes Node modules, database, and logs)
- **OS**: Windows, macOS, or Linux
- **Browser**: Modern browser with ES2020 support (Chrome, Firefox, Safari, Edge)

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

| Document | Purpose | Audience |
|----------|---------|----------|
| **[Getting Started Guide](./docs/GETTING_STARTED.md)** | Setup, initial configuration, first steps | New users |
| **[Quick Reference](./docs/QUICK_REFERENCE.md)** | Common tasks, shortcuts, troubleshooting | All users |
| **[API Reference](./docs/API_REFERENCE.md)** | Complete endpoint documentation, examples | Developers |
| **[Configuration Guide](./docs/CONFIGURATION.md)** | Deployment, environment, security, scaling | DevOps, Admins |
| **[Architecture Overview](./docs/ARCHITECTURE.md)** | System design, database schema, tech stack | Developers, Architects |
| **[Changelog](./CHANGELOG.md)** | Version history, features, updates | Everyone |

## 🗄️ Data Management

### Database

ProjectHub uses SQLite for reliable local data storage:

- **Default Location**: `data.db` in project root
- **Automatic Files**: `.db-shm` and `.db-wal` (shared memory and write-ahead log)
- **Version Control**: Database files are excluded from git

### Custom Database Path

For production deployments or network storage:

```bash
# Set environment variable before starting app
export PROJECT_HUB_DB_PATH=/var/data/project-hub/database.db
npm run start
```

### Backup Strategy

**Critical**: Implement regular database backups, especially in production:

```bash
# Simple daily backup
cp data.db data.db.backup.$(date +%Y%m%d)
```

Include all three database files in backups:
- `data.db` (main database)
- `data.db-shm` (shared memory file)
- `data.db-wal` (write-ahead log)

## 🎯 Use Cases

- **Construction Projects**: Track workers, daily labor costs, and material procurement
- **Facility Management**: Monitor maintenance team costs and supply budgets
- **Project Work**: Control labor expenses and resource allocation
- **Event Management**: Manage crew scheduling and vendor costs
- **Renovation Projects**: Track contractor payments and material expenses

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (React 19)
- **Database**: SQLite with better-sqlite3
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Runtime**: Node.js

## ❓ Frequently Asked Questions

**Q: Can I run ProjectHub on Windows?**  
A: Yes! It runs on Windows, macOS, and Linux with Node.js 18+.

**Q: Is there a mobile app?**  
A: Not yet, but the app is responsive and works well on tablets and mobile browsers.

**Q: Can multiple people use ProjectHub at once?**  
A: Yes, but SQLite has limited concurrent write support. For heavy concurrent use, consider migrating to PostgreSQL.

**Q: How do I backup my data?**  
A: Run `cp data.db data.db.backup.$(date +%Y%m%d)` or set up automated backups. See docs/CONFIGURATION.md.

**Q: Can I export my data?**  
A: Yes! Use the CSV export buttons in Labor Costs and Materials tabs, or print reports from Settings.

**Q: Do you have authentication?**  
A: Not in v1.0. Add authentication middleware before production use on shared networks.

**Q: How do I upgrade to a newer version?**  
A: Check CHANGELOG.md for breaking changes, then run `npm install` to update dependencies.

**Q: What if I need more features?**  
A: See docs/ARCHITECTURE.md for customization guide, or refer to docs/API_REFERENCE.md for integration options.

## 🔧 Troubleshooting

### App won't start

**Port already in use:**
```bash
# Change port for development
npm run dev -- -p 3001
```

**Dependencies issue:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database corruption

If the database becomes corrupted, restore from backup:

```bash
# Restore from backup
cp data.db.backup.20240101 data.db
```

### Performance issues

For large datasets (10,000+ records):
- Consider archiving old projects
- Export data to external storage
- Upgrade to higher spec server

## 📝 Project Structure

```
project-hub/
├── src/
│   ├── app/
│   │   ├── api/              # RESTful API endpoints
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Main dashboard
│   └── lib/
│       ├── db.ts            # Database connection
│       ├── format.ts        # Utility functions
│       └── types.ts         # TypeScript types
├── public/                   # Static assets
├── docs/                     # Complete documentation
│   ├── GETTING_STARTED.md    # Getting started guide
│   ├── QUICK_REFERENCE.md    # Quick lookup guide
│   ├── API_REFERENCE.md      # API documentation
│   ├── CONFIGURATION.md      # Deployment guide
│   └── ARCHITECTURE.md       # System design
├── CHANGELOG.md              # Version history and releases
├── package.json              # Dependencies
└── tsconfig.json            # TypeScript config
```

## 📖 Main Application Sections

1. **Dashboard**: Overview of project health, metrics, and pending items
2. **Team Members**: Add, edit, and manage project team roster
3. **Labor Costs**: Record and track weekly labor expenses and payments
4. **Materials**: Manage material procurement and supply tracking
5. **Settings**: Configure project details, budget, and team contacts

## 💡 Best Practices

- **Weekly Reviews**: Review pending payments every Friday
- **Regular Backups**: Backup database daily in production
- **Budget Planning**: Set realistic budgets before project start
- **Data Organization**: Use consistent categories for materials
- **Export Regularly**: Export reports monthly for record-keeping

## 🤝 Contributing

This is an open project. For improvements or bug reports, please document issues clearly with:
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, browser)

## 📄 License

ISC License - See LICENSE file for details

## 📮 Support & Contact

For questions or assistance:
- Review documentation in `/docs` directory
- Check troubleshooting section above
- Review API reference for integration questions

---

**Version**: 1.0.0  
**Last Updated**: 2026-06-20  
**Status**: Production Ready
