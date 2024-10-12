type user = {
    id: number,
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    imageFilename: string,
    authToken: string
}

type Petition = {
    petitionId: number,
    title: string,
    categoryId: number,
    creationDate: string,
    ownerId: number,
    ownerFirstName: string,
    ownerLastName: string,
    numberOfSupporters: number,
    supportingCost: number,

}

type PetitionFull = {
    description: string,
    moneyRaised: number,
    supportTiers: supportTier[]
} & petition

type PetitionReturn = {
    petitions: petition[],
    count: number
}

type supportTierPost = {
    title: string,
    description: string
    cost: number
}

type supportTier = {
    supportTierId: number,
} & supportTierPost


type Category = {
    categoryId: number,
    name: string
}

type postSupport = {
    supportTierId: number,
    message: string
}

type supporter = {
    supportId: number,
    supporterId: number,
    supporterFirstName: string,
    supporterLastName: string,
    timestamp: string
} & postSupport

type userRegister = {
    firstName: string,
    lastName: string,
    email: string,
    password: string
}


type userReturnWithEmail = {
    firstName: string,
    lastName: string,
    email:string
}

type userPatch = {
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    currentPassword: string
}
