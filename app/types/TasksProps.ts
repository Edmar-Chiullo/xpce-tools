export interface AtividadeProps {
    activity: Atividade
    _firebaseKey?: string
}

export interface Atividade {
    activityID: string
    activityName: string
    activityUserCenter: string
    activityUserID: string
    activtyUserName: string
    activityState: boolean
    activityLocalWork: string
    activityStreet: string
    activitySide: string
    activityInitDate: number
    activityFinishDate: number
    activityDate: string
    activityDateCenter: string
    activityDateCenterID: string
}

export interface DadosDaAtividade {
    activityID?: string
    activityName?: string
    activityLocalWork?: string
    activityInitDate?: string
    activityState?: string
    activityUserID?: string
    activtyUserName?: string
    activityUserCenter?: string
    activityFinishDate?: string
}

export interface TaskItem {
    activityRef: string
    activityID: string
    activityName: string
    activityUserCenter: string
    activityDate: string
    taskType: string
    loadAddress?: string
    loadProduct?: string
    loadQuant?: string
    loadValid?: string
    validMaster?: string
    createdAt: number
}

export interface UserProps {
    registrationNumber: string
    userName: string
    userPermission: string
    userLocalWork: string
    userRegistrationDate: string
    userPassword: string
    center: string
}
