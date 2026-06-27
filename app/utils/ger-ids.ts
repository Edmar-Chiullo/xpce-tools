const ACTIVITY_INITIALS: Record<string, string> = {
    'Quarentena Fracionada': 'QF',
    'Rotativo De Picking': 'RP',
    'Aereo Vazio': 'AV',
    'Aéreo Vazio': 'AV',
    'Produto x Endereço': 'PE',
    'Validação de Produto e Endereço': 'VPE',
    'Validação Master': 'VM',
    'Validação Master de Expedição': 'VME',
}

export function generateActivityId(activityName: string): string {
    const initials = ACTIVITY_INITIALS[activityName] || 'XX'
    const random = Math.floor(1000000 + Math.random() * 9000000)
    return `${initials}${random}`
}
