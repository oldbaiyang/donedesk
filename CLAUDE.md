# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DoneDesk is a student assignment management system with a "glassmorphism" visual style, featuring subject filtering, point-based rewards, and family collaboration (Parent/Student dual roles). It uses Supabase for backend services and Next.js 16 (Turbopack) for the frontend.

## Common Commands

```bash
npm install        # Install dependencies
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

## Tech Stack

- **Framework**: Next.js 16.1.6 (Turbopack), React 19.2.3, TypeScript 5
- **Styling**: TailwindCSS 4, @base-ui/react, Lucide React
- **Editor**: Tiptap V2 with tiptap-markdown
- **Markdown Rendering**: react-markdown, remark-gfm, remark-breaks
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Image Conversion**: heic-to (WASM-based HEIC→JPEG client-side)

## Architecture

### Provider Hierarchy
The app uses two main context providers wrapping the entire application:
1. `UserProvider` (`src/providers/UserProvider.tsx`) - Authentication and profile state
2. `AssignmentsProvider` (`src/providers/AssignmentsProvider.tsx`) - Assignment CRUD operations

The root layout (`src/app/layout.tsx`) renders `AuthWrapper` which handles auth state and redirects to `/auth` if not logged in.

### RBAC Permission Model
- **Parent**: Full CRUD on all tasks under their `parent_id`
- **Student**: Self-created tasks are fully controllable; parent-created tasks only allow submission
- Key booleans in `AssignmentDetailDialog`: `isCreator` and `isParent` control UI rendering and permissions

### Data Model (Supabase)
- `profiles` - Users (role: 'parent' | 'student', parent_id links students to parents)
- `subjects` - Color-coded categories (name, color_code)
- `assignments` - Core task table (title, status, reward_pts, student_notes)
- `attachments` - Files with `purpose: 'material' | 'submission'` distinction
- `wishlist` - Reward redemption items

### Key Patterns

**Editor Loading (Tiptap)**: Editor components MUST be loaded with `next/dynamic(..., { ssr: false })` due to Turbopack compatibility issues.

**Markdown Rendering**: Tiptap escapes Markdown keywords (e.g., `!\[\]`). Use `cleanMarkdown` function to strip escape backslashes before rendering with react-markdown, otherwise images won't display.

**Attachment Classification**: `purpose` field distinguishes:
- `material` - Reference materials attached to task description
- `submission` - Student work submissions (multiple allowed per task)

**Image Compression**: Files are compressed to <1MB via `browser-image-compression` before uploading to Supabase Storage.

**HEIC Conversion**: Client-side WASM conversion via `heic-to`. Converted files are renamed to `.jpg` and stored as `image/jpeg`.

**Loading State**: `AssignmentsProvider` and `UserProvider` both emit `loading` state. Components wait for both to resolve before rendering data to prevent flash of empty content.

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Supabase Setup

Database schema and RLS policies are in `supabase/schema.sql`. Apply with:
```bash
# Using Supabase CLI
supabase db push
# Or manually execute schema.sql in Supabase SQL Editor
```

## Path Aliases

`@/*` maps to `./src/*` (configured in `tsconfig.json`).
