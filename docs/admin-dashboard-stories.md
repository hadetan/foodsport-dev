Great. I’ll explore all the pages of the [https://www.foodsport.com.hk/](https://www.foodsport.com.hk/) website to understand its structure, features, and services. Based on that, I’ll suggest what key metrics, management modules, and visual components should be displayed in your admin panel dashboard to best support internal staff, vendors, and super admins.
I’ll get back to you with a detailed list of recommendations shortly.


# Dashboard Overview and KPIs

At the top level, the admin dashboard should display **key performance indicators** (KPIs) summarizing FoodSport’s impact and operations.  For example, show total **calories donated**, **participants**, **donations**, **volunteers**, and **events**.  The public site highlights metrics like “58,413,422 kcal donated” and “150k+ beneficiaries”, so the dashboard could chart those in real time.  Likewise, KPIs like **Total Users** (registered members/volunteers/donors), **Total Bookings** (event sign-ups), **Active Events** and **Upcoming Events** are essential.  Display recent donation totals or funds raised and number of NGO partners.  These live tiles or mini-graphs give staff and super-admins an at-a-glance summary of the organization’s health (e.g. total burned calories, total meals donated, number of new signups this month, etc.).

# User and Volunteer Management

A dedicated section should manage **all user roles** – including internal staff accounts, volunteers, donors, corporate partners and vendors.  The site encourages people to **“Become a member,” “Become a partner,”** or **“Volunteer”**, so the admin panel needs modules for:

* **User Profiles:** View and edit contact info, roles (e.g. volunteer, donor, staff), and membership status.
* **Volunteer Signups:** Track volunteer applications and assign them to events or projects.  (The “Volunteer Board” on the About page shows FoodSport engages many volunteers.)
* **Member/Donor Accounts:** Manage regular donors or members who sign up via the site’s donation or membership forms.  Send automated receipts for donations (≥HK\$100) as noted on the Support Us page.
* **Corporate Partners/Vendors:** Maintain records of corporate partners and service vendors.  The Projects page lists collaborators like Morgan Stanley, Nike, Sun Life, etc., and the Support Us page explicitly invites **business organizations** and sponsors.  Store partnership agreements, sponsorship tiers, and contact points.

Access control is crucial: design role-based permissions so that vendors or partner representatives see only their relevant data, while internal staff and super-admins have broader access.

# Events and Courses Management

Given FoodSport’s focus on events (runs, workshops, training), the admin panel needs a robust **Events module**.  From the public “Join Event” page we see many scheduled activities (e.g. **“FOODSPORT 12th Anniversary 5KM Community Run”**, **“BURNATHON 6000”**).  Features include:

* **Event Creator/Editor:** Internal staff can create and configure events (title, description, date/time, location, capacity).  Include multilingual support (site pages switch between English/Chinese) to manage content in both languages.
* **Registration Windows & Status:** Set registration open/close dates (e.g. “Registration opens Jun 14, closes Jun 20” as on the event details page) and automatically close sign-ups.
* **Attendee Lists:** View and search registrants for each event, track payment/status, generate check-in lists.  For example, administrators should see “Register Now” vs. “Registration Closed” statuses as on the public listing.
* **Event Calendars & Timelines:** Visualize upcoming events on a calendar view.  The Hunger Run 2024 page shows detailed race schedules and routes; similar tools allow staff to adjust event timings and publish race plans.
* **Courses/Workshops:** If the organization runs ongoing courses or training programs (e.g. fitness classes, corporate wellness training), include a parallel “Courses” section.  This would handle series of workshops, allow enrollment, and even post-course surveys.

By centralizing event data, staff can easily update public pages from the dashboard and keep track of all event metrics and calendars.

# Content & Media Management

The admin panel should also act as a simple CMS for static content and news.  The site has pages for **About Us**, **Services**, **Foundation**, **Projects** and **Support Us**, each with rich text and images (e.g. mission statements, team bios, service descriptions).  Features include:

* **Page Editor:** Edit text, images, and links for static pages.  For example, update the “About Us” mission/vision or add new team members without code changes.
* **Blog/News Posts:** Even though the site doesn’t have a blog, adding a “News” section for press releases or updates would be useful.  For example, FoodSport has media features listed; admin should post new announcements or event reports (with approval).
* **Media Library:** Store images/videos for reuse on events or pages (e.g. event banners, sponsor logos).
* **Approval Workflow:** If multiple staff can draft content, include a pending/approved system so that any new page, blog, or media upload must be approved by an editor or admin before publishing.

Managing content ensures the website stays up-to-date with fresh information (e.g. upcoming projects or new services like the **“Community Sport”** programs).

# Donation and Volunteer Campaigns

Since FoodSport’s mission centers on converting exercise into food donations, the admin dashboard should track charitable campaigns.  This includes:

* **Donation Tracker:** Record all monetary and in-kind donations.  The Support Us page shows donation options (online credit card, bank transfer, cheque); admin tools can tally total funds raised, issue receipts, and flag high-value donors for follow-up.
* **Food Drive Logistics:** Manage inventory of donated goods.  Support Us lists acceptable food items (rice, canned goods, etc.); admins could log incoming food donations and which charity partner they’re allocated to.
* **Custom Campaigns:** The “Create Your Own Campaign” (CYOC) feature suggests allowing external organizers to run mini-events under the FoodSport banner.  Provide a dashboard section where such campaign requests are approved, monitored, and reported (including calories/money raised).

This section ties into KPI charts (e.g. “Donations by Month” or “Meals Delivered”) and notifies admins of new donor inquiries or volunteer sign-ups via the front-end forms.

# Partner and Vendor Management

Events and campaigns involve many third parties.  The admin panel should include:

* **Sponsor/Vendor Directory:** Maintain records of all event sponsors, equipment suppliers, media partners, etc.  Each project listing (e.g. Morgan Stanley, Nike, Bayer) implies relationships that need oversight.
* **Partner Onboarding:** Manage applications from organizations who click “Become a Partner” or sign up for corporate wellness programs.  Track partnership proposals, signed MOUs, and contact persons.
* **Resource Scheduling:** For event days, track vendor commitments (e.g. tents, catering, medical staff).  If FoodSport rents equipment or hires contractors, the admin panel could have a simple scheduling or booking sub-module.

Notifications should alert admins when a new partner signs up or sponsorship funds are received, ensuring nothing is missed.

# Notifications, Alerts and Approval Workflows

To keep staff and vendors informed, the dashboard should push out timely alerts:

* **Pending Approvals:** Notify when a new event is awaiting approval, a volunteer sign-up needs vetting, or a blog post awaits review.  For example, when someone registers for an event (as shown on the Events page), the system could flag new bookings for staff confirmation.
* **Approaching Deadlines:** Alerts for upcoming registration cut-offs or deadline to publish race results (the Hunger Run page lists result downloads).
* **System Notifications:** Summaries of recent activity (e.g. “You have 5 new volunteer sign-ups, 2 pending donation forms, 3 event registrations”). A *Recent Actions* feed can help super admins audit changes: for example, showing “Alice (Staff) created ‘Summer Workshop’ event, Bob (Volunteer Coordinator) approved 10 new volunteers.”

Integrating email/SMS notifications ensures timely communication.  Workflows should allow managers to assign tasks (e.g. event setup) to staff or volunteers and track their completion.

# Analytics and Data Visualization

Beyond raw KPIs, visual **charts and reports** help staff spot trends.  Useful analytics include:

* **User Engagement:** Line/bar charts of new user registrations or returning visitors over time.  If members log in, track active users per month.
* **Event Trends:** Show attendee counts per event or per category (e.g. running vs. workshop).  A timeline graph of monthly registrations or calories-burned conversions illustrates program growth.
* **Donation/Sales Trends:** Plot donation amounts or funds raised by month/quarter.  Compare with number of campaigns run.  This mirrors “sales trends” analytics, adapted to fundraising.
* **Volunteer Hours:** Track total volunteer hours donated per period or per project.
* **Impact Metrics:** Since FoodSport emphasizes impact (e.g. 10,000 meals provided), chart cumulative and yearly totals of calories and meals donated.

Interactive dashboards (filters by date range, event type, etc.) let staff drill down.  For example, a bar chart showing “Calories donated per event” or a pie chart of “Donation sources (online vs. bank)”.  These visuals support strategic planning and reporting to stakeholders.

# Activity Logs & Reporting

Finally, include **audit logs and recent activity** for transparency.  Log every major action by internal users (e.g. event creation, content edits, user registrations), by partner reps, and by volunteers on the system.  A chronological **Activity Log** page can show entries like “2025-06-01: SuperAdmin Jane approved 'Burnathon 6000' event.”  In combination with dashboards, provide downloadable **reports**: for instance, export Excel/PDF of event attendance, donation receipts, volunteer rosters.

These logs not only help diagnose issues but also support the super-admin’s oversight duties.  For example, the “Recent Actions” summary might highlight if an event’s registration was opened/closed or if a large donation came in.  Keeping a clear audit trail ensures accountability for all parties (staff, vendors, partners) and helps maintain FoodSport’s credibility as a registered charity (IR No: 91/16667).

