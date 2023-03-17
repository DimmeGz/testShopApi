export default {
    up: async (db) => {
        await db
            .collection('products')
            .updateMany({}, {$rename: {availability: 'isAvailable'}}, {multi: true})
    },
    down: async (db) => {
        await db
            .collection('products')
            .updateMany({}, {$rename: {isAvailable: 'availability'}}, {multi: true})
    }
}