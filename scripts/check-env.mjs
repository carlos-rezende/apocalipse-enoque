/**
 * Alinha com package.json engines e Vite 8:
 * ^20.19.0 || >=22.12.0  (Node 21 não entra no intervalo)
 */
const raw = process.versions.node
const parts = raw.split('.').map((s) => parseInt(s, 10))
const [maj, min = 0, pat = 0] = parts

function ok() {
  if (maj < 20) return false
  if (maj === 20) return min > 19 || (min === 19 && pat >= 0)
  if (maj === 21) return false
  if (maj === 22) return min > 12 || (min === 12 && pat >= 0)
  return maj > 22
}

if (!ok()) {
  console.error(
    `[check:env] Node ${raw} não atende engines do projeto (^20.19.0 || >=22.12.0).`,
  )
  console.error('  Use o .nvmrc (nvm use) ou instale Node 22 LTS / 20.19+.')
  process.exit(1)
}

console.log(`[check:env] Node ${raw} — OK`)
