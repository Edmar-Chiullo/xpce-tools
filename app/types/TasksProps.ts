type Activity = {
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

export interface ActivityProps {
    activity: Activity
}