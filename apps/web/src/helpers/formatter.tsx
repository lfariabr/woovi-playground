import mongoose from 'mongoose';

export function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
      hour12: false
    }).replace(',', '');
  }

export function formatCurrency(value: number | string | null): string {
    const num = typeof value === 'number' ? value : parseFloat(value?.toString() || '0');
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
}