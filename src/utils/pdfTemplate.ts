import { Bill, Draft, BillItem } from '../types';

const formatCurrency = (amount: number) =>
  `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

const itemRows = (items: BillItem[]) =>
  items
    .map(
      (item, i) => `
      <tr style="background:${i % 2 === 0 ? '#f9f9fb' : '#ffffff'}">
        <td style="padding:10px 14px;font-size:14px;color:#1a1a2e;">${item.name}</td>
        <td style="padding:10px 14px;text-align:center;font-size:14px;color:#444;">${item.quantity}</td>
        <td style="padding:10px 14px;text-align:right;font-size:14px;color:#444;">${formatCurrency(item.price)}</td>
        <td style="padding:10px 14px;text-align:right;font-size:14px;font-weight:600;color:#1a1a2e;">${formatCurrency(item.quantity * item.price)}</td>
      </tr>`
    )
    .join('');

export const generateBillHTML = (bill: Bill | Draft, businessName = 'SynCommerce'): string => {
  const subtotal = bill.items.reduce((s, i) => s + i.quantity * i.price, 0);
  const total = (bill as Bill).total ?? subtotal - (bill.discount ?? 0) + (bill.tax ?? 0);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Invoice</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#fff; }
    .page { max-width:680px; margin:0 auto; padding:40px 36px; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:36px; }
    .brand { font-size:28px; font-weight:800; color:#6C63FF; letter-spacing:-0.5px; }
    .brand span { color:#00D4AA; }
    .invoice-label { text-align:right; }
    .invoice-label h2 { font-size:22px; font-weight:700; color:#1a1a2e; }
    .invoice-label p { font-size:13px; color:#666; margin-top:4px; }
    .divider { height:3px; background:linear-gradient(90deg,#6C63FF,#00D4AA); border-radius:2px; margin-bottom:28px; }
    .info-grid { display:flex; justify-content:space-between; margin-bottom:28px; gap:20px; }
    .info-box { flex:1; }
    .info-box h4 { font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#888; margin-bottom:8px; }
    .info-box p { font-size:14px; color:#1a1a2e; font-weight:600; line-height:1.6; }
    .info-box .sub { font-size:13px; color:#666; font-weight:400; }
    table { width:100%; border-collapse:collapse; margin-bottom:24px; border-radius:10px; overflow:hidden; }
    thead { background:linear-gradient(135deg,#6C63FF,#4B44CC); }
    thead th { padding:12px 14px; text-align:left; font-size:12px; text-transform:uppercase; letter-spacing:0.8px; color:#fff; font-weight:600; }
    thead th:not(:first-child) { text-align:center; }
    thead th:last-child { text-align:right; }
    .totals { margin-left:auto; width:260px; }
    .total-row { display:flex; justify-content:space-between; padding:7px 0; font-size:14px; color:#444; }
    .total-row.main { font-size:17px; font-weight:800; color:#1a1a2e; border-top:2px solid #6C63FF; padding-top:12px; margin-top:4px; }
    .notes-box { background:#f5f4ff; border-left:4px solid #6C63FF; padding:14px 16px; border-radius:6px; margin-bottom:28px; }
    .notes-box p { font-size:13px; color:#555; line-height:1.5; }
    .footer { text-align:center; margin-top:36px; padding-top:20px; border-top:1px solid #eee; }
    .footer p { font-size:12px; color:#aaa; }
    .status-badge { display:inline-block; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:700; letter-spacing:0.5px; }
    .status-final { background:#e6fff9; color:#00A884; }
    .status-draft { background:#fff8e6; color:#E09030; }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="brand">Syn<span>Commerce</span></div>
      <p style="font-size:13px;color:#888;margin-top:4px;">${businessName}</p>
    </div>
    <div class="invoice-label">
      <h2>INVOICE</h2>
      <p>${(bill as Bill).id ? `#${(bill as Bill).id.slice(-8).toUpperCase()}` : 'DRAFT'}</p>
      <p style="margin-top:6px;">
        <span class="status-badge ${(bill as Bill).status === 'final' ? 'status-final' : 'status-draft'}">
          ${((bill as Bill).status ?? 'draft').toUpperCase()}
        </span>
      </p>
    </div>
  </div>

  <div class="divider"></div>

  <div class="info-grid">
    <div class="info-box">
      <h4>Bill To</h4>
      <p>${bill.customer_name || 'Walk-in Customer'}</p>
      ${bill.customer_phone ? `<p class="sub">📞 ${bill.customer_phone}</p>` : ''}
    </div>
    <div class="info-box" style="text-align:right;">
      <h4>Date</h4>
      <p>${formatDate(bill.created_at)}</p>
      <p class="sub">Created by: ${bill.created_by}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th style="text-align:center;">Qty</th>
        <th style="text-align:right;">Price</th>
        <th style="text-align:right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows(bill.items)}
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
    ${bill.discount ? `<div class="total-row"><span>Discount</span><span style="color:#FF5A5F;">- ${formatCurrency(bill.discount)}</span></div>` : ''}
    ${bill.tax ? `<div class="total-row"><span>Tax</span><span>${formatCurrency(bill.tax)}</span></div>` : ''}
    <div class="total-row main"><span>TOTAL</span><span style="color:#6C63FF;">${formatCurrency(total)}</span></div>
  </div>

  ${bill.notes ? `
  <div class="notes-box" style="margin-top:24px;">
    <p><strong>Notes:</strong> ${bill.notes}</p>
  </div>` : ''}

  <div class="footer">
    <p>Thank you for your business! 🙏</p>
    <p style="margin-top:4px;">Generated by SynCommerce · ${new Date().toLocaleDateString('en-IN')}</p>
  </div>
</div>
</body>
</html>`;
};
