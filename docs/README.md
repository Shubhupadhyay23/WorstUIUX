# CivicFix AI

Turn civic complaints into actionable civic cases using AI.

## Overview
Citizens report civic problems using unstructured descriptions. CivicFix AI converts citizen complaints into structured civic cases using Gemini and automates downstream workflows using n8n.

## Features
- Secure JWT Authentication & Role-based isolation
- Automated issue categorization & severity assignment via Google Gemini AI
- Extensible webhook architecture built for n8n workflows
- Beautiful, responsive React UI
- Real-time Admin command center

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm run install:all
   ```

2. **Environment Variables**:
   Copy `.env.example` to `.env` in the root and fill in your Supabase connection strings, Gemini Key, and custom JWT secret.

3. **Database Migration**:
   Run the SQL provided in `supabase/migrations/001_initial_schema.sql` inside your Postgres or Supabase query editor.

4. **Run Locally**:
   ```bash
   npm run dev:server
   npm run dev:client
   ```
