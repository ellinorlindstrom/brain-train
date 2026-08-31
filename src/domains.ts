import type { DomainId } from './types'

export interface DomainDef {
  id: DomainId
  name: string
  description: string
  instructions: string
  color: string
}

export const DOMAINS: DomainDef[] = [
  {
    id: 'memory',
    name: 'Minne',
    description: 'Hur väl du kommer ihåg mönster',
    instructions:
      'Titta på sekvensen av rutor som lyser upp och klicka sedan på dem i exakt samma ordning. Sekvensen blir längre för varje omgång du klarar.',
    color: '#60a5fa',
  },
  {
    id: 'attention',
    name: 'Uppmärksamhet',
    description: 'Hur bra du fokuserar och undviker felklick',
    instructions:
      'Klicka på "Reagera!" varje gång du ser bokstaven X. Klicka INTE på andra bokstäver. Var snabb men undvik felklick.',
    color: '#34d399',
  },
  {
    id: 'speed',
    name: 'Snabbhet',
    description: 'Hur snabbt du bearbetar enkel information',
    instructions:
      'Du får se enkla mattetal med ett svar. Avgör så snabbt du kan om svaret är rätt eller fel. Du har 40 sekunder på dig.',
    color: '#fbbf24',
  },
  {
    id: 'logic',
    name: 'Logik',
    description: 'Hur du löser mönster och resonerar',
    instructions:
      'Lös talföljderna genom att välja vilket tal som kommer härnäst. Åtta frågor, en i taget.',
    color: '#a78bfa',
  },
  {
    id: 'flexibility',
    name: 'Flexibilitet',
    description: 'Hur snabbt du växlar mellan olika regler',
    instructions:
      'Blå ram: avgör om talet är jämnt eller udda. Orange ram: avgör om talet är högre eller lägre än 5. Regeln växlar hela tiden, så håll koll på ramens färg.',
    color: '#f472b6',
  },
  {
    id: 'verbal',
    name: 'Språk',
    description: 'Hur snabbt du hittar ord',
    instructions:
      'Bokstäverna i ett ord har blandats om. Skriv det riktiga ordet så snabbt du kan och tryck Enter. Du har 45 sekunder på dig totalt.',
    color: '#38bdf8',
  },
]

export function getDomain(id: DomainId): DomainDef {
  const d = DOMAINS.find((x) => x.id === id)
  if (!d) throw new Error(`Unknown domain ${id}`)
  return d
}
