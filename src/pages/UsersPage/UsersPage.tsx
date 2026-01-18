import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  InputAdornment,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import { useSnackbar } from 'notistack';
import { DynamicGrid, UserActions, TableSkeleton } from '@/components';
import { useUsers, useUpdateUserStatus, useDebounce, usePersistentState } from '@/hooks';
import { userColumnMetadata } from '@/utils';
import type { MRT_PaginationState, MRT_SortingState, MRT_VisibilityState } from 'material-react-table';
import type { User, ColumnMetadata } from '@/types';

/**
 * Users Page Component
 *
 * Displays a paginated, filterable list of users.
 *
 * KNOWN BUGS FOR CANDIDATE TO FIX:
 *
 * BUG #1: After changing user status, the table doesn't refresh.
 *         (Located in useUsers hook - cache invalidation issue)
 *
 * BUG #2: The 'Groups' column shows "[object Object]" instead of group names.
 *         (Located in DynamicGrid component - chiplist renderer issue)
 *
 * INCOMPLETE FEATURES:
 *
 * 1. No error boundary or proper error UI.
 */
export const UsersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();

  // Initialize state from URL params
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>(
    (searchParams.get('status') as 'all' | 'active' | 'inactive') || 'all'
  );
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: Math.max(0, (parseInt(searchParams.get('page') || '1') - 1)),
    pageSize: parseInt(searchParams.get('pageSize') || '10'),
  });

  // Sorting state from URL params
  const [sorting, setSorting] = useState<MRT_SortingState>(() => {
    const sortColumn = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | null;
    if (sortColumn && sortOrder) {
      return [{ id: sortColumn, desc: sortOrder === 'desc' }];
    }
    return [];
  });

  // Column visibility state persisted in localStorage
  const [columnVisibility, setColumnVisibility] = usePersistentState<MRT_VisibilityState>(
    'users-column-visibility',
    {}
  );

  // Debounce search query to prevent excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Update URL when pagination, filters, or sorting changes
  useEffect(() => {
    const newParams = new URLSearchParams();
    newParams.set('page', (pagination.pageIndex + 1).toString());
    newParams.set('pageSize', pagination.pageSize.toString());
    if (statusFilter !== 'all') {
      newParams.set('status', statusFilter);
    }
    if (debouncedSearchQuery) {
      newParams.set('search', debouncedSearchQuery);
    }
    if (sorting.length > 0) {
      newParams.set('sortBy', sorting[0].id);
      newParams.set('sortOrder', sorting[0].desc ? 'desc' : 'asc');
    }
    setSearchParams(newParams);
  }, [pagination, statusFilter, debouncedSearchQuery, sorting, setSearchParams]);

  // Fetch users with debounced search query
  const primarySort = sorting[0];
  const { data, isLoading, error, refetch } = useUsers({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    query: debouncedSearchQuery,
    status: statusFilter,
    sortBy: primarySort?.id,
    sortOrder: primarySort ? (primarySort.desc ? 'desc' : 'asc') : undefined,
  });

  // Update user status mutation with optimistic UI for the current page dataset
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateUserStatus({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    query: debouncedSearchQuery,
    status: statusFilter,
    sortBy: primarySort?.id,
    sortOrder: primarySort ? (primarySort.desc ? 'desc' : 'asc') : undefined,
  });

  /**
   * Get user-friendly error message from error object
   */
  const getErrorMessage = (): string => {
    if (!error) return 'Unknown error occurred';
    
    if (error instanceof Error) {
      if (error.message.includes('Network')) {
        return 'Network connection failed. Please check your internet connection and try again.';
      }
      if (error.message.includes('timeout')) {
        return 'Request timed out. The server is taking too long to respond.';
      }
      return error.message;
    }
    
    return 'Failed to load users. Please try again.';
  };

  const handleRetry = () => {
    refetch();
  };

  // Handle status toggle
  const handleToggleStatus = (userId: string, newStatus: 'active' | 'inactive') => {
    updateStatus(
      { userId, status: newStatus },
      {
        onSuccess: (response) => {
          // UI already updated optimistically; show success message
          enqueueSnackbar(response.message, { variant: 'success' });
        },
        onError: () => {
          enqueueSnackbar('Failed to update user status', { variant: 'error' });
        },
      }
    );
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Reset to first page when searching
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: 'all' | 'active' | 'inactive') => {
    setStatusFilter(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  // Handle pagination change
  const handlePaginationChange = (newPagination: MRT_PaginationState) => {
    setPagination(newPagination);
  };

  // Handle sorting change
  const handleSortingChange = (newSorting: MRT_SortingState) => {
    setSorting(newSorting);
  };

  // Handle column visibility change
  const handleColumnVisibilityChange = (newVisibility: MRT_VisibilityState) => {
    setColumnVisibility(newVisibility);
  };

  // Add actions column to metadata
  const columnsWithActions: ColumnMetadata[] = [
    ...userColumnMetadata,
    {
      key: 'actions',
      header: 'Actions',
      type: 'string',
      width: 100,
    },
  ];

  // Transform data to include actions renderer
  const usersWithActions = (data?.data?.users || []).map((user: User) => ({
    ...user,
    actions: (
      <UserActions
        user={user}
        onToggleStatus={handleToggleStatus}
        isUpdating={isUpdating}
      />
    ),
  }));

  // Error state with retry button
  if (error) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Users
        </Typography>

        <Paper
          sx={{
            p: 3,
            backgroundColor: 'error.50',
            borderLeft: '4px solid',
            borderColor: 'error.main',
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <WarningIcon sx={{ color: 'error.main', mt: 0.5, flexShrink: 0 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" color="error.main" sx={{ fontWeight: 600, mb: 1 }}>
                Failed to Load Users
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {getErrorMessage()}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                {import.meta.env.DEV && error instanceof Error
                  ? `Technical details: ${error.message}`
                  : ''}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<RefreshIcon />}
                  onClick={handleRetry}
                  sx={{ px: 3 }}
                >
                  Try Again
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setPagination({ pageIndex: 0, pageSize: 10 });
                  }}
                  sx={{ px: 3 }}
                >
                  Reset Filters
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <Typography variant="h4" component="h1" gutterBottom>
        Users
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {/* Search Input - BUG: Not debounced! */}
          <TextField
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={handleSearchChange}
            size="small"
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {/* Status Filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) =>
                handleStatusFilterChange(e.target.value as 'all' | 'active' | 'inactive')
              }
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>

          {/* Results Count */}
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
            <Typography variant="body2" color="text.secondary">
              {data?.data?.totalCount || 0} users found
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Users Table */}
      <Paper>
        {isLoading ? (
          <TableSkeleton columns={columnsWithActions} rowCount={pagination.pageSize} />
        ) : usersWithActions.length === 0 ? (
          <Box sx={{ p: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1 }}>
            <Typography variant="h6" color="text.secondary">No users found</Typography>
            <Typography variant="body2" color="text.secondary">Try adjusting your filters or search query.</Typography>
          </Box>
        ) : (
          <DynamicGrid
            data={usersWithActions}
            columns={columnsWithActions}
            isLoading={isLoading}
            totalCount={data?.data?.totalCount || 0}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            sorting={sorting}
            onSortingChange={handleSortingChange}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={handleColumnVisibilityChange}
          />
        )}
      </Paper>
    </Box>
  );
};
