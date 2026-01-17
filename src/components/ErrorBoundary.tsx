import React, { Component, ReactNode } from 'react';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree.
 * Displays a fallback UI instead of crashing the entire app.
 *
 * Features:
 * - Catches render errors, lifecycle errors, and constructor errors
 * - Displays error details in development mode
 * - Provides user-friendly error message in production
 * - Offers a reset button to recover from the error state
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(_error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState((prevState) => ({
      error,
      errorCount: prevState.errorCount + 1,
    }));
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              py: 4,
            }}
          >
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
              <ErrorOutlineIcon
                sx={{ fontSize: 64, color: 'error.main', mb: 2 }}
              />
              <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
                Oops! Something went wrong
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3, maxWidth: 400 }}
              >
                We encountered an unexpected error. Please try again or contact support if the problem persists.
              </Typography>

              {/* Show error details in development */}
              {import.meta.env.DEV && this.state.error && (
                <Box
                  sx={{
                    mb: 3,
                    p: 2,
                    backgroundColor: 'error.50',
                    borderLeft: '4px solid',
                    borderColor: 'error.main',
                    textAlign: 'left',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="caption" component="div" sx={{ fontWeight: 600, mb: 1 }}>
                    Error Details (Development Only):
                  </Typography>
                  <Typography
                    variant="caption"
                    component="pre"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontSize: '0.7rem',
                      fontFamily: 'monospace',
                      color: 'error.dark',
                    }}
                  >
                    {this.state.error.message}
                    {'\n'}
                    {this.state.error.stack}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={this.handleReset}
                  sx={{ px: 4 }}
                >
                  Try Again
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => window.location.href = '/'}
                  sx={{ px: 4 }}
                >
                  Go Home
                </Button>
              </Box>

              {import.meta.env.DEV && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Error occurred {this.state.errorCount} time(s)
                </Typography>
              )}
            </Paper>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}
