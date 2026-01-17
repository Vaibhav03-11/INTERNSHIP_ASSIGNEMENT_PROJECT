# Admin Dashboard - Internship Assignment

A pre-built admin dashboard with **intentional bugs** and **incomplete features** for you to fix and complete.

## Quick Start

```bash
# Install dependencies
npm install

# Initialize MSW (required for mock API)
npx msw init public --save

# Start development server
npm run dev
```

The app will be available at http://localhost:5173

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety (strict mode) |
| Material React Table (MRT) | Data Grid |
| Material UI | Component Library |
| React Query | Data Fetching & Caching |
| MSW | Mock API |
| React Router v6 | Routing |
| Notistack | Toast Notifications |

## Project Structure

```
src/
├── api/                  # API calls
├── components/
│   └── tables/           # Table components (DynamicGrid, UserActions)
├── hooks/                # Custom hooks (useUsers, useDebounce)
├── layouts/              # Page layouts
├── mocks/                # MSW mock handlers
├── pages/
│   └── UsersPage/        # Users page
├── types/                # TypeScript types
├── utils/                # Utilities & column config
├── App.tsx
├── main.tsx
└── routes.tsx
```

## Your Tasks

See **ASSIGNMENT.md** for detailed instructions.

### Summary

| Task Type | Count | Skills Tested |
|-----------|-------|---------------|
| Bug Fixes | 3 | Debugging, React Query, MRT |
| Complete Features | 3 | Pattern following |
| Build New | 2 | Independent thinking |

## Submission

1. Fix all bugs and complete features
2. Make separate commits for each fix/feature
3. Update this README with your changes
4. Deploy to Vercel/Netlify
5. Submit repo link + live demo

---

## Changes Made

### Bug Fixes

#### Bug #1: Table Doesn't Refresh After Status Update 
**Location:** `src/hooks/useUsers.ts`

**Issue:** When clicking activate/deactivate on a user, the snackbar showed success but the table didn't update. Users had to manually refresh the page to see the status change.

**Root Cause:** The `useUpdateUserStatus` hook was missing React Query cache invalidation in the `onSuccess` callback. After the mutation completed, React Query didn't know the cached user data was stale.

**Solution:** Added `queryClient.invalidateQueries({ queryKey: userQueryKeys.all })` to the `onSuccess` callback. This tells React Query to mark all user queries as stale and refetch the data automatically.

**Changes:**
- Modified `useUpdateUserStatus` hook to invalidate the users query cache on successful mutation
- Table now automatically refreshes with the updated user status without requiring a page reload

**Impact:** Improved user experience with immediate visual feedback when toggling user status.
