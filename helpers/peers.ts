import {IPeer, Peer} from "aws-cdk-lib/aws-ec2";

export type NamedPeers = { [index: string]: IPeer }
export type NamedPeerGroups = { [index: string]: NamedPeers }
export type PeerLists = { [index in 'prod']: NamedPeers }

export const peers: NamedPeerGroups = {
    vpc: {
        'vpc1': Peer.ipv4('10.240.0.0/16'),
    },
    forge: {
    },
    envoyer: {
    }
}

export const rdsPeerLists: PeerLists = {
    prod: {
        ...peers.vpc,
        'aj-wise-macbook': Peer.ipv4('97.91.130.59/32'),
        'all-1pv4': Peer.anyIpv4()
    }
}

export const ec2PeerLists: PeerLists = {
    prod: {
        ...peers.vpc,
        ...peers.forge,
        ...peers.envoyer
    }
}