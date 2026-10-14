/* ════════════════════════════════════════════════════════════════
   PharmaPOS — shared sample data (replace with your API/database later)
   Expiry dates are relative to today so every status shows in the demo.
   ════════════════════════════════════════════════════════════════ */
function ppMedicines() {
  const day = 86400000;
  const iso = n => new Date(Date.now() + n * day).toISOString().slice(0, 10);
  return [
      { id: 1,  brand: 'Biogesic',    generic: 'Paracetamol',        strength: '500mg',  form: 'Tablet',     category: 'Pain & Fever',          sku: 'MED-0001', batch: 'B-1102', expiry: iso(420), stock: 240, reorder: 60, unit: 'pcs',    price: 6,    cost: 4,    rx: false },
      { id: 2,  brand: 'Amoxil',      generic: 'Amoxicillin',        strength: '500mg',  form: 'Capsule',    category: 'Antibiotics',           sku: 'MED-0002', batch: 'A2291',  expiry: iso(28),  stock: 90,  reorder: 40, unit: 'pcs',    price: 14,   cost: 9,    rx: true  },
      { id: 3,  brand: 'Neozep',      generic: 'Phenylephrine + Chlorphenamine', strength: '10/2mg', form: 'Tablet', category: 'Cough & Cold',  sku: 'MED-0003', batch: 'N-778',  expiry: iso(210), stock: 12,  reorder: 50, unit: 'pcs',    price: 8,    cost: 5.5,  rx: false },
      { id: 4,  brand: 'Cozaar',      generic: 'Losartan',           strength: '50mg',   form: 'Tablet',     category: 'Maintenance',           sku: 'MED-0004', batch: 'L-5521', expiry: iso(300), stock: 0,   reorder: 30, unit: 'pcs',    price: 22,   cost: 15,   rx: true  },
      { id: 5,  brand: 'Ceelin',      generic: 'Ascorbic Acid',      strength: '100mg/5mL', form: 'Syrup',   category: 'Vitamins & Supplements',sku: 'MED-0005', batch: 'C-310',  expiry: iso(75),  stock: 34,  reorder: 15, unit: 'bottle', price: 95,   cost: 70,   rx: false },
      { id: 6,  brand: 'Kremil-S',    generic: 'Aluminum Hydroxide + Simethicone', strength: '178/233/30mg', form: 'Tablet', category: 'Gastrointestinal', sku: 'MED-0006', batch: 'K-910', expiry: iso(540), stock: 180, reorder: 40, unit: 'pcs', price: 9, cost: 6, rx: false },
      { id: 7,  brand: 'Betadine',    generic: 'Povidone-Iodine',    strength: '10%',    form: 'Ointment',   category: 'First Aid',             sku: 'MED-0007', batch: 'BT-44',  expiry: iso(-12), stock: 8,   reorder: 10, unit: 'tube',   price: 120,  cost: 85,   rx: false },
      { id: 8,  brand: 'Glucophage',  generic: 'Metformin',          strength: '500mg',  form: 'Tablet',     category: 'Maintenance',           sku: 'MED-0008', batch: 'G-2207', expiry: iso(365), stock: 150, reorder: 50, unit: 'pcs',    price: 11,   cost: 7,    rx: true  },
      { id: 9,  brand: 'Solmux',      generic: 'Carbocisteine',      strength: '500mg',  form: 'Capsule',    category: 'Cough & Cold',          sku: 'MED-0009', batch: 'S-613',  expiry: iso(62),  stock: 66,  reorder: 30, unit: 'pcs',    price: 18,   cost: 12,   rx: false },
      { id: 10, brand: 'Enervon',     generic: 'Multivitamins',      strength: '—',      form: 'Tablet',     category: 'Vitamins & Supplements',sku: 'MED-0010', batch: 'E-801',  expiry: iso(480), stock: 300, reorder: 80, unit: 'pcs',    price: 7.5,  cost: 5,    rx: false },
      { id: 11, brand: 'Loperamide',  generic: 'Loperamide',         strength: '2mg',    form: 'Capsule',    category: 'Gastrointestinal',      sku: 'MED-0011', batch: 'LP-19',  expiry: iso(45), stock: 20,  reorder: 25, unit: 'pcs',    price: 10,   cost: 6.5,  rx: false },
      { id: 12, brand: 'Ventolin',    generic: 'Salbutamol',         strength: '2mg/5mL',form: 'Syrup',      category: 'Cough & Cold',          sku: 'MED-0012', batch: 'V-072',  expiry: iso(18),  stock: 14,  reorder: 10, unit: 'bottle', price: 140,  cost: 100,  rx: true  },
  ];
}

/* ── Sample sales for the Sales History demo (only loaded when the user clicks "Load sample sales") ── */
function ppSampleSales() {
  const meds = ppMedicines(), byId = id => meds.find(m => m.id === id);
  const round = n => Math.round(n * 100) / 100;
  // [daysAgo, hour, minute, [[medId, qty], …], method, discount]
  const spec = [
    [0, 9, 15,  [[1, 2], [10, 1]],  'cash',  'none'],   [0, 10, 40, [[5, 1]],           'gcash', 'none'],
    [0, 13, 5,  [[2, 15], [1, 10]], 'cash',  'none'],   [0, 15, 30, [[9, 1], [3, 2]],   'card',  'none'],
    [1, 11, 20, [[8, 30]],          'cash',  'senior'], [1, 16, 45, [[6, 4], [11, 2]],  'gcash', 'none'],
    [2, 9, 50,  [[12, 1]],          'card',  'none'],   [3, 14, 10, [[7, 1], [10, 3]],  'cash',  'none'],
    [4, 10, 5,  [[5, 2]],           'cash',  'none'],   [6, 17, 25, [[1, 5], [3, 3]],   'gcash', 'none', 'void'],
    [9, 12, 0,  [[8, 60]],          'cash',  'pwd'],    [12, 15, 15, [[2, 21]],         'card',  'none'],
    [20, 11, 45, [[9, 2]],          'cash',  'none'],   [35, 10, 10, [[10, 6]],         'cash',  'none'],
  ];
  const names = ['Ana Villanueva', 'Jose Ramirez', 'Maria Lopez', 'Ben Aquino'];
  const counters = {}, out = [];
  spec.slice().sort((a, b) => (b[0] - a[0]) || (a[1] - b[1]) || (a[2] - b[2])).forEach((s, i) => {
    const d = new Date(); d.setDate(d.getDate() - s[0]); d.setHours(s[1], s[2], 0, 0);
    const day = d.toISOString().slice(0, 10).replace(/-/g, '');
    counters[day] = (counters[day] || 0) + 1;
    const lines = s[3].map(([id, qty]) => { const m = byId(id); return { m: { id: m.id, brand: m.brand, strength: m.strength, generic: m.generic, rx: m.rx, price: m.price }, qty, total: m.price * qty }; });
    const gross = lines.reduce((t, l) => t + l.total, 0), base = gross / 1.12, vat = gross - base;
    const t = s[5] === 'none' ? { gross, vat, disc: 0, total: gross } : { gross, vat, disc: base * 0.2, total: round(base * 0.8) };
    const total = round(t.total), cash = s[4] === 'cash';
    const tendered = cash ? Math.ceil(total / 50) * 50 : total;
    const hasRx = lines.some(l => l.m.rx);
    const sale = {
      no: 'R-' + day + '-' + String(counters[day]).padStart(4, '0'), ts: d.toISOString(),
      date: d.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }),
      cashier: 'Maria Santos', status: 'completed', lines, t: { ...t, total }, discount: s[5],
      method: s[4], tendered, change: cash ? round(tendered - total) : 0, ref: cash ? '' : 'REF' + (100000 + i * 7919),
      customer: s[5] === 'none' ? null : { type: s[5] === 'senior' ? 'Senior' : 'PWD', name: s[5] === 'senior' ? 'Remedios Cruz' : 'Lito Bautista', id: (s[5] === 'senior' ? 'SC-' : 'PWD-') + (20000 + i * 31) },
      rx: hasRx ? { patient: names[i % names.length], doctor: 'Dr. Ramon Dela Cruz', prc: '0123456' } : null,
    };
    if (s[6] === 'void') { sale.status = 'voided'; sale.voidReason = 'Customer changed their mind'; sale.voidedAt = new Date(d.getTime() + 600000).toISOString(); }
    out.push(sale);
  });
  return out.sort((a, b) => b.ts.localeCompare(a.ts));
}
