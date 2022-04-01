
export default interface QueryResult<T> {
    numRows: number,
    rows: T[]
    error: boolean
    errorMsg: string|null
}
