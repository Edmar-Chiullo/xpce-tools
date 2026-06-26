function addLeftZZero(value:number) {
    return value < 10 ? `0${value}` : value 
}

export function datePrint() {
    const date = Date.now()    
    const datePrint = new Date(date)
    return datePrint
}

export function datePrintInt(dt:number | string) {
    const date = new Date(dt)    
    return date
}

export function hourPrint(date:number) {
    const hour = addLeftZZero(datePrintInt(date).getHours())
    const minutes = addLeftZZero(datePrintInt(date).getMinutes())
    const seconds = addLeftZZero(datePrintInt(date).getSeconds())

    return `${hour}:${minutes}:${seconds}`
}

export function fullDate() {
    const day = addLeftZZero(datePrint().getDate())
    const month = addLeftZZero(datePrint().getMonth() + 1)
    const year = datePrint().getFullYear()

    return `${day}/${month}/${year}`
}

export function fullDatePrint(date:number | string) {
    const day = addLeftZZero(datePrintInt(date).getDate())
    const month = addLeftZZero(datePrintInt(date).getMonth() + 1)
    const year = datePrintInt(date).getFullYear()

    return `${day}/${month}/${year}`
}

export function dateDb() {
    const date = Date.now()  

    return date
}

export function dateFichaPallet(date: unknown): string {
    if (typeof date === 'number') {
        const excelEpoch = new Date(1899, 11, 30);
        const result = new Date(excelEpoch.getTime() + date * 86400000);
        const dd = String(result.getDate()).padStart(2, '0');
        const mm = String(result.getMonth() + 1).padStart(2, '0');
        const yyyy = result.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    }
    if (typeof date === 'string') {
        return date;
    }
    return '';
}
