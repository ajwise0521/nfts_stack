export interface RankSources {
    id: number,
    source_name: string
    image_url: string
}

export interface CollectionRankSources {
    id: number,
    collection_id: number,
    rank_source_id: number,
    rank_source_symbol: string
}

export interface CollectionRanksAlt {
    rank_source_symbol: string,
    source_name: string
    image_url: string,
}