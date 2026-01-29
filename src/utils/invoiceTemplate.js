// utils/invoiceTemplate.js
export function printBrandedInvoice(inv, opts = {}) {
  const brand = {
    name: "shoukhinshop",
    slogan: "",
    address: "EI Mercado,114, Begum Rokeya Avenue, Mirpur-10, Dhaka, Bangladesh",
    phone: "017XXXXXXXX",
    email: "info@shoukhinshop.com",
    bin: "BIN: —",
    tin: "TIN: —",
    website: "https://shoukhinshoplifestyle.com",
    // TODO: নিজের লোগোর স্থায়ী URL দিন (CDN/ /uploads path)
    logo: opts.logo || "https://shoukhinshoplifestyle.com/assets/logo-Cal7droB.png",
    color: "#F57C00", // brand orange
    ...opts.brand,
  };

  const currency = (n) =>
    new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 0,
    }).format(Number(n || 0));

  const dateBD = (d) =>
    new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Dhaka",
    }).format(new Date(d || Date.now()));

  const items = (inv.items || []).map((it) => {
    const qty = it?.qty ?? it?.quantity ?? 1;
    const price = Number(it?.price || 0);
    const subtotal = it?.subtotal ?? qty * price;
    return {
      name: it?.name || it?.productName || "Item",
      qty,
      price,
      subtotal,
    };
  });

  const subtotal = items.reduce((s, x) => s + Number(x.subtotal || 0), 0);
  const shipping = Number(inv.shipping || inv.shippingCost || 0);
  const discount = Number(inv.discount || 0);
  const vat = Number(inv.vat || 0); // চাইলে সার্ভারেই হিসাব দিন
  const grand =
    Number(inv.totalAmount ?? subtotal + shipping + vat - discount);

  const status = String(inv.status || "unpaid").toLowerCase();

  const rows = items
    .map(
      (r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(r.name)}</td>
        <td class="t-center">${r.qty}</td>
        <td class="t-right">${currency(r.price)}</td>
        <td class="t-right">${currency(r.subtotal)}</td>
      </tr>`
    )
    .join("");

  const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Invoice #${(inv._id || "").toString().slice(-6)}</title>
  <style>
    :root{
      --brand:${brand.color};
      --ink:#0f172a;
      --muted:#64748b;
      --line:#e5e7eb;
    }
    *{box-sizing:border-box}
    body{margin:0; color:var(--ink); font:14px/1.55 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial}
    .container{max-width:840px; margin:0 auto; padding:24px}
    header{display:flex; gap:16px; align-items:center; border-bottom:3px solid var(--brand); padding-bottom:12px}
    .logo{height:58px; object-fit:contain}
    .company h1{margin:0; font-size:20px; letter-spacing:.2px}
    .company p{margin:2px 0; color:var(--muted)}
    .meta{display:flex; justify-content:space-between; gap:12px; padding:12px 0 4px}
    .meta .left div, .meta .right div{margin:2px 0}
    .badge{display:inline-block; padding:2px 10px; border-radius:9999px; font-size:12px; font-weight:600; border:1px solid}
    .paid{background:#dcfce7; color:#065f46; border-color:#bbf7d0}
    .unpaid{background:#fef3c7; color:#92400e; border-color:#fde68a}
    .partial{background:#e0e7ff; color:#3730a3; border-color:#c7d2fe}
    .refunded{background:#ffe4e6; color:#9f1239; border-color:#fecdd3}
    h3.section{margin:14px 0 6px; font-size:14px; color:var(--muted); text-transform:uppercase; letter-spacing:.5px}
    table{width:100%; border-collapse:collapse}
    thead th{background:#f8fafc; border:1px solid var(--line); padding:8px; text-align:left; font-weight:600}
    tbody td{border:1px solid var(--line); padding:8px; vertical-align:top}
    td.t-right{text-align:right} td.t-center{text-align:center}
    .totals{margin-top:10px; width:360px; margin-left:auto}
    .totals td{border:none; padding:6px 0}
    .totals tr:last-child td{border-top:2px solid var(--brand); font-weight:700; padding-top:8px}
    .notes{margin-top:14px; color:var(--muted)}
    .signs{display:flex; gap:24px; margin-top:40px}
    .sign{flex:1}
    .sign .line{border-top:1px dashed var(--line); margin-top:40px; padding-top:6px; text-align:center; color:var(--muted)}
    footer{margin-top:28px; padding-top:10px; border-top:1px solid var(--line); color:var(--muted); font-size:12px; display:flex; justify-content:space-between}
    .brandline{height:4px; background:var(--brand); margin-top:4px; border-radius:3px}
    @media print{
      @page{ size:A4; margin:12mm; }
      .noprint{display:none!important}
      body{background:white}
      .container{padding:0}
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <img class="logo" src="${brand.logo}" alt="Logo"/>
      <div class="company">
        <h1>${escapeHtml(brand.name)}</h1>
        ${brand.slogan ? `<p>${escapeHtml(brand.slogan)}</p>` : ""}
        <p>${escapeHtml(brand.address)}</p>
        <p>${escapeHtml(brand.phone)} • ${escapeHtml(brand.email)}</p>
        <p>${escapeHtml(brand.bin)} • ${escapeHtml(brand.tin)}</p>
      </div>
    </header>

    <div class="meta">
      <div class="left">
        <div><strong>Invoice:</strong> ${formatCode(inv)}</div>
        <div><strong>Date:</strong> ${dateBD(inv.issuedAt || inv.createdAt)}</div>
        <div><strong>Status:</strong> <span class="badge ${status}">${status}</span></div>
      </div>
      <div class="right" style="text-align:right">
        <div><strong>Customer:</strong> ${escapeHtml(inv.customer?.name || inv.userId?.name || "—")}</div>
        <div><strong>Mobile:</strong> ${escapeHtml(inv.customer?.mobile || inv.userId?.mobile || "—")}</div>
        <div><strong>Address:</strong> ${escapeHtml(inv.customer?.address || inv.address || "—")}</div>
      </div>
    </div>
    <div class="brandline"></div>

    <h3 class="section">Items</h3>
    <table>
      <thead>
        <tr>
          <th style="width:48px">#</th>
          <th>Description</th>
          <th style="width:70px">Qty</th>
          <th style="width:120px">Unit Price</th>
          <th style="width:130px">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${rows || `<tr><td colspan="5" class="t-center" style="color:var(--muted)">No items</td></tr>`}
      </tbody>
    </table>

    <table class="totals">
      <tbody>
        <tr><td>Subtotal</td><td class="t-right">${currency(subtotal)}</td></tr>
        <tr><td>Shipping</td><td class="t-right">${currency(shipping)}</td></tr>
        ${discount ? `<tr><td>Discount</td><td class="t-right">− ${currency(discount)}</td></tr>` : ""}
        ${vat ? `<tr><td>VAT</td><td class="t-right">${currency(vat)}</td></tr>` : ""}
        <tr><td><strong>Total</strong></td><td class="t-right"><strong>${currency(grand)}</strong></td></tr>
      </tbody>
    </table>

    <div class="notes">
      <strong>Terms:</strong> Goods once sold are not returnable unless defective. Keep this invoice for warranty/returns.
    </div>

    <div class="signs">
      <div class="sign"><div class="line">Authorized Signature</div></div>
      <div class="sign"><div class="line">Received By</div></div>
    </div>

    <footer>
      <div>Thank you for your purchase.</div>
      <div>${escapeHtml(brand.website)}</div>
    </footer>
  </div>

  <script>
    window.onload = () => window.print();
  </script>
</body>
</html>`;

  const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=900");
  if (w) {
    w.document.open();
    w.document.write(html);
    w.document.close();
  } else {
    // fallback: iframe
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0"; iframe.style.bottom = "0";
    iframe.style.width = "0"; iframe.style.height = "0"; iframe.style.border = "0";
    document.body.appendChild(iframe);
    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(html);
    iframe.contentWindow.document.close();
    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => iframe.remove(), 1000);
    };
  }

  function formatCode(inv) {
    const short = (inv?._id || "").toString().slice(-6);
    return short ? `MMT-${short}` : "—";
  }
  function escapeHtml(s="") {
    return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }
}
