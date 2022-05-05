export interface TagDescriptions {
    id: number,
    name: string
}

export interface Tags {
    id: number,
    walletId: string,
    tag_description_id: number,
    tag_type_id: number,
    value: string
}

