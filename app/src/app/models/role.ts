export class Role {
    _id: string
    name: string
    rights: [{
        role: String,
        path: String,
        exact: Boolean,
        deny: Boolean
    }]
}
