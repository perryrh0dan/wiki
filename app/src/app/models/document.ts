export class Document {
    _id: string
    title: string
    subtitle: string
    content: string
    author: string
    tags: []
    parentPath: string
    parentTitle: string
    tree: []
    write: boolean
    updatedAt: Date
    updatedBy: string
    children: []
    favorite: boolean
}
