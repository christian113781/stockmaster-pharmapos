/* ════════════════════════════════════════════════════════════════
   PharmaPOS — SHARED DASHBOARD LOGIC
   ════════════════════════════════════════════════════════════════ */


/* ── Sales storage (shared by POS + Sales History; swap for your API later) ── */
var ppSales = {
  KEY: 'pp-sales',
  load() { try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } catch (e) { return []; } },
  save(list) { try { localStorage.setItem(this.KEY, JSON.stringify(list)); return true; } catch (e) { return false; } },
  add(sale) { const l = this.load(); l.unshift(sale); return this.save(l); },
};

/* ── Suppliers storage (shared by Suppliers + Medicines; swap for your API later) ── */
var ppSuppliers = {
  KEY: 'pp-suppliers',
  defaults() {
    const d = (n) => new Date(Date.now() - n * 86400000).toISOString();
    return [
      { id: 'sup-1', name: 'Zuellig Pharma', contact: 'Rico Mercado', phone: '0917 555 0141', email: 'orders@zuellig.example', address: 'Zuellig Building, Makati City', supplies: 'Antibiotics, maintenance medicines', terms: 'Net 30', status: 'active', notes: 'Orders placed before 2 PM are delivered next day.', added: d(210) },
      { id: 'sup-2', name: 'Mercury Drug Supply', contact: 'Liza Fernandez', phone: '0918 555 0172', email: 'supply@mercury.example', address: 'Mandaluyong City', supplies: 'Pain & fever, cough & cold', terms: 'Net 15', status: 'active', notes: '', added: d(180) },
      { id: 'sup-3', name: 'Unilab Distribution', contact: 'Paolo Santiago', phone: '0920 555 0108', email: 'sales@unilab.example', address: 'Pasig City', supplies: 'Vitamins & supplements, OTC brands', terms: 'Net 30', status: 'active', notes: 'Minimum order of ₱5,000 for free delivery.', added: d(120) },
      { id: 'sup-4', name: 'Metro Drug Inc.', contact: 'Grace Villanueva', phone: '0927 555 0163', email: '', address: 'Quezon City', supplies: 'First aid, personal care', terms: 'Cash on delivery', status: 'inactive', notes: 'Paused while we review pricing.', added: d(60) },
    ];
  },
  load() { try { const l = JSON.parse(localStorage.getItem(this.KEY)); return Array.isArray(l) ? l : this.defaults(); } catch (e) { return this.defaults(); } },
  save(list) { try { localStorage.setItem(this.KEY, JSON.stringify(list)); return true; } catch (e) { return false; } },
  names() { return this.load().filter(s => s.status === 'active').map(s => s.name); },
};

/* ── Purchase orders storage (swap for your API later) ── */
var ppPO = {
  KEY: 'pp-purchase-orders',
  /* 21 older demo orders so pagination has something to page through */
  older(d, ts) {
    const pool = [[1, 'Biogesic 500mg', 4], [2, 'Amoxil 500mg', 9], [3, 'Neozep 10/2mg', 5.5], [4, 'Cozaar 50mg', 15], [5, 'Ceelin 100mg/5mL', 70], [6, 'Kremil-S 178/233/30mg', 6],
                  [7, 'Betadine 10%', 85], [8, 'Glucophage 500mg', 7], [9, 'Solmux 500mg', 12], [10, 'Enervon', 5], [11, 'Loperamide 2mg', 6.5], [12, 'Ventolin 2mg/5mL', 100]];
    const sups = ['Zuellig Pharma', 'Mercury Drug Supply', 'Unilab Distribution', 'Metro Drug Inc.'];
    const cycle = ['received', 'received', 'received', 'cancelled', 'received', 'draft'];
    const out = [];
    for (let i = 0; i < 21; i++) {
      const status = i < 2 ? 'ordered' : cycle[i % cycle.length];
      const age = i < 2 ? 3 + i * 2 : 14 + i * 4;
      const pick = n => pool[(i * 3 + n) % pool.length];
      const lines = [pick(0), pick(5)].map(p => ({ med: p[0], name: p[1], qty: 20 + (i * 17 + p[0] * 7) % 180, cost: p[2] }));
      out.push({
        no: 'PO-' + String(410 - i).padStart(4, '0'), supplier: sups[i % sups.length], status, created: ts(-age),
        orderDate: status === 'ordered' || status === 'received' ? d(-(age - 1)) : null,
        expected: status === 'ordered' ? d(5 - i * 2) : d(-(age - 6)),
        receivedOn: status === 'received' ? d(-(age - 6)) : null,
        notes: status === 'cancelled' ? 'Cancelled — supplier out of stock.' : '', lines,
      });
    }
    return out;
  },
  defaults() {
    const d = n => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
    const ts = n => new Date(Date.now() + n * 86400000).toISOString();
    return ppPO.older(d, ts).concat([
      { no: 'PO-0412', supplier: 'Mercury Drug Supply', status: 'received', created: ts(-9), orderDate: d(-8), expected: d(-3), receivedOn: d(-3), notes: 'Delivered in full.',
        lines: [{ med: 1, name: 'Biogesic 500mg', qty: 200, cost: 4 }, { med: 9, name: 'Solmux 500mg', qty: 100, cost: 12 }] },
      { no: 'PO-0413', supplier: 'Zuellig Pharma', status: 'ordered', created: ts(-2), orderDate: d(-2), expected: d(3), receivedOn: null, notes: 'Orders placed before 2 PM are delivered next day.',
        lines: [{ med: 4, name: 'Cozaar 50mg', qty: 120, cost: 15 }, { med: 2, name: 'Amoxil 500mg', qty: 150, cost: 9 }] },
      { no: 'PO-0414', supplier: 'Unilab Distribution', status: 'draft', created: ts(-1), orderDate: null, expected: d(7), receivedOn: null, notes: '',
        lines: [{ med: 3, name: 'Neozep 10/2mg', qty: 100, cost: 5.5 }, { med: 11, name: 'Loperamide 2mg', qty: 60, cost: 6.5 }] },
      { no: 'PO-0411', supplier: 'Metro Drug Inc.', status: 'cancelled', created: ts(-20), orderDate: null, expected: d(-12), receivedOn: null, notes: 'Cancelled — pricing under review.',
        lines: [{ med: 7, name: 'Betadine 10%', qty: 30, cost: 85 }] },
    ]);
  },
  load() { try { const l = JSON.parse(localStorage.getItem(this.KEY)); return Array.isArray(l) ? l : this.defaults(); } catch (e) { return this.defaults(); } },
  save(list) { try { localStorage.setItem(this.KEY, JSON.stringify(list)); return true; } catch (e) { return false; } },
  nextNo(list) { const n = list.reduce((m, p) => Math.max(m, parseInt(String(p.no).replace(/\D/g, ''), 10) || 0), 0) + 1; return 'PO-' + String(n).padStart(4, '0'); },
};

/* ── Expenses storage (swap for your API later) ── */
var ppExpenses = {
  KEY: 'pp-expenses',
  categories: ['Rent', 'Utilities', 'Salaries & Wages', 'Licenses & Permits', 'Delivery & Freight', 'Refrigeration & Cold Chain', 'Expired Stock Disposal', 'Store Supplies', 'Repairs & Maintenance', 'Insurance', 'Taxes & Fees', 'Marketing', 'Miscellaneous'],
  methods: { cash: 'Cash', gcash: 'GCash', bank: 'Bank transfer', card: 'Card', check: 'Check' },
  defaults() {
    const d = n => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
    // [daysAgo, category, description, payee, amount, method, ref, recurring]
    const spec = [
      [1, 'Store Supplies', 'Paper bags, receipt rolls and Rx labels', 'National Bookstore', 1850, 'cash', 'OR-88213', false],
      [2, 'Delivery & Freight', 'Courier for Zuellig PO-0413', 'LBC Express', 650, 'gcash', 'GC-77120', false],
      [3, 'Expired Stock Disposal', 'Licensed disposal of expired medicines (Betadine, syrups)', 'EcoSafe Waste Solutions', 2400, 'bank', 'INV-2209', false],
      [4, 'Repairs & Maintenance', 'Aircon cleaning and freon refill', 'CoolTech Services', 3200, 'cash', 'OR-4410', false],
      [5, 'Utilities', 'Internet — POS and cloud backup', 'PLDT Fibr', 1799, 'card', 'ACCT-5521', true],
      [7, 'Refrigeration & Cold Chain', 'Vaccine fridge thermometer calibration', 'MedEquip Trading', 1500, 'bank', 'INV-0932', false],
      [9, 'Marketing', 'Tarpaulin for senior/PWD discount promo', 'PrintPro', 900, 'cash', 'OR-1187', false],
      [12, 'Utilities', 'Electricity bill', 'Davao Light', 14260, 'bank', 'ACCT-1043', true],
      [12, 'Utilities', 'Water bill', 'Davao City Water District', 1120, 'cash', 'ACCT-3318', true],
      [15, 'Salaries & Wages', 'Staff payroll (cut-off 1–15)', 'Payroll', 38500, 'bank', 'PAY-1015', true],
      [18, 'Licenses & Permits', 'FDA License to Operate renewal', 'FDA', 7500, 'bank', 'FDA-2026-117', false],
      [22, 'Taxes & Fees', "Quarterly BIR percentage tax", 'BIR', 9340, 'bank', 'BIR-Q3-2026', false],
      [27, 'Rent', 'Monthly store rent', 'Lopez Realty', 28000, 'bank', 'RENT-OCT', true],
      [30, 'Salaries & Wages', 'Staff payroll (cut-off 16–30)', 'Payroll', 38500, 'bank', 'PAY-0930', true],
      [33, 'Insurance', 'Fire and theft insurance premium', 'Malayan Insurance', 6200, 'check', 'CHK-004512', false],
      [36, 'Store Supplies', 'Pill counting trays, vials and gloves', 'MedSupply Depot', 2750, 'cash', 'OR-9911', false],
      [41, 'Utilities', 'Electricity bill', 'Davao Light', 13890, 'bank', 'ACCT-1043', true],
      [44, 'Delivery & Freight', 'Freight for Unilab order', 'J&T Express', 480, 'gcash', 'GC-66210', false],
      [47, 'Licenses & Permits', "Mayor's permit and sanitary permit", 'Davao City Hall', 5400, 'cash', 'OR-2026-77', false],
      [52, 'Rent', 'Monthly store rent', 'Lopez Realty', 28000, 'bank', 'RENT-SEP', true],
      [57, 'Repairs & Maintenance', 'Shelf repair and new LED lighting', 'HomeWorks', 4100, 'cash', 'OR-3320', false],
      [60, 'Salaries & Wages', 'Staff payroll (cut-off 16–31)', 'Payroll', 38500, 'bank', 'PAY-0831', true],
      [66, 'Miscellaneous', 'Pharmacist seminar fee (continuing education)', 'PPhA Davao Chapter', 1200, 'gcash', 'GC-55400', false],
      [74, 'Utilities', 'Electricity bill', 'Davao Light', 12980, 'bank', 'ACCT-1043', true],
      [80, 'Rent', 'Monthly store rent', 'Lopez Realty', 28000, 'bank', 'RENT-AUG', true],
    ];
    return spec.map((s, i) => ({ id: 'EXP-' + String(spec.length - i).padStart(4, '0'), date: d(s[0]), category: s[1], description: s[2], payee: s[3], amount: s[4], method: s[5], ref: s[6], recurring: s[7], notes: '', created: new Date(Date.now() - s[0] * 86400000).toISOString() }));
  },
  load() { try { const l = JSON.parse(localStorage.getItem(this.KEY)); return Array.isArray(l) ? l : this.defaults(); } catch (e) { return this.defaults(); } },
  save(list) { try { localStorage.setItem(this.KEY, JSON.stringify(list)); return true; } catch (e) { return false; } },
  nextId(list) { const n = list.reduce((m, x) => Math.max(m, parseInt(String(x.id).replace(/\D/g, ''), 10) || 0), 0) + 1; return 'EXP-' + String(n).padStart(4, '0'); },
};

/* ── Customers storage (swap for your API later) ── */
var ppCustomers = {
  KEY: 'pp-customers',
  defaults() {
    const d = n => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
    // names match the sample sales so purchase history links up
    return [
      { id: 'CUS-0001', name: 'Remedios Cruz', phone: '0917 555 0111', email: '', birth: '1953-04-12', address: 'Purok 3, Digos City', type: 'senior', idNo: 'SC-20031', allergies: 'Penicillin', conditions: 'Hypertension, Type 2 diabetes — Losartan 50mg, Metformin 500mg', notes: 'Prefers pick-up before 10 AM.', active: true, added: d(300) },
      { id: 'CUS-0002', name: 'Lito Bautista', phone: '0918 555 0122', email: 'lito.b@example.com', birth: '1979-09-30', address: 'Zone 2, Sta. Cruz, Davao del Sur', type: 'pwd', idNo: 'PWD-20062', allergies: '', conditions: 'Asthma — Salbutamol', notes: '', active: true, added: d(240) },
      { id: 'CUS-0003', name: 'Ana Villanueva', phone: '0920 555 0133', email: 'ana.v@example.com', birth: '1988-02-18', address: 'Rizal Ave., Digos City', type: 'regular', idNo: '', allergies: 'Sulfa drugs, Aspirin', conditions: '', notes: 'Asks for generics when available.', active: true, added: d(180) },
      { id: 'CUS-0004', name: 'Jose Ramirez', phone: '0927 555 0144', email: '', birth: '1965-11-05', address: 'Barangay Zone 1, Digos City', type: 'regular', idNo: '', allergies: '', conditions: 'High cholesterol', notes: '', active: true, added: d(150) },
      { id: 'CUS-0005', name: 'Maria Lopez', phone: '0933 555 0155', email: 'mlopez@example.com', birth: '1992-07-22', address: 'Mati St., Digos City', type: 'regular', idNo: '', allergies: '', conditions: '', notes: '', active: true, added: d(90) },
      { id: 'CUS-0006', name: 'Ben Aquino', phone: '0945 555 0166', email: '', birth: '1950-01-09', address: 'Aplaya, Digos City', type: 'senior', idNo: 'SC-20094', allergies: 'Ibuprofen', conditions: 'Arthritis, hypertension', notes: 'Delivery to home for maintenance medicines.', active: true, added: d(60) },
      { id: 'CUS-0007', name: 'Grace Tan', phone: '0956 555 0177', email: 'grace.tan@example.com', birth: '2015-05-14', address: 'Soong, Digos City', type: 'regular', idNo: '', allergies: 'Amoxicillin', conditions: '', notes: 'Account for a minor — parent: Mrs. Tan.', active: true, added: d(20) },
      { id: 'CUS-0008', name: 'Carlo Mendoza', phone: '0966 555 0188', email: '', birth: '1985-12-01', address: 'Colorado, Digos City', type: 'regular', idNo: '', allergies: '', conditions: '', notes: 'Inactive — moved to another city.', active: false, added: d(400) },
    ];
  },
  load() { try { const l = JSON.parse(localStorage.getItem(this.KEY)); return Array.isArray(l) ? l : this.defaults(); } catch (e) { return this.defaults(); } },
  save(list) { try { localStorage.setItem(this.KEY, JSON.stringify(list)); return true; } catch (e) { return false; } },
  nextId(list) { const n = list.reduce((m, x) => Math.max(m, parseInt(String(x.id).replace(/\D/g, ''), 10) || 0), 0) + 1; return 'CUS-' + String(n).padStart(4, '0'); },
};

/* ── Returns & refunds storage (swap for your API later) ── */
var ppReturns = {
  KEY: 'pp-returns',
  reasons: [
    { key: 'wrong_item', label: 'Wrong medicine dispensed',        rxOk: true,  restockOk: true  },
    { key: 'defective',  label: 'Damaged or defective product',    rxOk: true,  restockOk: false },
    { key: 'expired',    label: 'Expired / near-expiry when sold', rxOk: true,  restockOk: false },
    { key: 'recall',     label: 'Product recall',                  rxOk: true,  restockOk: false },
    { key: 'doctor',     label: 'Doctor changed the prescription', rxOk: true,  restockOk: true  },
    { key: 'adverse',    label: 'Adverse reaction / allergy',      rxOk: true,  restockOk: false },
    { key: 'duplicate',  label: 'Duplicate purchase (OTC only)',   rxOk: false, restockOk: true  },
    { key: 'mind',       label: 'Changed mind (OTC only)',         rxOk: false, restockOk: true  },
    { key: 'other',      label: 'Other',                           rxOk: true,  restockOk: true  },
  ],
  methods: { cash: 'Cash', gcash: 'GCash', card: 'Card reversal', credit: 'Store credit', exchange: 'Exchange' },
  defaults() {
    const d = n => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
    const ts = n => new Date(Date.now() - n * 86400000).toISOString();
    const mk = (no, ago, saleNo, saleDate, customer, lines, reason, condition, disposition, method, status, extra) => {
      const ls = lines.map(l => ({ id: l[0], name: l[1], rx: l[2], qty: l[3], unit: l[4], refund: Math.round(l[3] * l[4] * 100) / 100 }));
      return Object.assign({ no, date: d(ago), created: ts(ago), saleNo, saleDate, customer, lines: ls, refund: ls.reduce((t, l) => t + l.refund, 0),
        reason, condition, disposition, method, status, notes: '', approvedBy: status === 'completed' ? 'Maria Santos' : '', rejectNote: '' }, extra || {});
    };
    return [
      mk('RF-0005', 0, 'R-DEMO-0101', d(1), 'Walk-in', [[1, 'Biogesic 500mg', false, 10, 6]], 'duplicate', 'sealed', 'restock', 'cash', 'pending', { notes: 'Customer bought two boxes by mistake.' }),
      mk('RF-0004', 2, 'R-DEMO-0098', d(3), 'Ana Villanueva', [[2, 'Amoxil 500mg', true, 6, 14]], 'adverse', 'opened', 'dispose', 'gcash', 'completed', { notes: 'Skin rash after 2 doses. Advised to see her doctor.' }),
      mk('RF-0003', 6, 'R-DEMO-0090', d(7), 'Jose Ramirez', [[5, 'Ceelin 100mg/5mL', false, 1, 95]], 'defective', 'damaged', 'dispose', 'cash', 'completed', { notes: 'Bottle cap seal was broken.' }),
      mk('RF-0002', 11, 'R-DEMO-0081', d(12), 'Walk-in', [[3, 'Neozep 10/2mg', false, 4, 8]], 'mind', 'opened', 'dispose', 'cash', 'rejected', { rejectNote: 'Opened medicines cannot be taken back for a change of mind.' }),
      mk('RF-0001', 19, 'R-DEMO-0072', d(20), 'Maria Lopez', [[8, 'Glucophage 500mg', true, 30, 11]], 'wrong_item', 'sealed', 'restock', 'cash', 'completed', { notes: 'Prescription was for 850mg. Exchanged for the correct strength.' }),
    ];
  },
  load() { try { const l = JSON.parse(localStorage.getItem(this.KEY)); return Array.isArray(l) ? l : this.defaults(); } catch (e) { return this.defaults(); } },
  save(list) { try { localStorage.setItem(this.KEY, JSON.stringify(list)); return true; } catch (e) { return false; } },
  nextNo(list) { const n = list.reduce((m, x) => Math.max(m, parseInt(String(x.no).replace(/\D/g, ''), 10) || 0), 0) + 1; return 'RF-' + String(n).padStart(4, '0'); },
};

/* ── Profile storage (swap for your API later; never store passwords here) ── */
var ppProfile = {
  KEY: 'pp-profile',
  defaults() {
    const d = n => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
    return {
      personal: { first: 'Maria', last: 'Santos', role: 'Pharmacist', email: 'maria.santos@pharmapos.example', phone: '0917 555 0100', birth: '1990-06-15', address: 'Digos City, Davao del Sur', photo: '' },
      pro: { prcNo: '0123456', prcExpiry: d(220), ptrNo: '', inCharge: true },
      store: { name: 'PharmaPOS Drugstore', address: 'Rizal Ave., Digos City, Davao del Sur', phone: '(082) 555 0123', ltoNo: 'LTO-2026-00117', ltoExpiry: d(300), tin: '123-456-789-000' },
      prefs: { lowStock: true, expiring: true, deliveries: true, returns: true, daily: false },
      joined: new Date(Date.now() - 500 * 86400000).toISOString().slice(0, 10),
    };
  },
  load() {
    const def = this.defaults();
    try { const l = JSON.parse(localStorage.getItem(this.KEY)); if (!l || typeof l !== 'object') return def;
      return { personal: { ...def.personal, ...l.personal }, pro: { ...def.pro, ...l.pro }, store: { ...def.store, ...l.store }, prefs: { ...def.prefs, ...l.prefs }, joined: l.joined || def.joined };
    } catch (e) { return def; }
  },
  save(p) { try { localStorage.setItem(this.KEY, JSON.stringify(p)); return true; } catch (e) { return false; } },
};


/* ── Settings storage (swap for your API later) ── */
var ppSettings = {
  KEY: 'pp-settings',
  defaults() {
    return {
      general: { currency: '₱', vatEnabled: true, vatRate: 12, discountRate: 20, dateFormat: 'en-PH' },
      receipt: { footer: 'Thank you! Get well soon.', showVat: true, showCashier: true, autoPrint: false, paper: '80mm' },
      inventory: { lowStock: 10, expiryDays: 90, blockExpired: true, allowNegative: false },
    };
  },
  load() {
    const d = this.defaults();
    try { const l = JSON.parse(localStorage.getItem(this.KEY)) || {};
      return { general: { ...d.general, ...l.general }, receipt: { ...d.receipt, ...l.receipt }, inventory: { ...d.inventory, ...l.inventory } };
    } catch (e) { return d; }
  },
  save(s) { try { localStorage.setItem(this.KEY, JSON.stringify(s)); return true; } catch (e) { return false; } },
};

/* ── Local date helpers (toISOString() is UTC — in the Philippines that is "yesterday" until 8:00 AM) ── */
function ppDate(offsetDays) {
  const d = new Date(Date.now() + (offsetDays || 0) * 86400000), p = n => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}
function ppCashier() {
  try { const p = ppProfile.load().personal; return ((p.first || '') + ' ' + (p.last || '')).trim() || 'Cashier'; } catch (e) { return 'Cashier'; }
}

/* ── Sidebar nav links ──────────────────────────────────────── */
function getNavSections(activeHref) {
  const sections = [
    { label: 'Sales', items: [
      { name: 'Dashboard', href: 'index.html', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
      { name: 'Point of Sale', href: 'pos.html', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
      { name: 'Sales History', href: 'sales.html', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z' },
    ]},
    { label: 'Inventory', collapsible: true, icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', items: [
      { name: 'Medicines', href: 'medicines.html', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
      { name: 'Expiry Tracker', href: 'expiry.html', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
      { name: 'Suppliers', href: 'suppliers.html', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
      { name: 'Purchase Orders', href: 'purchase-orders.html', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    ]},
    { label: 'Management', collapsible: true, icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', items: [
      { name: 'Customers', href: 'customers.html', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
      { name: 'Returns & Refunds', href: 'returns.html', icon: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6' },
      { name: 'Expenses', href: 'expenses.html', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
      { name: 'Reports', href: 'reports.html', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    ]},
    { label: 'Account', items: [
      { name: 'My Profile', href: 'profile.html', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
      { name: 'Settings', href: 'settings.html', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
      { name: 'Login', href: 'login.html', icon: 'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1' },
      { name: 'Register', href: 'register.html', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
      { name: '404 Page', href: '404.html', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    ]},
  ];

    let saved = {};
  try { saved = JSON.parse(localStorage.getItem('pp-nav-open')) || {}; } catch (e) {}
  sections.forEach(section => {
    section.items.forEach(item => { item.active = item.href === activeHref; });
    // dropdown groups: open if they hold the current page, else use the saved choice
    if (section.collapsible) section.open = section.items.some(i => i.active) || saved[section.label] === true;
  });
  return sections;
}

/* ── Shared notifications ───────────────────────────────────── */
function getSharedNotifications() {
  return [
    { id: 1, title: 'Low stock alert', message: 'Paracetamol 500mg has only 12 boxes left.', time: '10 min ago', read: false, icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
    { id: 2, title: 'Expiring soon', message: 'Amoxicillin 500mg (Batch A2291) expires in 30 days.', time: '1 hour ago', read: false, icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
    { id: 3, title: 'Delivery received', message: 'Mercury Drug Supply delivered PO-0412.', time: '3 hours ago', read: false, icon: 'M5 13l4 4L19 7', iconBg: 'bg-brand-50', iconColor: 'text-brand-600' },
    { id: 4, title: 'Out of stock', message: 'Losartan 50mg is now out of stock.', time: 'Yesterday', read: true, icon: 'M6 18L18 6M6 6l12 12', iconBg: 'bg-red-50', iconColor: 'text-red-500' },
  ];
}

/* ── Everything a page spreads into its Alpine component ──────── */
function sharedChrome(activeHref) {
  return {

    /* ── SIDEBAR ── */
    sidebarCollapsed: (() => { try { return localStorage.getItem('pp-sidebar-collapsed') === '1'; } catch (e) { return false; } })(),
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
      try { localStorage.setItem('pp-sidebar-collapsed', this.sidebarCollapsed ? '1' : '0'); } catch (e) {}
    },
    mobileOpen: false,
    openMobileSidebar() { this.mobileOpen = true; },
    closeMobileSidebar() {
      this.mobileOpen = false;
      this.$nextTick(() => document.getElementById('menu-btn').focus());
    },
    navSections: getNavSections(activeHref),
    onGroupClick(section) {
      // icon-only desktop rail has no room for the sub-items: expand the sidebar and open the group instead
      if (this.sidebarCollapsed && window.innerWidth >= 1024) { this.toggleSidebar(); section.open = true; this.saveSection(section); return; }
      this.toggleSection(section);
    },
    saveSection(section) {
      try {
        const saved = JSON.parse(localStorage.getItem('pp-nav-open')) || {};
        saved[section.label] = section.open;
        localStorage.setItem('pp-nav-open', JSON.stringify(saved));
      } catch (e) {}
    },
    toggleSection(section) {
      section.open = !section.open;
      this.saveSection(section);
    },

    /* ── TOAST ── */
    toast: { show: false, msg: '' },
    toastTimer: null,
    showToast(msg) {
      this.toast.msg = msg;
      this.toast.show = true;
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => this.toast.show = false, 3500);
    },

    /* ── NOTIFICATIONS ── */
    notifOpen: false,
    notifications: getSharedNotifications(),
    get unreadCount() { return this.notifications.filter(n => !n.read).length; },
    markRead(n) { n.read = true; },
    markAllRead() { this.notifications.forEach(n => n.read = true); },

    /* ── PROFILE DROPDOWN ── */
    profileOpen: false,

    /* ── MODAL PLUMBING ── */
    lastFocus: null,
    openModalCommon() {
      this.lastFocus = document.activeElement;
      this.modalOpen = true;
      document.body.style.overflow = 'hidden';
      this.$nextTick(() => {
        const first = this.$refs.dialog.querySelector('input, select, textarea, button');
        if (first) first.focus();
      });
    },
    closeModal() {
      this.modalOpen = false;
      document.body.style.overflow = '';
      if (this.lastFocus) this.lastFocus.focus();
    },
    trapFocus(e) {
      const focusable = [...this.$refs.dialog.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )].filter(el => !el.disabled && el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
      else            { if (document.activeElement === last)  { e.preventDefault(); first.focus(); } }
    },
    nextStep() {
      if (!this.validateStep(this.currentStep)) return;
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
        this.$nextTick(() => this.$refs.dialog.scrollTop = 0);
      }
    },
    backStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
        this.$nextTick(() => this.$refs.dialog.scrollTop = 0);
      }
    },
  };
}
