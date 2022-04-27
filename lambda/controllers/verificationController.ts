import { createWalletConnection, verifyToken } from "../../db/sql/verificationQueries"
import Database from "../../db/base/database"
import { nftCollectionCount, nftCollection} from "../../db/tables/nftCollections"
import { NftWalletCollection, walletCollection } from "../../helpers/nftHelpers"
import { VerificationCollection } from "../../db/tables/verificationCollection"
import { isEmpty } from 'lodash'
export const isVerified = async (verificationToken: string, connection: Database): Promise<boolean> => {
    console.log(`verification token: ${verificationToken}`)
    try {
        return await verifyToken(verificationToken, connection)
    } catch(error) {
        throw(error)
    }
}

export const verifyWallet = async (nftCollections: NftWalletCollection[], verifiedCollections: VerificationCollection[], walletAddress: string, connection: Database): Promise<WalletVerification> => {
    try {
        const verified = verifiedCollections.find(verifiedCollection => {
            console.log(`checking collection: ${verifiedCollection.id}`)
            return nftCollections.find(collection => {
               if(!collection.collection?.hasOwnProperty('id')) {
                   return false
               }
               const currCollection = collection.collection as nftCollection
               console.log(`wallet Collection info: ${currCollection.id} ${collection.count}`)
               return currCollection.id == verifiedCollection.collection_id && (collection.count ? collection.count : -1) >= verifiedCollection.required_count
           })
       })
       if(verified) {
            const newToken = await createWalletConnection(walletAddress, connection)
            console.log(JSON.stringify(`verification: ${JSON.stringify(newToken)}`))

            return {
                verified: true,
                token: newToken
            }
       } 
       return {
           verified: false,
           token: null
       }
    } catch(error) {
        throw(error)
    }

}

export interface WalletVerification {
    verified: boolean,
    token: string|null
}