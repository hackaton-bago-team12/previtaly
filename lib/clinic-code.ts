const ADJECTIVES = ['NORTE', 'SUR', 'VIDA', 'SALUD', 'CARE', 'MED', 'PLUS', 'MAX', 'PRO', 'BAGO'];
const NUMBERS_RANGE = 9000;
const NUMBERS_BASE = 1000;

export function generateClinicCode(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const num = NUMBERS_BASE + Math.floor(Math.random() * NUMBERS_RANGE);
  return `${adj}-${num}`;
}
