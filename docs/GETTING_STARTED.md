# Getting Started with ProjectHub

Welcome to ProjectHub! This guide will help you set up and start using the platform for project management and cost tracking.

## Initial Setup (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

This installs all required packages including Next.js, React, and Tailwind CSS.

### 2. Start the Application

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm run build
npm run start
```

Access the app at `http://localhost:3000`

### 3. Configure Project Settings

1. Click the **Settings** tab in the main navigation
2. Enter your project information:
   - **Project Name**: Give your project a clear name
   - **Currency**: Select your currency code (e.g., USD, EUR, KES)
   - **Total Budget**: Set the overall project budget
   - **Project Manager**: Your name and contact information
   - **Site Foreman/Supervisor**: On-site lead contact details

3. Click **Save Settings**

## First Steps: Adding Your Team

### Add Team Members

1. Navigate to the **Team Members** tab
2. Fill in the form:
   - **Full Name**: Team member's complete name
   - **Phone Number**: Contact number
   - **Department/Role**: Their position (e.g., "Mason", "Carpenter", "Site Lead")
3. Click **Add Member**

### Tips:
- Use consistent department names for better filtering
- Add all key personnel before starting cost tracking
- Include backup contact information

## Recording Labor Costs

### Log Weekly Labor Expenses

1. Go to the **Labor Costs** tab
2. Fill in the cost entry:
   - **Select Team Member**: Choose from your roster
   - **Week Start Date**: Monday of the week
   - **Labor Cost**: Amount paid for the week
3. Click **Add Cost**

### Track Payment Status

- **Mark as Paid**: Click "Mark paid" to record payment
- **Pending**: Costs default as pending until paid
- **Export**: Download labor records as CSV for accounting

### Tips:
- Record costs weekly for accurate tracking
- Update payment status immediately when paid
- Use date filters to review specific periods

## Managing Materials & Supplies

### Add Material Entries

1. Navigate to **Materials** tab
2. Complete the material form:
   - **Item/Material Name**: What was purchased
   - **Quantity & Unit**: Amount and unit type (pcs, kg, meters, etc.)
   - **Cost**: Total cost for this entry
   - **Category**: Material type (e.g., "Cement", "Steel", "Hardware")
   - **Date**: Purchase date
   - **Vendor/Supplier**: Where purchased from
   - **Notes**: Any additional details

3. Click **Add Item**

### Organize with Categories

- Use consistent category names
- Examples: Lumber, Concrete, Steel, Hardware, Paint, Electrical, Plumbing
- Filter by category to see all related purchases

### Tips:
- Record purchases on the day they occur
- Keep supplier contact info in notes
- Attach purchase receipts separately

## Understanding Your Dashboard

The Dashboard provides a complete project overview:

### Key Metrics

- **Total Spend**: Sum of all labor + material costs
- **Outstanding Labor**: Pending payments to workers
- **Material Cost**: Total spent on materials
- **Team Size**: Number of team members

### Budget Tracking

- **Budget Overview**: Visual progress bar showing spending
- **Paid**: Money already disbursed
- **Pending**: Outstanding payments due
- **Total Items**: Number of records (labor + material)

### Quick Views

- **Pending Labor Costs**: Workers waiting for payment (click to mark paid)
- **Recent Material Spend**: Latest purchases with costs

## Using Filters & Search

### Labor Costs Filtering

Access the **Labor Costs** tab filters to:

- **Search**: Find by worker name, phone, or department
- **Team Member**: Show costs for specific people
- **Status**: View only Paid, Pending, or All
- **Date Range**: Filter by week or period
- **Reset**: Clear all filters

### Material Filtering

In the **Materials** tab:

- **Search**: Find items by name, vendor, or notes
- **Category**: View specific material types
- **Date Range**: Browse by purchase period
- **Reset**: Clear filters

### Tips:
- Use filters for monthly reconciliation
- Search for vendors to track supplier relationships
- Check date ranges for project phases

## Exporting Data

### Generate Reports

**Export Labor Costs (CSV):**
1. Go to **Labor Costs** tab
2. Click **Export CSV**
3. File contains: date, worker, department, phone, amount, status

**Export Materials (CSV):**
1. Navigate to **Materials** tab
2. Click **Export CSV**
3. File contains: date, item, category, supplier, quantity, unit, cost, notes

### Print Reports

1. Go to **Settings** tab
2. Click **Print Report**
3. Browser print dialog appears with formatted report
4. Choose printer and print settings
5. Save as PDF or print to paper

### Uses:
- Share with stakeholders
- Import to accounting software
- Archive for project records
- Prepare invoices or claims

## Common Tasks

### Update Team Member Details

1. **Team Members** tab
2. Click **Edit** on the member
3. Modify the information
4. Click **Save**

### Correct a Labor Cost Entry

1. **Labor Costs** tab
2. Click **Edit** on the entry
3. Update amount, date, or status
4. Click **Save**

### Delete or Modify Materials

1. **Materials** tab
2. Click **Edit** to modify
3. Click **Delete** to remove
4. Confirm the action

## Data Backup

### Manual Backup

```bash
# Backup your database
cp data.db data.db.backup.$(date +%Y%m%d)
```

### Automated Backup (Linux/macOS)

Add to crontab for daily backups:
```bash
0 2 * * * cp /path/to/project-hub/data.db /backups/project-hub.db.$(date +\%Y\%m\%d)
```

## Tips for Success

### Organization
- ✓ Set up all team members before recording costs
- ✓ Use consistent category names
- ✓ Record data daily, don't let it accumulate
- ✓ Review pending payments weekly

### Accuracy
- ✓ Double-check amounts when entering
- ✓ Use consistent date formats
- ✓ Keep supplier receipts for reference
- ✓ Mark payments immediately when made

### Best Practices
- ✓ Export monthly reports
- ✓ Backup database weekly
- ✓ Review budget vs. actual monthly
- ✓ Archive old projects periodically

## Troubleshooting

### App won't load

1. Check if server is running (`npm run dev`)
2. Try refreshing the page
3. Clear browser cache
4. Check browser console for errors (F12)

### Can't find a team member

1. Check spelling in search
2. Use filters to narrow results
3. Verify they were added to the team
4. Try clearing filters

### Export file is empty

1. Check if filters are too restrictive
2. Verify records exist in the system
3. Reset all filters to see all data
4. Try exporting again

### Database file errors

1. Check file permissions
2. Ensure disk space available
3. Try restoring from backup
4. Contact support if corruption suspected

## Next Steps

Now that you've set up ProjectHub:

1. **Add realistic budget** based on project scope
2. **Invite team leads** to provide weekly labor costs
3. **Set up regular review schedule** (weekly/monthly)
4. **Create backup routine** for database protection
5. **Export reports** for stakeholder communication

## Getting Help

- Check the main **[README.md](../README.md)** for overview
- Review **[API_REFERENCE.md](./API_REFERENCE.md)** for technical details
- Read **[CONFIGURATION.md](./CONFIGURATION.md)** for deployment
- See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for system design

---

**Happy Project Managing! 🎯**
