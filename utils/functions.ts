export function getPaginationParameters(req: any){
    const page = +req.query.page ? +req.query.page : 1
    const elementsCount = +req.query.elementsCount ? +req.query.elementsCount : 10

    const skipIndex = (page - 1) * elementsCount

    return {page, elementsCount, skipIndex}
}

interface IUserRole {
    userRole: string
}

declare global {
    namespace Express {
        interface Request extends IUserRole {}
    }
}