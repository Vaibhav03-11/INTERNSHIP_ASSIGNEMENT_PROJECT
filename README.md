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

---

#### Bug #2: Groups Column Shows "[object Object]"
**Location:** `src/components/tables/DynamicGrid.tsx`

**Issue:** The "Groups" column displayed `[object Object]` instead of showing group names as chips.

**Root Cause:** In the `renderCellByType` function's `chiplist` case, the code was using `group.toString()` for both the key and label, which converts the Group object to the string `"[object Object]"`.

**Solution:** Updated the chip renderer to access the correct properties from the Group object:
- Changed `key={group.toString()}` to `key={group.groupId}`
- Changed `label={group.toString()}` to `label={group.groupName}`

**Changes:**
- Fixed chiplist renderer to properly extract `groupId` and `groupName` from Group objects
- Groups now display as readable, properly formatted chips with their actual names

**Impact:** Users can now see which groups each user belongs to, improving data visibility and usability.

---

#### Bug #3: Pagination Not Synced with URL
**Location:** `src/pages/UsersPage/UsersPage.tsx`

**Issue:**
- Changing pages didn't update the URL
- Filtering by status didn't update the URL
- Refreshing the page reset pagination to page 1

**Root Cause:** The component read URL params but didn't update them when state changed. State changes weren't reflected in the URL, so refreshing lost the current page/filter state.

**Solution:** Implemented bidirectional URL synchronization:
1. **Initialize from URL**: State is now initialized from URL search params on component mount
2. **Update URL on state change**: Added a useEffect that updates URL whenever pagination, status filter, or search query changes
3. **Use setSearchParams**: Properly update the URL search parameters using React Router's `setSearchParams`

**Changes:**
- Added `useSearchParams` import from React Router
- Initialize state from URL params: `searchParams.get('page')`, `searchParams.get('status')`, `searchParams.get('search')`
- Added useEffect to sync state changes back to URL
- Removed confusing manual URL parsing logic

**URL Format:** `/users?page=2&pageSize=10&status=active&search=john`

**Impact:** Users can now:
- Share URLs that preserve page state
- Use browser back/forward to navigate between previously visited pages
- Refresh without losing current pagination and filter state

---

### Features Completed

#### Feature #1: Debounced Search
**Location:** `src/pages/UsersPage/UsersPage.tsx`

**Previous State:** Search input triggered an API call on every single keystroke, causing excessive network requests and poor performance.

**Implementation:**
- Imported and used the `useDebounce` hook from `src/hooks/useDebounce.ts`
- Set debounce delay to 300ms
- Applied debouncing to the search query before passing it to the API fetch

**How It Works:**
1. User types in search input → `searchQuery` state updates immediately (UI stays responsive)
2. `useDebounce` waits 300ms after user stops typing
3. Only then does `debouncedSearchQuery` update, triggering the API call
4. If user continues typing, the timer resets

**Changes:**
- Added `useDebounce` import from hooks
- Created `debouncedSearchQuery` using `useDebounce(searchQuery, 300)`
- Updated `useUsers` hook to use `debouncedSearchQuery` instead of `searchQuery`
- Updated URL sync effect to use `debouncedSearchQuery`

**Impact:**
- Reduced API calls by ~90% during typing
- Improved performance and reduced server load
- Better user experience with no lag in input while preventing unnecessary requests

---

#### Feature #2: Loading Skeleton
**Location:** `src/components/tables/TableSkeleton.tsx`, `src/pages/UsersPage/UsersPage.tsx`

**Previous State:** Table displayed a generic loading spinner when fetching data, providing no visual indication of the table structure.

**Implementation:**
- Created a new `TableSkeleton` component using MUI Skeleton component
- Skeleton displays placeholder rows that match the actual table structure
- Different skeleton types for different column types:
  - **String columns**: Text skeleton
  - **Badge columns**: Rounded skeleton (70px width)
  - **Chiplist columns**: Multiple chip skeletons
  - **Date columns**: Text skeleton (100px width)

**How It Works:**
1. When `isLoading` is true, show `TableSkeleton` instead of `DynamicGrid`
2. Skeleton renders the same number of rows as the current page size
3. Each cell shows a skeleton that matches its column type
4. When data loads, skeleton is replaced with actual data

**Changes:**
- Created `src/components/tables/TableSkeleton.tsx` component
- Updated `src/components/tables/index.ts` to export TableSkeleton
- Modified `UsersPage.tsx` to conditionally render TableSkeleton when loading
- Skeleton receives columns metadata and rowCount (based on pagination.pageSize)

**Impact:**
- Better perceived performance with visual feedback
- Users can see the table structure while data loads
- More professional and polished loading experience
- Matches Material Design loading patterns

---

#### Feature #3: Optimistic UI for Status Toggle
**Location:** `src/hooks/useUsers.ts`, `src/pages/UsersPage/UsersPage.tsx`

**Previous State:** When toggling user status (active/inactive), UI waited for the API response before updating the button and table. This created a lag between user action and visual feedback.

**Implementation:**
Uses React Query's mutation callbacks to implement optimistic UI:
- **onMutate**: Immediately update the cached user list with new status before API call
- **onError**: Rollback to the previous cached state if the API fails
- **onSuccess**: Merge the server-confirmed response into cache (no refetch needed)

**How It Works:**
1. User clicks activate/deactivate button → `onMutate` runs immediately
2. Cached list updates with the new status → UI updates instantly
3. API call happens in the background (no wait)
4. If API succeeds: `onSuccess` merges server data into cache (already correct)
5. If API fails: `onError` reverts cache to previous state + error snackbar shows

**Key Optimizations:**
- Passes current list params (`page`, `pageSize`, `status`, `search`) to the hook so it targets the exact cached list for the visible page
- `onSuccess` merges server response instead of invalidating queries, preventing the table from "loading" again
- Fallback invalidation only if params are unknown

**Changes:**
- Updated `useUpdateUserStatus` to accept optional `currentParams: PaginationParams`
- Implemented `onMutate`: cancel in-flight queries and take cache snapshot
- Implemented `onError`: restore snapshot if mutation fails
- Implemented `onSuccess`: merge updated user into cached list
- Modified `UsersPage.tsx` to pass current pagination/filter state to the hook
- Added `User` type import to hook for type-safe response handling

**Impact:**
- Status toggle feels instant with zero perceived delay
- Seamless UI update with no loading spinner or table flicker
- Safe rollback on error preserves data integrity
- Professional, responsive user experience

---

### UI/UX Enhancements

#### Styling & Theme Improvements
**Location:** `src/App.tsx`, `src/components/tables/DynamicGrid.tsx`, `src/pages/UsersPage/UsersPage.tsx`

**Implementation:**

**Enhanced MUI Theme:**
- Refined primary (#1565c0) and secondary (#7b1fa2) palette colors
- Improved typography with Inter/Roboto font stack
- Rounded corners (10px base shape, 8px buttons, 12px papers, 6px chips)
- Consistent spacing and component defaults

**Component Overrides:**
- Buttons: removed text-transform, added 8px border-radius
- Papers: added rounded 12px radius, default elevation
- Chips: set small size default, 6px border-radius
- Table cells: styled header with subtle background (#f0f3f7) and border
- Icon buttons: set small size default

**Table Polish:**
- Sticky headers for better scrolling experience
- Zebra striping with subtle alternating row colors (rgba(0,0,0,0.02))
- Improved hover states with clearer action.hover background
- Enhanced chip styling:
  - Active status: success-filled with checkmark
  - Inactive status: warning-outlined for visibility
  - Group chips: primary color with consistent rounding
- Better visual hierarchy with styled table headers

**Empty & Error States:**
- Friendly "No users found" message when dataset is empty
- Helpful prompts to adjust filters or search query
- Proper error alerts when API fails to load users

**Changes:**
- Updated theme palette, typography, and component overrides in `App.tsx`
- Added sticky header (`enableStickyHeader: true`) to `DynamicGrid`
- Added zebra striping with `&:nth-of-type(odd)` styling on table rows
- Enhanced chip rendering with better colors (success/warning/primary) and variants
- Added empty state conditional render in `UsersPage` when `usersWithActions.length === 0`
- Improved error handling in error state block

**Impact:**
- More polished, professional appearance aligned with modern design standards
- Better user experience with clearer visual hierarchy and feedback
- Improved accessibility with sticky headers and better contrast
- More intuitive empty/error states help users understand application state
- Consistent, cohesive design language across all components

---

#### Feature #4: Comprehensive Error Handling
**Location:** `src/components/ErrorBoundary.tsx`, `src/api/userApi.ts`, `src/hooks/useUsers.ts`, `src/pages/UsersPage/UsersPage.tsx`, `src/App.tsx`

**Previous State:** Basic error alert when API fails. No handling for unexpected React errors. No retry mechanism for failed requests.

**Implementation:**

**Error Boundary Component:**
- Created global `ErrorBoundary` component using React Error Boundary pattern
- Catches render errors, lifecycle errors, and constructor errors anywhere in component tree
- Displays user-friendly fallback UI instead of crashing the entire app
- Shows detailed error stack trace in development mode only
- Provides "Try Again" reset button and "Go Home" navigation
- Tracks error occurrence count for debugging

**Enhanced API Error Handling:**
- Created custom `ApiError` class with status code, status text, error message, and optional details
- Handles network errors (connection failures) with meaningful messages
- Adds 30-second timeout to all API requests
- Gracefully handles JSON parsing errors
- Provides context-specific error messages for different failure scenarios

**Automatic Retry Logic:**
- `useUsers` hook now retries failed requests up to 3 times
- Progressive backoff strategy: 500ms → 1s → 2s delays between retries
- Smart retry logic: skips retries for client errors (4xx), only retries network/server errors (5xx)
- Reduces impact of temporary network issues

**Improved Error UI in UsersPage:**
- Replaced basic `Alert` with comprehensive error panel
- Shows user-friendly error messages based on error type:
  - Network errors: "Check your internet connection"
  - Timeout errors: "Server is taking too long to respond"
  - Generic errors: Contextual message
- "Try Again" button to manually retry failed requests
- "Reset Filters" button to recover from error state
- Technical details shown in development mode only

**Global Error Protection:**
- Wrapped entire app with `ErrorBoundary` in `App.tsx`
- Prevents catastrophic failures from breaking the app
- User can always recover or navigate home

**Changes:**
- Created `src/components/ErrorBoundary.tsx` with full error boundary implementation
- Exported `ErrorBoundary` from `src/components/index.ts`
- Enhanced `src/api/userApi.ts`:
  - Added `ApiError` class
  - Added `handleApiError` helper function
  - Added 30s timeout to all fetch requests
  - Improved error messages and error type detection
- Updated `src/hooks/useUsers.ts`:
  - Added `retry` configuration (max 3 attempts)
  - Added `retryDelay` with progressive backoff
- Enhanced `src/pages/UsersPage/UsersPage.tsx`:
  - Added `refetch` from `useUsers` hook
  - Added `getErrorMessage` helper for user-friendly messages
  - Added `handleRetry` function
  - Replaced basic error alert with comprehensive error panel
  - Added "Try Again" and "Reset Filters" buttons
- Wrapped app with `ErrorBoundary` in `src/App.tsx`

**Impact:**
- Significantly improved error resilience and user experience
- Users can recover from errors without refreshing the page
- Automatic retries reduce frustration from temporary network issues
- Development-friendly error details speed up debugging
- Professional error handling aligned with production standards
- App remains stable even when unexpected errors occur
