import { ReactNode } from 'react';
import { Badge } from '@/shared/ui/badge';
import type { DataTableColumn } from '@/shared/data-table/types';
import { AccountPayable, PayableStatus } from '../types/accounts-payable';
import { formatCurrency, formatDate } from '../utils/formatters';

const STATUS_CONFIG: Record<
  PayableStatus,
  { label: string; variant: 'success' | 'primary' | 'default' | 'muted' }
> = {
  OPEN: { label: 'Pendiente', variant: 'default' },
  PARTIAL: { label: 'Abonado', variant: 'primary' },
  PAID: { label: 'Pagada', variant: 'success' },
  OVERDUE: { label: 'Vencida', variant: 'default' },
};

function getDaysRemaining(dueDateStr: string): number {
  const dueDate = new Date(dueDateStr);
  const now = new Date();
  dueDate.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffTime = dueDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function renderDaysRemaining(dueDateStr: string, status: PayableStatus) {
  if (status === 'PAID') return <span className="text-muted">—</span>;

  const days = getDaysRemaining(dueDateStr);
  
  if (days < 0) {
    return (
      <Badge variant="default">
        Vencida hace {Math.abs(days)} día{Math.abs(days) !== 1 && 's'}
      </Badge>
    );
  }
  if (days === 0) {
    return <Badge variant="default">Vence hoy</Badge>;
  }
  if (days <= 3) {
    return <Badge variant="default">Faltan {days} días</Badge>;
  }
  return <span className="text-body">{days} días</span>;
}

export function getAccountsPayableColumns(props: {
  onViewDetail: (item: AccountPayable) => void;
  onEditDueDate?: (item: AccountPayable) => void;
  onPay?: (item: AccountPayable) => void;
}): DataTableColumn<AccountPayable>[] {
  return [
    {
      id: 'purchase',
      header: 'Compra',
      cell: (item) => (
        <span className="font-semibold text-primary cursor-pointer hover:underline" onClick={() => props.onViewDetail(item)}>
          {item.purchase.invoiceNumber || `C-${item.purchase.id.slice(-6).toUpperCase()}`}
        </span>
      ),
    },
    {
      id: 'supplier',
      header: 'Proveedor',
      cell: (item) => <span className="text-body font-medium">{item.supplier.name}</span>,
    },
    {
      id: 'createdAt',
      header: 'Fecha',
      cell: (item) => <span className="text-body">{formatDate(item.createdAt)}</span>,
    },
    {
      id: 'dueDate',
      header: 'Vencimiento',
      cell: (item) => (
        <div className="flex items-center gap-2">
          <span className="text-body">{formatDate(item.dueDate)}</span>
          {props.onEditDueDate && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                props.onEditDueDate!(item);
              }}
              className="text-body/50 hover:text-primary transition-colors"
              title="Editar fecha de vencimiento"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
            </button>
          )}
        </div>
      ),
    },
    {
      id: 'originalAmount',
      header: 'Total',
      cell: (item) => (
        <span className="font-semibold text-body">
          {formatCurrency(item.originalAmount)}
        </span>
      ),
    },
    {
      id: 'balance',
      header: 'Balance',
      cell: (item) => (
        <span className="font-semibold text-body">
          {formatCurrency(item.balance)}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Estado',
      cell: (item) => {
        const config = STATUS_CONFIG[item.status];
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      id: 'daysRemaining',
      header: 'Días restantes',
      cell: (item) => renderDaysRemaining(item.dueDate, item.status),
    },
    {
      id: 'actions',
      header: '',
      cell: (item) => {
        const canPay = item.status === 'OPEN' || item.status === 'PARTIAL' || item.status === 'OVERDUE';
        if (!canPay || !props.onPay) return null;
        
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              props.onPay!(item);
            }}
            className="flex h-8 items-center rounded-lg border border-primary/20 bg-primary/5 px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            Abonar
          </button>
        );
      },
    },
  ];
}
