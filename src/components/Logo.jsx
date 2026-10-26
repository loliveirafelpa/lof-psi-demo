// Marca da LOF (quadrado petróleo com círculo menta, como no site), desenhada em SVG.
// Fica nítida em qualquer tamanho e funciona sobre o petróleo e sobre o claro.
import { cores } from '../theme'

export default function Logo({ tamanho = 36, className = '' }) {
  return (
    <svg viewBox="0 0 32 32" width={tamanho} height={tamanho} className={className} role="img" aria-label="LOF Psi">
      <rect width="32" height="32" rx="8" fill={cores.petroleoEscuro} stroke={cores.verdeAgua} strokeOpacity="0.35" />
      <circle cx="16" cy="16" r="7" fill={cores.verdeAgua} />
    </svg>
  )
}
