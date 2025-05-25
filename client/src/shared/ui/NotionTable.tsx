import React, { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Определение типов для колонок
interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any) => ReactNode;
}

// Пропсы компонента таблицы
interface NotionTableProps {
  columns: Column[];
  rows: any[];
  hover?: boolean;
  onRowClick?: (row: any) => void;
  emptyMessage?: string;
  stickyHeader?: boolean;
}

// Стилизованные компоненты в стиле Notion
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  backgroundColor: 'var(--bg-secondary)',
  borderRadius: 'var(--border-radius-md)',
  border: '1px solid var(--border)',
  boxShadow: 'var(--shadow)',
  maxHeight: '70vh',
  overflowX: 'auto',
}));

const StyledTable = styled(Table)(({ theme }) => ({
  borderCollapse: 'separate',
  borderSpacing: 0,
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  '& th': {
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-secondary)',
    fontWeight: 600,
    fontSize: '14px',
    borderBottom: '1px solid var(--border)',
    padding: '10px 16px',
    textTransform: 'none',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: 'var(--text-primary)',
  padding: '12px 16px',
  borderBottom: '1px solid var(--border)',
  fontSize: '14px',
  fontFamily: 'Inter, sans-serif',
}));

const StyledTableRow = styled(TableRow)<{ isClickable?: boolean }>(
  ({ isClickable }) => ({
    transition: 'var(--transition-default)',
    ...(isClickable && {
      cursor: 'pointer',
    }),
    '&:hover': {
      backgroundColor: 'var(--bg-accent)',
    },
    '&:last-child td': {
      borderBottom: 0,
    },
    '&:nth-of-type(odd)': {
      backgroundColor: 'var(--bg-primary)',
    },
  })
);

const EmptyStateContainer = styled(Box)(({ theme }) => ({
  padding: '32px',
  textAlign: 'center',
  color: 'var(--text-secondary)',
}));

// Компонент таблицы в стиле Notion
const NotionTable: React.FC<NotionTableProps> = ({
  columns,
  rows,
  hover = true,
  onRowClick,
  emptyMessage = 'Нет данных для отображения',
  stickyHeader = false,
}) => {
  return (
    <StyledTableContainer>
      <StyledTable stickyHeader={stickyHeader}>
        <StyledTableHead>
          <TableRow>
            {columns.map(column => (
              <TableCell
                key={column.id}
                align={column.align || 'left'}
                style={{ minWidth: column.minWidth }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </StyledTableHead>
        <TableBody>
          {rows.length > 0 ? (
            rows.map((row, index) => (
              <StyledTableRow
                key={index}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                isClickable={!!onRowClick}
                hover={hover}
              >
                {columns.map(column => (
                  <StyledTableCell
                    key={column.id}
                    align={column.align || 'left'}
                  >
                    {column.format
                      ? column.format(row[column.id])
                      : row[column.id]}
                  </StyledTableCell>
                ))}
              </StyledTableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <EmptyStateContainer>
                  <Typography variant="body1" color="inherit">
                    {emptyMessage}
                  </Typography>
                </EmptyStateContainer>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </StyledTable>
    </StyledTableContainer>
  );
};

export default NotionTable;
