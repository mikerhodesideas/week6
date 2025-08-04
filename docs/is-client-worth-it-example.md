# Is This Client Worth It? Calculator - From Idea to PRD

# Initial Idea
**User**: I want to build a calculator for freelancers and agencies that helps them figure out if a client is actually worth keeping. Something that factors in not just the money, but the time spent in meetings, the stress level, and whether automation could make the relationship more profitable. Make it a bit funny but genuinely useful.

# Initial Questions from Developer
**Developer**: This is a great concept! Let me ask some questions to understand the scope better:
**1** **Who's the primary user?** Are we targeting solo freelancers, small agencies, or both? This affects how we handle things like team hours.
**2** **Time tracking granularity**: Should we break down time by:
	* Just total hours per month?
	* Different categories (meetings, actual work, admin)?
	* Different team members if it's an agency?
**3** **The "stress factor"**: How do we want to quantify this? Some ideas:

	* Simple 1-10 scale?
	* Specific pain points (scope creep, late payments, weekend emails)?
	* Something more humorous?
**4** **Automation piece**: Are we talking about:

	* General "this many hours could be automated"?
	* Specific tool recommendations?
	* ROI calculations for implementing automation?
**5** **Output focus**: What's the main thing users should walk away knowing?

	* A simple yes/no on keeping the client?
	* Specific actions to improve profitability?
	* Comparison between multiple clients?


## User Responses
**User**:
**1** **Primary user**: Let's focus on solo freelancers and small agencies (under 10 people). We should have a simple toggle for "just me" vs "my team" that adds fields for team hours if needed.
**2** **Time tracking**: Let's break it down into categories. I'm thinking:
	* Billable work hours
	* Meeting/call hours
	* Admin/email hours
	* "Invisible hours" (thinking about them outside work)
3 Keep it monthly to match how most people bill.

**4** **Stress factor**: Let's make it specific but fun. I like the pain points approach:
	* Scope creep frequency (slider: Never to Every Single Project)
	* Payment speed (slider: Before Invoice to What Year Is It?)
	* Weekend contact rate (slider: Never to 3am Slack Messages)
	* "Just one quick thing" requests per month (number input)
**5** **Automation**: Keep it simple for MVP. Just ask "How many hours could be automated?" and "Monthly cost of automation tools". We'll calculate the break-even point.
**6** **Output**: The main thing should be their "True Hourly Rate" after factoring everything in. But also show a "Client Health Score" and specific recommendations. Definitely want client comparison.


## Follow-up Questions from Developer
**Developer**: Perfect! A few more detailed questions:
**1** **Financial inputs**: Beyond the monthly fee, should we include:
	* Expenses you can bill to client?
	* Expenses you eat (travel, tools specific to them)?
	* Opportunity cost of other clients you turned down?
**2** **Client comparison view**: How many clients should they be able to compare at once? And what metrics matter most for comparison?
**3** **Humor level**: How far do we take the fun elements? Should we include:
	* Sarcastic tooltips?
	* "Rage quit probability" based on stress factors?
	* Comparative metrics like "This client costs you 3 therapy sessions/month"?
**4** **Data visualization**: What types of charts would be most useful?
	* Time breakdown pie charts?
	* Profitability over time?
	* Client portfolio matrix (effort vs profit)?
**5** **Actionable insights**: Should the tool suggest specific actions like:
	* "Raise rates by X% to make this worthwhile"
	* "Automate Y hours to reach $Z/hour target"
	* "Fire this client" (in a professional way)?
**6** **Save/export functionality**: Do they need to:
	* Save client data for future reference?
	* Export reports to share with business partners?
	* Generate a "we need to talk about rates" email template?


## Final User Responses
**User**:
**1** **Financial inputs**: Yes to all of those! Let's have:
	* Monthly retainer/project fee (required)
	* Billable expenses (optional, default $0)
	* Non-billable expenses (optional, default $0)
	* Opportunity cost is too complex for MVP, skip it
**2** **Client comparison**: Let them compare up to 5 clients at once. Key comparison metrics:
	* True hourly rate
	* Total monthly profit
	* Stress score
	* Time investment
**3** **Humor level**: Medium humor. Yes to sarcastic tooltips but keep them professional-ish. Skip "rage quit probability" but I love the therapy sessions comparison. Maybe also compare to Netflix subscriptions or coffees.
**4** **Data visualization**: All three of those sound perfect:
	* Time breakdown pie chart for each client
	* Simple profitability trend line
	* Client matrix is the killer feature for agencies
**5** **Actionable insights**: Yes! I want three specific recommendations for each client:
	* Rate adjustment needed to hit target hourly
	* Hours to automate for profitability
	* A diplomatic "consider ending this relationship" if the numbers are really bad
**6** **Save/export**: For the demo, let's just do:
	* Export results as PDF
	* Copy shareable link (for team discussions)
	* Email template is fun but save for v2


**One more thing**: Let's add a "Dream Hourly Rate" input at the top so all calculations can reference what they WANT to be making.


# Final PRD: Is This Client Worth It? Calculator

## Product Overview
A web-based calculator that helps freelancers and small agencies determine the true profitability of their clients by analyzing time investment, financial returns, and stress factors. The tool provides actionable insights on whether to keep, improve, or end client relationships.
# Target Users
* Solo freelancers
* Small agencies (under 10 people)
* Anyone who bills clients on a retainer or project basis


## Core Features
### Input Section
**Basic Configuration**
* **User Type Toggle**: "Just Me" vs "My Team" (reveals team hours inputs)
* **Dream Hourly Rate**: Target earnings per hour (used for all calculations)


**Financial Inputs (Per Client)**
* **Client Name**: Text field
* **Monthly Fee**: Monthly retainer or average project value
* **Billable Expenses**: Expenses charged to client (default: $0)
* **Non-billable Expenses**: Expenses absorbed (default: $0)


**Time Investment (Monthly)**
* **Billable Work Hours**: Actual productive work
* **Meeting/Call Hours**: Including prep time
* **Admin/Email Hours**: Project management, communications
* **"Invisible Hours"**: Thinking about client outside work hours
* **Team Hours** (if applicable): Same categories for team members


**Stress Factors**
* **Scope Creep Frequency**: Slider (Never → Every Single Project)
* **Payment Speed**: Slider (Before Invoice → What Year Is It?)
* **Weekend Contact Rate**: Slider (Never → 3am Slack Messages)
* **"Just One Quick Thing" Requests**: Number per month


**Automation Potential**
* **Automatable Hours**: Hours that could be eliminated with tools
* **Automation Cost**: Monthly cost of required tools


## Calculations Engine
**True Hourly Rate Formula**
### Total Hours = Billable + Meetings + Admin + Invisible + Team Hours
### Net Revenue = Monthly Fee + Billable Expenses - Non-billable Expenses
### True Hourly Rate = Net Revenue / Total Hours
**Client Health Score (0-100)**
* 40% weight: True Hourly Rate vs Dream Rate
* 30% weight: Payment reliability
* 20% weight: Scope creep factor
* 10% weight: Work-life balance (weekend contacts)


**Automation ROI**
### Monthly Savings = Automatable Hours × True Hourly Rate
### Payback Period = Automation Cost / Monthly Savings
### New Hourly Rate = Net Revenue / (Total Hours - Automatable Hours)

## Primary Outputs
**Individual Client View**

**1** **Hero Metrics** (Large display):
	* True Hourly Rate
	* Client Health Score
	* Monthly Profit
**2** **Comparison Metrics**:
	* "This client costs you X therapy sessions/month"
	* "You're earning Y Netflix subscriptions/hour"
	* "This equals Z cups of coffee/hour"
**3** **Visualizations**:
	* **Time Breakdown Pie Chart**: Shows distribution of work types
	* **Profitability Trend**: Line graph (if historical data added later)
**4** **Recommendations** (Top 3):
	* "Raise rates by X% to reach dream hourly rate"
	* "Automate Y hours to improve rate to $Z"
	* "Consider transitioning this client" (if health score < 40)


**Multi-Client Comparison View**

**1** **Client Portfolio Matrix**:
	* X-axis: Monthly profit
	* Y-axis: Time investment
	* Bubble size: Stress level
	* Quadrants: Stars, Cash Cows, Question Marks, Time Sinks
**2** **Ranked List View**:
	* Sortable by: True hourly rate, profit, health score, time invested
	* Visual indicators for health status (green/yellow/red)
**3** **Portfolio Summary**:
	* Average true hourly rate across all clients
	* Total monthly profit
	* Time allocation breakdown
	* "Weakest link" identification


## UI/UX Requirements
**Layout**
* **Single Page Application**: All inputs and outputs visible
* **Responsive Design**: Works on tablet/desktop (mobile nice-to-have)
* **Input Panel**: Left side or top (collapsible on mobile)
* **Results Panel**: Right side or bottom with tabs for different views


**Interactions**
* **Live Calculations**: Updates as user types
* **Smooth Animations**: For chart updates and transitions
* **Tooltips**: Sarcastic but helpful hints on each input
* **Progress Indicator**: Shows which fields are still needed


**Visual Design**
* **Clean, Modern Interface**: Professional but approachable
* **Color Coding**: Green (healthy), yellow (caution), red (problem)
* **Data Viz**: Chart.js or similar for interactive graphs
* **Print-Friendly**: Results page optimized for PDF export


## Technical Specifications
**Frontend**
* **Framework**: Next.js with TypeScript
* **State Management**: React hooks (useState, useReducer)
* **Styling**: Tailwind CSS for rapid development
* **Charts**: Chart.js or Recharts
* **Form Handling**: React Hook Form for validation


**Data Structure**
### interface Client {
###   id: string;
###   name: string;
###   financials: {
###     monthlyFee: number;
###     billableExpenses: number;
###     nonBillableExpenses: number;
###   };
###   timeInvestment: {
###     billableHours: number;
###     meetingHours: number;
###     adminHours: number;
###     invisibleHours: number;
###     teamHours?: number;
###   };
###   stressFactors: {
###     scopeCreep: number; // 0-10
###     paymentSpeed: number; // 0-10
###     weekendContact: number; // 0-10
###     quickRequests: number;
###   };
###   automation: {
###     automatableHours: number;
###     monthlyCost: number;
###   };
### }
**Export Functionality**
* **PDF Generation**: Using jsPDF or similar
* **Shareable Links**: Encode client data in URL parameters
* **Copy Results**: Formatted text for email/Slack


## Future Enhancements (Post-MVP)
**1** **Historical Tracking**: Month-over-month client profitability
**2** **Email Templates**: "Rate increase" and "Goodbye" templates
**3** **Team Features**: Individual team member hour tracking
**4** **Integration Options**: Time tracking tool imports
**5** **Industry Benchmarks**: Compare rates to industry standards
**6** **Predictive Analytics**: "This client will cost you X in 6 months"


## Success Metrics
* User can input client data in under 2 minutes
* Calculations provide clear, actionable insights
* Interface requires no explanation or onboarding
* Results motivate concrete business decisions
* Users want to share/discuss results with others


## Example Tooltips (For Humor)
* **Scope Creep**: "How often does 'quick revision' turn into 'complete redesign'?"
* **Payment Speed**: "Before Invoice = unicorn client, What Year Is It = time to lawyer up"
* **Weekend Contact**: "3am Slack = boundaries are just a suggestion"
* **Invisible Hours**: "Shower thoughts, stress dreams, and parking lot screams"


## Demo Script Hook
"Let me show you how to figure out if that nightmare client is actually worth the money, or if you'd be better off working at a coffee shop. Spoiler alert: the coffee shop might pay better."
