
export default class SqlStatement {
    text: string;
    values: unknown[];
    constructor(text: string, values: unknown[]) {
        this.text = text
        this.values = values
    }
}
