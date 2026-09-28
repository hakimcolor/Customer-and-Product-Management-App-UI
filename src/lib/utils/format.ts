export const formatCurrency = (amount: number, currency = '৳') =>
  `${currency} ${amount.toLocaleString('en-BD', { minimumFractionDigits: 0 })}`;

export const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString('en-BD', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export const formatDateTime = (date: string | Date) =>
  new Date(date).toLocaleString('en-BD', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const formatNumber = (n: number) => n.toLocaleString('en-BD');

export const truncate = (str: string, max = 30) =>
  str.length > max ? str.slice(0, max) + '...' : str;
