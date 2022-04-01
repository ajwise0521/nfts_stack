const createPlaceholderValues = (multiDimenObj: unknown[] = []): string => {
    let counter = 1

    function recursive(nestedArray: unknown[] = []): string {
        let fullString = ''
        let foundMaxDepth = false

        for (const inner of nestedArray) {
            let innerValues = ''

            if (Array.isArray(inner)) {
                fullString += recursive(inner)
            } else {
                if (!foundMaxDepth) {
                    fullString += '('
                    foundMaxDepth = true
                }

                innerValues = `$${counter}, `
                counter++
            }

            fullString += innerValues
        }

        if (fullString.substr(-2) === ', ') {
            fullString = fullString.slice(0, -2)
        }

        if (foundMaxDepth) {
            fullString = fullString.concat('),')
        }

        return fullString
    }

    return recursive(multiDimenObj).slice(0, -1)
}

const flatten = (list: any[]): string[] => {
    return list.reduce((acc, next) => {
        return acc.concat(Array.isArray(next) ? flatten(next) : next)
    }, [])
}


const createBulkInsert = (multiDimenObj: any[] = []): {valueString: string, values: unknown[]} => ({
    valueString: createPlaceholderValues(multiDimenObj),
    values: flatten(multiDimenObj),
})

export type SqlValues = (number | string)[]
export type Placeholders = {text: string, values: SqlValues}

export const arrayToSQLInPlaceholders = (input: string[] | number[], initialValues: SqlValues): Placeholders => {
    let sql = ''
    const values = initialValues.slice()
    input.forEach( el => {
        values.push(el)
        sql += `$${values.length},`
    })
    sql = sql.replace(/,$/, '')
    return {
        text: `(${sql})`,
        values
    }
}

export default {
    createBulkStatement: createBulkInsert,
    arrayToSQLInPlaceholders
}
