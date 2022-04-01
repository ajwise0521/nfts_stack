import * as solanaWeb3 from '@solana/web3.js'
import { isEmpty, isUndefined } from 'lodash'

export const getLastKnownSignature = async (royaltyAddress: string) => {
    try {
        const url = solanaWeb3.clusterApiUrl('mainnet-beta')
        const solanaConnection = new solanaWeb3.Connection(url, 'confirmed')
        const projectPubKey = new solanaWeb3.PublicKey(royaltyAddress)
        let signatures = await solanaConnection.getSignaturesForAddress(projectPubKey, {})
        console.log(`signatures: ${JSON.stringify(signatures)}`)
        if(signatures.length <= 0) {
            throw(new Error('error getting signatures'))
        }
        console.log(`last Known Signature: ${signatures[3].signature}`)
    } catch(error) {
        console.log(error instanceof Error ? error.message : 'unknown error')
    }
}

if(isEmpty(process.argv.slice(2)[0]) || isUndefined(process.argv.slice(2)[0])) {
    console.log('no configuration found')
} else {
    getLastKnownSignature(process.argv.slice(2)[0])
}



