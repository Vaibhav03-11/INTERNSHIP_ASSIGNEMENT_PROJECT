import React, { useState, useCallback } from 'react';
import {
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import type { User } from '@/types';

interface UserActionsProps {
  user: User;
  onToggleStatus: (userId: string, newStatus: 'active' | 'inactive') => void;
  isUpdating?: boolean;
}

/**
 * UserActions Component
 *
 * Renders action buttons for a user row.
 * Currently shows activate/deactivate toggle.
 *
 * TODO FOR CANDIDATE:
 * 1. Implement optimistic UI - update the button state immediately
 *    before the API call completes.
 * 2. Handle error case - revert the optimistic update if API fails.
 * 3. Add a confirmation dialog before deactivating a user (optional).
 */
export const UserActions: React.FC<UserActionsProps> = ({
  user,
  onToggleStatus,
  isUpdating = false,
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const openConfirm = useCallback(() => setConfirmOpen(true), []);
  const closeConfirm = useCallback(() => setConfirmOpen(false), []);

  const handleConfirmDeactivate = useCallback(() => {
    onToggleStatus(user.userId, 'inactive');
    closeConfirm();
  }, [onToggleStatus, user.userId, closeConfirm]);

  const handleToggle = useCallback(() => {
    const newStatus: 'active' | 'inactive' =
      user.status === 'active' ? 'inactive' : 'active';
    // Show confirmation only before deactivating (recommended)
    if (newStatus === 'inactive') {
      openConfirm();
      return;
    }
    onToggleStatus(user.userId, newStatus);
  }, [onToggleStatus, user.status, user.userId, openConfirm]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleToggle();
      }
    },
    [handleToggle]
  );

  if (isUpdating) {
    return <CircularProgress size={20} />;
  }

  return (
    <>
      <Tooltip
        title={user.status === 'active' ? 'Deactivate User' : 'Activate User'}
      >
        <IconButton
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          color={user.status === 'active' ? 'error' : 'success'}
          size="small"
          aria-label={
            user.status === 'active' ? 'Deactivate user' : 'Activate user'
          }
          aria-haspopup={user.status === 'active' ? 'dialog' : undefined}
          sx={{
            transition: 'transform 120ms ease, background-color 120ms ease',
            '&:hover': {
              transform: 'scale(1.05)',
              backgroundColor: 'action.hover',
            },
            // Improve focus visibility for keyboard users
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: (theme) => theme.palette.primary.main,
              outlineOffset: '2px',
            },
          }}
        >
          {user.status === 'active' ? <CancelIcon /> : <CheckCircleIcon />}
        </IconButton>
      </Tooltip>

      {/* Confirmation dialog before deactivating a user */}
      <Dialog
        open={confirmOpen}
        onClose={closeConfirm}
        aria-labelledby={`deactivate-user-title-${user.userId}`}
        aria-describedby={`deactivate-user-desc-${user.userId}`}
      >
        <DialogTitle id={`deactivate-user-title-${user.userId}`}>
          Confirm Deactivation
        </DialogTitle>
        <DialogContent>
          <DialogContentText id={`deactivate-user-desc-${user.userId}`}>
            Are you sure you want to deactivate "{user.name}"?
            They will lose access until reactivated.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm} variant="outlined" autoFocus>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDeactivate}
            variant="contained"
            color="error"
            aria-label={`Confirm deactivate ${user.name}`}
          >
            Deactivate
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
