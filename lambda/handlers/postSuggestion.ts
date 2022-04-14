import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { isEmpty } from "lodash"
import { createSuggestion } from "../../db/sql/suggestionQueries"
import MySqlDatabase from "../../db/base/mysqlDatabase"
import { nftsDbConfig } from "../../db/base/dbConfig"
import { getAllowedResponseHeaders, generateResponse } from "../../helpers/cdkHelpers"
import { connect } from "http2"
const nftsDatabaseConnection = new MySqlDatabase('NFTs Database Connection', nftsDbConfig)

export const handle = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const data = JSON.parse(event.body ?? '')
    const description = data.description
    try {
        if(isEmpty(description)) {
            return generateResponse({}, false, 500, 'Error creating Suggestion')
        }
    
        const success = await createSuggestion(nftsDatabaseConnection, description)
        if(success) {
            return generateResponse({}, true, 200)
        }

        return generateResponse({}, false, 500, 'Empty Description')
    } catch(error) {
        return generateResponse({}, false, 500, 'Error creating Suggestion')
    }
}
