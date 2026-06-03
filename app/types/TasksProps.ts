
export interface AtividadeProps {
    activity: Atividade
}

export interface Atividade {
    activityUserCenter: '',
    activityID: '',
    activityUserID: '',
    activtyUserName: '',
    activityName: '',
    activityState: false,
    activityLocalWork: '',
    activityTasks: {},
    activityStreet: '',
    activitySide: '',
    activityInitDate: 0,
    activityFinisDate: 0
}

export interface DadosDaAtividade {
    activityID?: string
    activityName?: string
    activityLocalWork?: string
    activityInitDate?: string
    activityState?: string
    activityTasks?: string
    activityUserID?: string
    activtyUserName?: string
    activityUserCenter?: string
    activityFinisDate?: string
}


