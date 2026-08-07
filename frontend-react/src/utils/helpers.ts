export const fmtDate = (d: string) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—';

export const daysLeft = (d: string) =>
  Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);

export const flag = (c: string) =>
  ({Germany:'🇩🇪',UK:'🇬🇧',Netherlands:'🇳🇱',Sweden:'🇸🇪',Switzerland:'🇨🇭',
    Belgium:'🇧🇪',France:'🇫🇷',Denmark:'🇩🇰',Ireland:'🇮🇪',Norway:'🇳🇴',
    Austria:'🇦🇹',Finland:'🇫🇮',Italy:'🇮🇹',USA:'🇺🇸',Canada:'🇨🇦',Other:'🌍'}[c] || '🌍');

export const degreeLabel = (d: string) =>
  ({bachelor:"Bachelor's",master:"Master's",phd:'PhD',any:'Any Level'}[d] || d);

export const statusCfg: Record<string,{label:string;cls:string}> = {
  pending:      { label:'⏳ Challan Due',   cls:'status-pending' },
  challan_paid: { label:'🧾 Under Review',  cls:'status-review' },
  approved:     { label:'✅ Approved',       cls:'status-approved' },
  rejected:     { label:'❌ Rejected',       cls:'status-rejected' },
  cancelled:    { label:'🚫 Cancelled',      cls:'status-cancelled' },
  expired:      { label:'⛔ Expired',        cls:'status-rejected' },
};

// Input restrictions for fields with a real-world format — strips characters
// that could never be valid instead of only catching them at submit time.
export const FIELD_RESTRICTIONS: Record<string, { maxLength: number; sanitize: (v: string) => string; inputMode?: string }> = {
  phone: {
    maxLength: 20,
    inputMode: 'tel',
    sanitize: (v) => v.replace(/[^\d+\-() ]/g, ''),
  },
  // Covers both a Pakistani CNIC (13 digits, e.g. 12345-1234567-1) and a
  // passport number (letters + digits, usually <= 9 characters) since this
  // field accepts either.
  cnic: {
    maxLength: 15,
    sanitize: (v) => v.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase(),
  },
};
