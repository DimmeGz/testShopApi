export default {
    up: async (db: any) => {
        await db
            .collection('users')
            .updateMany({}, {$set: {role: "user"}}, {multi: true})
    },
    down: async (db: any) => {
        await db
            .collection('users')
            .updateMany({}, {$set: {role: ""}}, {multi: true})

    }
}
