# ProjectHub Quick Reference Guide

Fast lookup guide for common tasks and keyboard shortcuts.

## 🎯 Common Tasks

### Adding Team Members
1. **Team Members** tab → Enter name, phone, department → **Add Member**

### Recording Labor Costs
1. **Labor Costs** tab → Select worker → Enter week & amount → **Add Cost**

### Tracking Materials
1. **Materials** tab → Fill all fields → **Add Item**

### Updating Payment Status
1. **Labor Costs** tab → Click **Mark paid**/**Mark unpaid**

### Exporting Data
- **Labor Costs** tab → **Export CSV**
- **Materials** tab → **Export CSV**
- **Settings** tab → **Print Report**

### Changing Project Settings
1. **Settings** tab → Update fields → **Save Settings**

---

## 📊 Dashboard Metrics Explained

| Metric | Meaning | Action |
|--------|---------|--------|
| **Total Spend** | Labor + Materials | Review budget overage |
| **Outstanding Labor** | Unpaid wage costs | Mark paid when disbursed |
| **Material Cost** | Total material purchases | Track procurement spend |
| **Team Size** | Active team members | Verify roster completeness |
| **Budget Used %** | Percentage of budget spent | Plan remaining work |

---

## 🔍 Filtering Tips

### Quick Filter Ideas

**Labor Costs:**
- Find unpaid costs: Status filter → "Pending"
- Check one person's history: Worker filter
- Monthly review: Date range filter
- Find recent: Sort by date descending

**Materials:**
- By category: Use category dropdown
- By vendor: Search supplier name
- By period: Date range filter
- Find item: Search by name or notes

### Filter Reset
All tabs have **Reset** button to clear all filters

---

## 💾 Data Management

### Backup Your Database
```bash
# One-time backup
cp data.db data.db.backup.$(date +%Y%m%d)

# Automated daily (add to crontab)
0 2 * * * cp /path/to/data.db /backups/data.db.$(date +\%Y\%m\%d)
```

### Restore from Backup
```bash
# Stop the app first
cp data.db.backup.20260620 data.db
# Restart app
```

---

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Print Report | `Ctrl+P` / `Cmd+P` |
| Focus Search | `Ctrl+F` / `Cmd+F` |
| Next Tab | `Ctrl+→` |
| Previous Tab | `Ctrl+←` |

---

## 🚨 Common Issues & Quick Fixes

| Issue | Solution |
|-------|----------|
| Can't find team member | Clear filters, check spelling |
| Data not saving | Check browser console (F12) |
| Export file empty | Reset filters, verify data exists |
| Page slow | Clear browser cache |
| App won't start | Check port 3000 availability |

---

## 📋 Weekly Checklist

- [ ] Review pending labor costs
- [ ] Update payment status for paid workers
- [ ] Record new material purchases
- [ ] Check budget vs. actual spend
- [ ] Backup database
- [ ] Review for data entry errors

---

## 💵 Budget Monitoring

### Budget Formula
```
Budget Remaining = Total Budget - (Labor Costs + Material Costs)
Budget Used % = (Total Spend / Total Budget) × 100
```

### Typical Budgets
- Small project (1-5 people): $10k-$50k
- Medium project (5-20 people): $50k-$250k
- Large project (20+ people): $250k+

---

## 📱 Export Format

### Labor Costs CSV Columns
```
Week Start | Worker | Department | Phone | Amount | Status
2026-06-16 | John Doe | Mason | 555-1234 | 500.00 | unpaid
```

### Materials CSV Columns
```
Date | Item | Category | Supplier | Quantity | Unit | Cost | Notes
2026-06-20 | Concrete | Cement | BuildCo | 50 | bags | 1500 | Premium
```

---

## 🔧 Settings Reference

| Setting | Purpose | Example |
|---------|---------|---------|
| Project Name | Display name | "Oak Street Building" |
| Currency | Cost formatting | "USD" or "KES" |
| Budget | Total allocation | "50000" |
| PM Name | Project manager | "Alice Johnson" |
| PM Contact | Manager phone | "555-0001" |
| Foreman | Site lead | "Bob Smith" |
| Foreman Contact | Lead phone | "555-0002" |

---

## 📊 Report Contents

**Printed Report Includes:**
- Project name and team info
- Full labor costs ledger
- Complete material inventory
- Budget summary and status
- Key metrics and totals
- Print date and time

---

## 🎯 Best Practices

✅ **DO:**
- Record costs daily
- Update payment status immediately
- Use consistent categories
- Backup weekly
- Review monthly
- Export for records

❌ **DON'T:**
- Delete old records without backing up
- Leave filters on permanently
- Forget to save settings
- Skip backup routines
- Mix projects in same database

---

## 📞 Support Resources

| Resource | Location |
|----------|----------|
| Getting Started | `docs/GETTING_STARTED.md` |
| API Docs | `docs/API_REFERENCE.md` |
| Setup Guide | `docs/CONFIGURATION.md` |
| Architecture | `docs/ARCHITECTURE.md` |
| Main Readme | `README.md` |

---

## 🌐 Environment Variables

```bash
# Development
NODE_ENV=development
PROJECT_HUB_DB_PATH=./data.db
PORT=3000

# Production
NODE_ENV=production
PROJECT_HUB_DB_PATH=/var/data/project-hub/database.db
PORT=3000
```

---

## 📈 Growth Timeline

| Stage | Team Size | Records | Recommendations |
|-------|-----------|---------|-----------------|
| Start | 1-5 | <100 | Current setup fine |
| Growing | 5-20 | 100-1k | Add backups |
| Large | 20-50 | 1k-10k | Consider archiving |
| Scaling | 50+ | 10k+ | Plan upgrade path |

---

## 🎓 Learning Path

### New Users
1. Read **Getting Started** guide (10 min)
2. Add test team members (5 min)
3. Record sample labor costs (5 min)
4. Export a report (5 min)

### Advanced Users
1. Review **API Reference** for integration
2. Read **Architecture** for customization
3. Review **Configuration** for deployment
4. Set up backup automation

---

**Last Updated**: 2026-06-20  
**Version**: 1.0.0
