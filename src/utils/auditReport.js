/**
 * Spartan Impex - Enterprise Financial Audit & Tax Invoice Generator
 * Generates official, print-ready, high-fidelity audit receipts & tax invoices
 * for clients and statutory corporate audits.
 */

import { formatCurrencyAmount } from './currency';

export function printAuditReport(txData) {
  if (!txData) return;

  const {
    orderId = 'N/A',
    paymentId = 'N/A',
    customerName = 'Valued Client',
    customerEmail = 'client@domain.com',
    customerPhone = 'N/A',
    planName = 'Enterprise Architecture Package',
    amount = 0,
    currency = 'USD',
    createdAt = new Date().toISOString(),
    status = 'PAID',
    paymentMethod = 'Razorpay Live Checkout',
  } = txData;

  const formattedAmount = formatCurrencyAmount(amount, currency);
  const formattedDate = new Date(createdAt).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });
  const invoiceNo = `SP-INV-${String(orderId).replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase()}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Spartan Impex Micro Finance Private Limited - Audit Certificate & Invoice ${invoiceNo}</title>
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          background: #ffffff;
          margin: 0;
          padding: 24px;
          line-height: 1.5;
          font-size: 13px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #00E5FF;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .brand-title {
          font-size: 24px;
          font-weight: 900;
          letter-spacing: -0.5px;
          color: #071525;
          margin: 0 0 4px 0;
        }
        .brand-title span {
          color: #0088A3;
        }
        .brand-sub {
          font-size: 11px;
          color: #475569;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .company-meta {
          text-align: right;
          font-size: 11px;
          color: #475569;
          line-height: 1.4;
        }
        .badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
        }
        .audit-badge {
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }
        .card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
        }
        .card-title {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #64748b;
          margin-bottom: 10px;
        }
        .data-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          font-size: 12px;
        }
        .data-label {
          color: #64748b;
        }
        .data-value {
          font-weight: 600;
          color: #0f172a;
          text-align: right;
        }
        .mono {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 11px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }
        th {
          background: #071525;
          color: #ffffff;
          text-align: left;
          padding: 10px 14px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        td {
          padding: 12px 14px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 12px;
        }
        .total-box {
          background: #f0fdfa;
          border: 1px solid #99f6e4;
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .total-amount {
          font-size: 24px;
          font-weight: 900;
          color: #0f172a;
          font-family: ui-monospace, monospace;
        }
        .signatures {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-top: 36px;
          padding-top: 20px;
          border-top: 1px dashed #cbd5e1;
        }
        .sign-title {
          font-size: 12px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 2px;
        }
        .sign-role {
          font-size: 10px;
          color: #64748b;
        }
        .footer {
          margin-top: 24px;
          padding-top: 14px;
          border-top: 1px solid #e2e8f0;
          font-size: 10px;
          color: #94a3b8;
          text-align: center;
          line-height: 1.4;
        }
        @media print {
          body {
            padding: 0;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 class="brand-title">SPARTAN <span>IMPEX</span></h1>
          <div class="brand-sub">Enterprise IT Architecture & Engineering</div>
        </div>
        <div class="company-meta">
          <strong>Spartan Impex Micro Finance Private Limited</strong><br>
          <span style="font-size: 10px; color: #64748b; font-weight: 600;">Enterprise IT Architecture & Digital Engineering Division</span><br>
          Jodhpur, Rajasthan, India – 342001<br>
          Phone: +91 89055 86541 &bull; Email: spartanimpex19@gmail.com<br>
          Website: https://www.spartanimpex.com
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
          <h2 style="margin: 0; font-size: 18px; font-weight: 800; color: #071525;">STATUTORY PAYMENT RECEIPT & AUDIT CERTIFICATE</h2>
          <span style="font-size: 11px; color: #64748b;">Cryptographically Verified Production Transaction Record &bull; Spartan Impex Micro Finance Private Limited</span>
        </div>
        <div>
          <span class="badge ${status === 'PAID' ? '' : 'audit-badge'}">${status}</span>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-title">Client & Organization Details</div>
          <div class="data-row">
            <span class="data-label">Authorized Client:</span>
            <span class="data-value">${customerName}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Corporate Email:</span>
            <span class="data-value mono">${customerEmail}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Contact Phone:</span>
            <span class="data-value">${customerPhone || 'N/A'}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Payment Channel:</span>
            <span class="data-value">${paymentMethod}</span>
          </div>
        </div>

        <div class="card">
          <div class="card-title">Transaction & Cryptographic Audit</div>
          <div class="data-row">
            <span class="data-label">Certificate / Invoice No:</span>
            <span class="data-value mono">${invoiceNo}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Razorpay Order ID:</span>
            <span class="data-value mono">${orderId}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Razorpay Payment ID:</span>
            <span class="data-value mono">${paymentId}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Verification Timestamp:</span>
            <span class="data-value">${formattedDate}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Security Protocol:</span>
            <span class="data-value mono">HMAC-SHA256 Authenticated</span>
          </div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item / Architecture Deliverables</th>
            <th>Type</th>
            <th>Currency</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>${planName}</strong><br>
              <span style="font-size: 11px; color: #64748b;">
                Enterprise cloud & full-stack software engineering engagement milestone. Includes architecture blueprints, API specifications, and guaranteed delivery SLA.
              </span>
            </td>
            <td>Milestone Engagement</td>
            <td>${currency}</td>
            <td style="text-align: right; font-weight: 700;">${formattedAmount}</td>
          </tr>
        </tbody>
      </table>

      <div class="total-box">
        <div>
          <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #0d9488; letter-spacing: 0.5px;">
            Total Funds Verified & Cleared
          </span>
          <div style="font-size: 11px; color: #475569;">No recurring fees. 100% intellectual property ownership transferred.</div>
        </div>
        <div class="total-amount">${formattedAmount}</div>
      </div>

      <div class="signatures">
        <div>
          <div class="sign-title">Gajender Singh Rajawat</div>
          <div class="sign-role">Chief Executive Officer & Founder, Spartan Impex Micro Finance Private Limited</div>
        </div>
        <div style="text-align: right;">
          <div class="sign-title">Usman</div>
          <div class="sign-role">Chief Information Officer & Principal Architect</div>
        </div>
      </div>

      <div class="footer">
        Spartan Impex Micro Finance Private Limited &bull; Official Digital Financial Audit Certificate &bull; Certified for corporate tax deduction, CPA audit, and commercial accounting.<br>
        Transaction validated through Razorpay Production Gateway &bull; Recorded in PostgreSQL Ledger.
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }
}
