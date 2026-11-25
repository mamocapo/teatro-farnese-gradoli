// =====================================================================
// Teatro Farnese di Gradoli · disegna "la sala" (il segno del logo)
// 6 file (A–F, la A è la più vicina al palco) da 13 posti = 78 posti.
// =====================================================================

const FILE = 'ABCDEF';
const ORO = { fila: 2, col: 6 }; // il posto d'oro del logo: fila C, posto 7

const WHATSAPP = '393351354905';

// --- Sale "decorative": homepage e piede pagina ---
// --d è la distanza dal posto d'oro: serve a far partire l'onda di luce da lì.
document.querySelectorAll('[data-sala="apertura"], [data-sala="piede"]').forEach(sala => {
  for (let fila = 0; fila < 6; fila++) {
    for (let col = 0; col < 13; col++) {
      const p = document.createElement('li');
      p.className = 'posto';
      if (fila === ORO.fila && col === ORO.col) p.classList.add('oro');
      p.style.setProperty('--d', Math.abs(fila - ORO.fila) + Math.abs(col - ORO.col));
      sala.appendChild(p);
    }
  }
});

// --- Sala di uno spettacolo ---
// data-acceso="tutti": serata speciale, si accende tutta la sala.
// data-acceso="C7": spettacolo della stagione, si accende il suo posto (come sulla locandina).
document.querySelectorAll('[data-sala="spettacolo"]').forEach(sala => {
  const acceso = (sala.dataset.acceso || '').toUpperCase();
  const m = acceso.match(/^([A-F])(\d{1,2})$/);
  for (let fila = 0; fila < 6; fila++) {
    for (let col = 0; col < 13; col++) {
      const p = document.createElement('li');
      p.className = 'posto';
      if (acceso === 'TUTTI' || (m && FILE.indexOf(m[1]) === fila && Number(m[2]) - 1 === col)) p.classList.add('oro');
      sala.appendChild(p);
    }
  }
});

// =====================================================================
// Scelta del posto: abbonamento (homepage) e biglietti (pagine spettacolo)
// I posti occupati vengono da posti.js.
// =====================================================================

const PREZZO_BIGLIETTO = 10;

// Gli spettacoli dell'abbonamento e le loro date (aaaa-mm-gg): servono a capire
// quali biglietti venduti bloccano ancora un posto per chi si abbona.
// null = data ancora da fissare: lo spettacolo conta come serata futura.
const SERATE = {
  'flora-e-li-mariti-sua': '2027-01-16',
  'piccole-donne-non-devono-morire': '2027-02-06',
  'novecento': '2027-02-27',
  'la-tovaglia-di-trilussa': '2027-03-20',
  'bosso-guidolotti': '2027-04-10',
};

const registroAbbonamenti = typeof ABBONAMENTI !== 'undefined' ? ABBONAMENTI : [];
const registroVenduti = typeof VENDUTI !== 'undefined' ? VENDUTI : {};

const codicePosto = (fila, col) => FILE[fila] + (col + 1);
const nomePosto = (fila, col) => `Fila ${FILE[fila]} · posto ${col + 1}`;

// 'c 7', 'C7', 'c07' → 'C7'; i codici sbagliati si ignorano
const leggiPosti = lista => {
  const posti = new Set();
  (lista || []).forEach(voce => {
    const m = String(voce).toUpperCase().replace(/\s+/g, '').match(/^([A-F])0*(\d{1,2})$/);
    if (m && Number(m[2]) >= 1 && Number(m[2]) <= 13) posti.add(m[1] + Number(m[2]));
    else console.warn('posti.js: posto non valido', voce);
  });
  return posti;
};

const oggi = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Posti occupati in una serata: abbonati + biglietti venduti per quella serata
const occupatiSerata = spettacolo =>
  new Set([...leggiPosti(registroAbbonamenti), ...leggiPosti(registroVenduti[spettacolo])]);

// Posti non disponibili per un nuovo abbonamento: abbonati + biglietti venduti
// per tutte le serate che devono ancora venire
const occupatiAbbonamento = () => {
  const occupati = leggiPosti(registroAbbonamenti);
  Object.keys(SERATE).forEach(s => {
    if (!SERATE[s] || SERATE[s] >= oggi()) leggiPosti(registroVenduti[s]).forEach(p => occupati.add(p));
  });
  return occupati;
};

// "Fila C · posti 7, 8; Fila D · posto 3"
const elencoPosti = scelti => {
  const perFila = {};
  scelti.forEach(({ fila, col }) => (perFila[FILE[fila]] ||= []).push(col + 1));
  return Object.entries(perFila)
    .map(([f, n]) => `Fila ${f} · ${n.length > 1 ? 'posti' : 'posto'} ${n.join(', ')}`)
    .join('; ');
};

// Disegna una sala di bottoni. I posti occupati sono spenti e non si possono toccare.
// multipla: si possono scegliere più posti (biglietti) o uno solo (abbonamento).
const salaDaScegliere = (sala, occupati, { multipla, preselezione, quandoCambia }) => {
  const bottoni = [];
  for (let fila = 0; fila < 6; fila++) {
    for (let col = 0; col < 13; col++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'posto';
      const nome = nomePosto(fila, col);
      if (occupati.has(codicePosto(fila, col))) {
        b.disabled = true;
        b.classList.add('occupato');
        b.setAttribute('aria-label', `${nome}, occupato`);
      } else {
        b.setAttribute('aria-label', nome);
        b.setAttribute('aria-pressed', preselezione && preselezione.fila === fila && preselezione.col === col ? 'true' : 'false');
        b.addEventListener('click', () => {
          const acceso = b.getAttribute('aria-pressed') === 'true';
          if (!multipla) bottoni.forEach(x => x.hasAttribute('aria-pressed') && x.setAttribute('aria-pressed', 'false'));
          b.setAttribute('aria-pressed', multipla && acceso ? 'false' : 'true');
          quandoCambia(scelti());
        });
      }
      b.dataset.fila = fila;
      b.dataset.col = col;
      bottoni.push(b);
      sala.appendChild(b);
    }
  }
  const scelti = () => bottoni
    .filter(b => b.getAttribute('aria-pressed') === 'true')
    .map(b => ({ fila: Number(b.dataset.fila), col: Number(b.dataset.col) }));
  const liberi = 78 - occupati.size;
  quandoCambia(scelti());
  return liberi;
};

const linkWhatsApp = testo => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(testo)}`;

// --- Abbonamento (homepage): un posto fisso, libero in tutte le serate che restano ---
const scegli = document.querySelector('[data-sala="scegli"]');
if (scegli) {
  const etichetta = document.getElementById('posto-scelto');
  const spiegazione = document.getElementById('posto-spiegazione');
  const abbonati = document.getElementById('abbonati');
  const occupati = occupatiAbbonamento();
  const oroLibero = !occupati.has(codicePosto(ORO.fila, ORO.col));

  const liberi = salaDaScegliere(scegli, occupati, {
    multipla: false,
    preselezione: oroLibero ? ORO : null,
    quandoCambia: scelti => {
      const nome = scelti.length ? nomePosto(scelti[0].fila, scelti[0].col) : null;
      etichetta.textContent = nome || 'Scegli il tuo posto';
      if (abbonati) {
        abbonati.href = linkWhatsApp(nome
          ? `Buongiorno, vorrei l'abbonamento a Settantotto · Atto primo (40 €). Posto preferito: ${nome}.`
          : `Buongiorno, vorrei l'abbonamento a Settantotto · Atto primo (40 €).`);
      }
    },
  });
  if (liberi === 0) {
    etichetta.textContent = 'Abbonamenti esauriti';
    if (spiegazione) spiegazione.textContent = 'Non ci sono più posti liberi per tutte le serate.';
  }
}

// --- Biglietti (pagina di uno spettacolo): uno o più posti tra quelli liberi ---
const biglietto = document.querySelector('[data-sala="biglietto"]');
if (biglietto) {
  const spettacolo = biglietto.dataset.spettacolo;
  const etichetta = document.getElementById('posti-scelti');
  const conto = document.getElementById('posti-conto');
  const prenota = document.getElementById('prenota-whatsapp');
  const base = prenota ? prenota.dataset.testo : '';
  const occupati = occupatiSerata(spettacolo);
  const liberi = 78 - occupati.size;

  salaDaScegliere(biglietto, occupati, {
    multipla: true,
    preselezione: null,
    quandoCambia: scelti => {
      const n = scelti.length;
      if (n === 0) {
        etichetta.textContent = 'Scegli i tuoi posti';
        conto.textContent = `${liberi} ${liberi === 1 ? 'posto libero' : 'posti liberi'} su 78`;
      } else {
        etichetta.textContent = elencoPosti(scelti);
        conto.textContent = `${n} ${n === 1 ? 'biglietto' : 'biglietti'} · ${n * PREZZO_BIGLIETTO} €`;
      }
      if (prenota) {
        prenota.href = linkWhatsApp(n
          ? `${base} Posti scelti: ${elencoPosti(scelti)} (${n} ${n === 1 ? 'biglietto' : 'biglietti'}, ${n * PREZZO_BIGLIETTO} €).`
          : `${base} Numero di posti: `);
        prenota.textContent = n ? `Prenota ${n === 1 ? 'il posto' : `${n} posti`} su WhatsApp` : 'Prenota su WhatsApp';
      }
    },
  });
  if (liberi === 0) {
    etichetta.textContent = 'Tutto esaurito';
    conto.textContent = 'Non ci sono più posti liberi per questa serata.';
  }
}
