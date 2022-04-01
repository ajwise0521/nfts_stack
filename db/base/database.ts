import SqlStatement from "./sqlStatement";
import QueryResult from "./queryResult";

export default abstract class Database {
    public database?: string
    public host?: string
    abstract sqlQuery<T>({text, values}: SqlStatement, throws: boolean): Promise<QueryResult<T>>;
}
