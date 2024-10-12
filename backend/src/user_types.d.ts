type User = {
    id: number,

    first_name: string,

    last_name: string,

    email: string,

    password: string,

    image_filename: string,

    auth_token: string,
}

type Category = {
    id: number,

    name: string,
}


type SupportTier =   {

    id: number,

    petition_id: number,

    title: string,

    description: string,

    cost: number,
}


type Supporter =   {
    id: number,

    petition_id: number,

    support_tier_id: number,

    user_id: number,

    message: string,

    timestamp: string,

}

type Petition =   {
    id: number,

    title: string,

    description: string,

    creation_date: string,

    image_filename: string,

    owner_id: number,

    category_id: number,
}

