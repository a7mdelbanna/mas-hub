MAS Business OS — Software Requirements Specification (SRS)
1. Introduction

Purpose:
MAS Business OS is an all-in-one enterprise system for managing MAS operations (software development, POS systems, mobile apps, marketing, IT support). It centralizes Projects, Finance, CRM, HR, Clients, Candidates, Products, Services, Hardware/Stock, Training, Portals, and Automations.

Scope:
Covers both internal operations (staff, managers, HR, finance, executives) and external stakeholders (clients, candidates).
Supports multi-language, multi-department, and multi-currency operations.

2. Users & Portals

Super Admin — full access, system settings.

CEO / Executives — executive dashboard (KPIs, company health).

Department Managers — scoped control of POS, Tech, Support, Marketing, Finance, HR.

Employees — Employee Portal (to-dos, timesheets, payroll, training).

HR/Recruiters — Candidate management, interview flow, onboarding.

Finance — Accounts, invoices, payroll, budgets.

Sales/Marketing — CRM, campaigns, KPIs.

Support/Tech — Tickets, visits, hardware/services.

Clients — Client Portal (projects, invoices, docs, training, add-ons).

Candidates — Candidate Portal (pre-hire training, lessons, materials).

3. Core Modules
3.1 Projects & Tasks

Project Record: client, type (POS, Mobile App, Hybrid), start/due dates, budget, manager, team.

Phases & Milestones: deliverables, acceptance criteria, % completion.

Tasks: Kanban/List/Gantt, subtasks, dependencies, attachments.

Timesheets: employees log hours, PM approval.

Budget Link: expenses tied to projects reduce budget in real time.

Client View: project timeline + “client To-Dos” (pending approvals, uploads).

3.2 Finance & Payments

Accounts: cash, bank, Instapay, Paymob, Stripe, wallets.

Transactions: income/expense, linked to projects/services/hardware.

Invoices: one-off, milestone-based, recurring.

Payroll: auto-allocate full-time salaries, contractor hourly pay.

Payment Settings:

Manual: add logo + instructions (Instapay, Vodafone Cash, Bank Transfer).

Automatic: Stripe, Paymob (auto status updates).

Contracts & Subscriptions: retainers, support plans, auto-renewals.

Reports: P&L, unpaid invoices, project profitability.

Outstanding Balance Widget: consolidated view for clients + finance.

3.3 CRM & Marketing

Pipeline: new → qualified → proposal → won/lost.

Deals → Projects: won deals auto-create projects + client portal.

Campaigns: track spend, ROI, conversion.

Pricebooks & Bundles: catalog of services/hardware with currency/region rules, product bundles.

Approvals: discounts > threshold → approval workflow.

3.4 Clients & Services

Client Record: business name, start date, projects, services purchased, hardware purchased, invoices.

Services Library: predefined support/IT services (fixed-price or hourly).

Support Visits: schedule on-site/remote interventions, billable or free.

Installed Hardware & Assets: barcode, serial, warranty, stock levels, profitability on resale.

Client Sites: multiple addresses/branches per client.

3.5 Departments

POS · Support · Tech · Marketing · HR · Finance (customizable).

Department-specific dashboards & scoped access.

Managers assign users & tasks by department.

3.6 Employee Portal

My To-Dos: assigned tasks.

Timesheets: log hours, submit for approval.

Payroll View: salaries, bonuses, deductions.

Announcements: company/department news.

Training Courses: internal lessons assigned per role/department.

3.7 Client Portal

Project Dashboard: % complete, milestones, pending client tasks.

Announcements: news from MAS.

Invoices & Payments: pending fees, pay online/offline.

Products Tab:

Product docs (manuals, PDFs).

Training (videos, courses).

FAQs.

Pricing & Add-ons (pulled from pricebook).

Support: open/view tickets, SLA timers.

Services: purchase add-ons, schedule visits.

Hardware: view/purchase equipment (PCs, scanners).

3.8 Interview & Candidate Management

Candidate Record: name, email, CV, portfolio, notes, skills.

Invitation Flow: email → candidate portal login.

Candidate Portal:

Training courses (videos, PDFs, quizzes).

Progress tracking (completion %, scores).

Assigned tasks/notes.

Interview Pipeline: applied → shortlisted → invited → training → interview → decision.

Onboarding: hired candidates → converted into Employee record with auto onboarding checklist.

3.9 Training & LMS

Course → Lessons → Materials (video, PDF, quiz).

Assignable to Candidates (pre-hire training) or Employees (internal training).

Progress Tracking: HR/managers see completion %, quiz results, certificates.

External Courses: linked to products in Client Portal for client staff training.

3.10 Support & SLA

Tickets: new, in progress, waiting, resolved, closed.

SLA Policies: response/resolution targets tied to contracts.

Visits: schedule field IT work.

VoIP (Phase 3): employees answer calls inside portal, call recordings linked to tickets.

3.11 User Management & Access Control

Add Users: managers, devs, support, finance.

Assign Roles & Departments.

Module Access: project, finance, HR, etc. (view/edit/approve).

Field-Level Permissions: sensitive fields hidden for some roles.

Audit Logs: track all changes.

3.12 Automations

Triggers: invoice overdue, budget crossed 80%, ticket created, candidate invited.

Conditions: role, project type, client tier, amount > X.

Actions: create task, send reminder, block client portal, escalate approval.

Approval Workflows: discounts, budgets, hiring.

4. Dashboards
4.1 CEO Dashboard

Revenue vs expenses.

Pipeline (deals won/lost).

Project health summary.

Employee utilization.

Outstanding invoices.

Cash flow trends.

4.2 Department Dashboards

Support: open tickets, SLA breaches, visits.

Marketing: campaign ROI, leads conversion.

Tech: project velocity, bugs.

Finance: P&L, unpaid invoices, payroll allocation.

HR: candidate pipeline, employee training completion.

4.3 Employee Dashboard

To-dos, timesheets, payroll, announcements, training progress.

4.4 Client Dashboard

Project timeline + tasks on client side.

Pending approvals.

Training materials.

Products, docs, FAQs.

Add-ons & fees.

5. Settings Module

Organization Profile: logo, timezone, base currency.

Departments: add/edit, assign managers.

Project Types: POS, Mobile App, Hybrid → linked templates.

Catalog & Pricebooks: hardware, services, bundles, region-based pricing.

Contracts & Plans: retainer hours, SLA, renewals.

Payments: manual & automatic.

Finance Rules: tax %, FX provider, invoice numbering.

SLA & Business Hours: calendars, holidays, severity matrix.

Portals: branding per portal (client, candidate).

Users & Permissions: assign access to modules.

Custom Fields: extend objects (projects, clients, tickets).

Templates: proposals, offers, onboarding checklists.

6. Non-Functional Requirements

Performance: API < 200ms avg response.

Scalability: modular microservices.

Security: JWT auth, RBAC, audit logs, encryption at rest.

Reliability: daily backups, soft delete with retention.

Compliance: tax & invoice rules per country.

I18N: English primary, Arabic & Russian supported.

Extensibility: API-first, webhooks, 3rd-party integrations (Stripe, Paymob, GitHub, Slack, GDrive).

7. Roadmap

Phase 1 (MVP):
Projects, Tasks, Finance (basic), Employee Portal, Client Portal (projects, invoices), Services, CRM pipeline, Manual Payments.

Phase 2:
Hardware/Stock, Automatic Payments, Pricebooks & Bundles, Contracts, Training LMS, Candidate Portal.

Phase 3:
VoIP Integration, Advanced Automations, Executive Dashboard, Analytics, Multi-language UI.

8. Crucial Recommendations

Start with Settings (project types, departments, finance rules) to ensure consistency.

Modularize Training so the same LMS engine serves candidates, employees, and clients.

Design Portals (Client, Candidate, Employee) with consistent UX but scoped features.

Focus on Reporting early—KPIs drive adoption by CEO/Managers.

Keep Automations Flexible—business rules change often.