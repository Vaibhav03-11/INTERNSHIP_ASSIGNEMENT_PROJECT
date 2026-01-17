import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
} from '@mui/material';
import type { ColumnMetadata } from '@/types';

interface TableSkeletonProps {
  columns: ColumnMetadata[];
  rowCount?: number;
}

/**
 * TableSkeleton Component
 * 
 * Displays a loading skeleton for the table with placeholder rows
 * that match the actual table structure.
 */
export const TableSkeleton: React.FC<TableSkeletonProps> = ({ 
  columns, 
  rowCount = 10 
}) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.key} sx={{ width: col.width }}>
                <Skeleton variant="text" width="80%" />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((col) => (
                <TableCell key={col.key}>
                  {col.type === 'badge' ? (
                    <Skeleton variant="rounded" width={70} height={24} />
                  ) : col.type === 'chiplist' ? (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Skeleton variant="rounded" width={80} height={24} />
                      <Skeleton variant="rounded" width={80} height={24} />
                    </Box>
                  ) : col.type === 'date' ? (
                    <Skeleton variant="text" width={100} />
                  ) : (
                    <Skeleton variant="text" width="90%" />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
