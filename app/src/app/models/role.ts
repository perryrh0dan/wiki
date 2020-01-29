export class Role {
    _id: string
    name: string
    rights: [{
        role: string,
        path: string,
        exact: boolean,
        deny: boolean
    }]
}
