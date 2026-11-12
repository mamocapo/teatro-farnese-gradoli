// =====================================================================
// Teatro Farnese di Gradoli · disegna "la sala" (il segno del logo)
// 6 file (A–F, la A è la più vicina al palco) da 13 posti = 78 posti.
// =====================================================================

const FILE = 'ABCDEF';
const ORO = { fila: 2, col: 6 }; // il posto d'oro del logo: fila C, posto 7

// I cinque posti che si accendono, uno per spettacolo (come sulla locandina di stagione)
const POSTI_STAGIONE = [[2, 6], [4, 2], [1, 10], [5, 8], [0, 3]];

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

// --- Sala di uno spettacolo: si accende il posto di quella serata ---
// data-numero="1".."5": il posto della serata è pieno d'oro, quelli delle serate prima solo bordati.
document.querySelectorAll('[data-sala="spettacolo"]').forEach(sala => {
  const numero = Number(sala.dataset.numero);
  for (let fila = 0; fila < 6; fila++) {
    for (let col = 0; col < 13; col++) {
      const p = document.createElement('li');
      p.className = 'posto';
      const k = POSTI_STAGIONE.findIndex(([f, c]) => f === fila && c === col);
      if (k === numero - 1) p.classList.add('oro');
      else if (k >= 0 && k < numero - 1) p.classList.add('passato');
      sala.appendChild(p);
    }
  }
});

// --- Sala dell'abbonamento: ogni posto è un bottone, se lo tocchi diventa "tuo" ---
const scegli = document.querySelector('[data-sala="scegli"]');
if (scegli) {
  const etichetta = document.getElementById('posto-scelto');
  const abbonati = document.getElementById('abbonati');

  // Il bottone "Abbonati" apre WhatsApp con un messaggio già scritto, posto scelto compreso
  const aggiornaAbbonati = nome => {
    if (!abbonati) return;
    const testo = `Buongiorno, vorrei l'abbonamento a Settantotto · Atto primo (40 €). Posto preferito: ${nome}.`;
    abbonati.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(testo)}`;
  };

  for (let fila = 0; fila < 6; fila++) {
    for (let col = 0; col < 13; col++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'posto';
      const nome = `Fila ${FILE[fila]} · posto ${col + 1}`;
      b.setAttribute('aria-label', nome);
      b.setAttribute('aria-pressed', fila === ORO.fila && col === ORO.col ? 'true' : 'false');
      b.addEventListener('click', () => {
        scegli.querySelectorAll('[aria-pressed="true"]').forEach(x => x.setAttribute('aria-pressed', 'false'));
        b.setAttribute('aria-pressed', 'true');
        etichetta.textContent = nome;
        aggiornaAbbonati(nome);
      });
      scegli.appendChild(b);
    }
  }
  aggiornaAbbonati(etichetta.textContent);
}
