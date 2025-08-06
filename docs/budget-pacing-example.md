# Budget Pacing Dashboard - Project Development Thread

## User's Initial Request
Hey, I need help building a budget pacing dashboard for Google Ads. I'm tired of using spreadsheets to track whether my campaigns are on track with their budgets. I want something visual that shows me at a glance which campaigns are overspending or underspending. This should be a web app I can run locally. Can you help me build this with Next.js?



## Claude's Initial Response
I'd be happy to help you build a budget pacing dashboard for Google Ads! This sounds like a really useful tool. Before I start creating the PRD (Product Requirements Document), I have some questions to better understand your needs:


### Basic Functionality Questions:
**1** **Data Input Method**: How do you currently track budgets and spend? Would you prefer to:
	- Manually input data through forms?
	- Upload CSV files from Google Ads?
	- Both options?
	- Eventually connect to Google Ads API?
**2** **Budget Types**: What types of budgets do you typically work with?
	- Daily budgets?
	- Monthly budgets?
	- Campaign-specific budgets?
	- Account-level budgets?
**3** **User Context**:
	- How many campaigns do you typically manage at once?
	- Are you tracking multiple client accounts?
	- Do you work solo or need to share this with team members?


### Visualization Questions:
**4** **Key Metrics**: What's most important to see at a glance?
	- Percentage of budget spent vs time elapsed?
	- Projected end-of-period spend?
	- Daily spend trends?
	- Days of budget remaining at current pace?
**5** **Alerts**: When do you want to be warned about pacing issues?
	- When would you consider a campaign "off track"?
	- Do you need different severity levels?


### Technical Questions:
**6** **Data Persistence**: Since this is local, are you okay with:
	- Browser local storage (data stays in your browser)?
	- Need to export/import data between devices?
**7** **Reporting**: Do you need to:
	- Export reports for clients?
	- Generate PDF summaries?
	- Create shareable links?



## User's Responses
Great questions! Here are my answers:
**1** **Data Input**: I'd like both options. Manual input for quick updates during the day, and CSV upload for bulk imports. API integration would be amazing for v2, but let's keep it simple for now.
**2** **Budget Types**: I work with all of these:
	- Daily budgets (most common)
	- Monthly budgets (for some bigger clients)
	- I track at the campaign level, but sometimes need to see account totals
**3** **User Context**:
	- I typically manage 30-50 campaigns across 10-15 accounts
	- Multiple clients, yes
	- Just me for now, but sharing would be nice later
**4** **Key Metrics**: Most important:
	- First: Am I on track? (spending too fast/too slow)
	- Second: What will I spend by month end at this rate?
	- Third: What should my daily spend be to hit target?
**5** **Alerts**:
	- "Off track" = more than 10% over or under where I should be
	- Yes, different levels: slightly off (10-20%), significantly off (20%+), critically off (40%+)
**6** **Data Persistence**: Local storage is fine to start. Export/import would be helpful for backup.
**7** **Reporting**: Eventually yes to all, but for MVP just need:
	- CSV export of current status
	- Maybe a simple PDF that I can screenshot and send to clients


**Additional thoughts:**
- Weekends are tricky - some campaigns pause, others run lower
- Google Ads can overspend daily budgets by up to 2x
- I need to handle when budgets change mid-month
- Currency is always USD for me
- A dark mode would be nice but not essential



## Claude's Follow-up Questions
Thanks for the detailed responses! A few more clarifications:

### Data Structure:
1 For the CSV upload from Google Ads, which export/report do you typically use? What columns does it include?
2 When budgets change mid-month, how do you want to handle the pacing calculation?
	- Reset and calculate from the change date?
	- Pro-rate across the entire period?
	- Track both "original" and "revised" pacing?


### Calculations:
3 For weekends and the pacing calculation:
	- Should I assume even daily spend across all days?
	- Or should users be able to mark "expected low days"?
	- What about holidays?
4 When Google Ads overspends the daily budget (up to 2x), how should this affect the pacing indicators?
	- Show as "overpaced" immediately?
	- Average it out over the month (since Google corrects for this)?


### UI Preferences:
5 For the main dashboard view, would you prefer:
	- A card for each campaign?
	- A table/list view?
	- Both with a toggle?
6 What time period do you most commonly review?
	- Today's pacing?
	- This week?
	- Month-to-date?


## User's Final Responses
**1** **CSV Format**: I usually export the Campaign Performance Report with columns: Campaign Name, Cost, Impressions, Clicks, Date. Sometimes I'll include Account Name if doing multiple accounts.
**2** **Budget Changes**: Pro-rate across the entire period makes most sense. Maybe show a note that says "Budget updated on [date]" so I remember.
**3** **Weekends**: Let's keep it simple - assume even spend across all days for v1. I can mentally adjust. Holiday handling would be nice for v2.
**4** **Overspend**: Average it out over the month since Google does correct for this. Maybe just show a small indicator that says "2x overspend today" but don't panic the pacing calculation.
**5** **UI**: Start with a card view - more visual and easier to scan. Each card shows the campaign name, progress bar, and key numbers. Table view would be nice as a toggle for when I need to see everything at once.
**6** **Time Period**: Month-to-date is my primary view, but I'd like to quickly switch to see this week or today.


**One more thing** - for the progress bars, could we use a gradient or something visually appealing? Not just solid colors. Make it feel modern and professional.


# Budget Pacing Dashboard PRD

## Overview
A standalone Next.js web application that helps Google Ads professionals monitor and manage campaign budget pacing across multiple accounts and time periods.

## Core Features
### 1. Data Input
- **Manual Budget Entry**: Simple form to input:
  - Campaign/Account name
  - Total budget amount
  - Budget period (daily/weekly/monthly)
  - Start and end dates
- **CSV Upload**: Bulk import budgets and spend data
  - Support for standard Google Ads Campaign Performance Report format
  - Columns: Campaign Name, Cost, Impressions, Clicks, Date, Account Name (optional)
- **Spend Tracking**: Daily spend input (manual or CSV)


### 2. Pacing Visualization
- **Main Dashboard View**:
  - Card-based layout (default) with toggle to table view
  - Progress bars with gradient effects showing spend vs budget
  - Color coding:
    - Green (within 10% of target pace)
    - Yellow (10-20% over/under)
    - Orange (20-40% over/under)
    - Red (40%+ over/under)
  - Percentage of budget consumed vs percentage of time elapsed
  - Days remaining in budget period
  - Small indicators for daily 2x overspend events


### 3. Projections
- **End-of-Period Forecast**: Based on current run rate
- **Daily Budget Needed**: To hit target by end date
- **Overspend/Underspend Alerts**: Visual warnings when pacing is off
- **Pro-rated calculations** when budgets change mid-period


### 4. Multi-Campaign View
- Support for 30-50 campaigns across 10-15 accounts
- Time period toggles: Today, This Week, Month-to-Date
- Sort by: most over-paced, most under-paced, largest budgets
- Filter by: date range, budget type, pacing status, account


### 5. Data Management
- Local storage for data persistence
- Budget change history with "Budget updated on [date]" notes
- Export functionality:
  - CSV export of current pacing status
  - Simple PDF generation (or screenshot-friendly layout)


## Technical Requirements
- Next.js 14+ with App Router
- Tailwind CSS for styling with gradient progress bars
- Local storage for data persistence (no database)
- Responsive design for mobile/tablet viewing
- Professional, modern UI design


## User Flow
1 User adds campaign budgets (manual or CSV)
2 User updates daily spend (manual or CSV)
3 Dashboard automatically calculates pacing with monthly overspend averaging
4 User views cards/table with color-coded pacing status
5 User adjusts campaigns based on projections


## Implementation Notes
- Currency: USD only for v1
- Date format: MM/DD/YYYY
- Decimal places: 2 for currency display
- Pacing assumes even distribution across all days (including weekends)
- Daily 2x overspend is averaged across the month per Google Ads behavior
- Dark mode: Nice to have but not required for MVP


## Success Metrics
- User can set up budget tracking in under 2 minutes
- Supports 50+ campaigns without performance issues
- Clear visual indication of pacing status at a glance
- Accurate projections that account for Google Ads overspend behavior


## MVP Scope
For the demo, focus on:
1 Manual and CSV budget/spend entry
2 Card-based pacing visualization with gradient progress bars
3 Three-tier color coding system
4 Month-to-date, weekly, and daily views
5 Simple projection calculations
6 Local storage for persistence
7 Clean, professional UI


## Future Enhancements (v2)
- Google Ads API integration
- Multi-user support with sharing
- Holiday and weekend scheduling
- Email/Slack alerts
- Advanced analytics and trends
- Multiple currency support
- Custom pacing tolerances per campaign
