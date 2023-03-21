import { MongoClient } from 'mongodb'
import { ConnectOptions } from 'mongoose'
import migrations from './migrations/index'
import {Migration} from './schema'

export const getDb = async (MONGO_URL: string) => {
    const client = await MongoClient.connect(MONGO_URL, { useUnifiedTopology: true } as ConnectOptions)
    return client.db()
}

export const migrate = async (MONGO_URL: string, migrationType: string) => {
    const db = await getDb(MONGO_URL)

    //get all performed migrations names from DB
    const performedMigrations = await Migration.find()
    const migrationNames = performedMigrations.map(m => m.name)


    if (migrationType === 'up') {
        for await (const m of Object.entries(migrations)) {
            const [name, func] = m

            if (!migrationNames.includes(name)) {
                await func.up(db)
                const newMigration = new Migration ({name, date: Date.now()})
                await newMigration.save()
                console.log(`Migration ${name} apply successfully`)
            } else {
                console.log(`Migration ${name} has already been applied`)
            }
        }
    } else {
        if (performedMigrations.length){
            const lastMigrationInstance = performedMigrations.pop()
            const lastMigrationName = lastMigrationInstance!.name
            // @ts-ignore
            migrations[lastMigrationName].down(db)
            const declinedMigration = await Migration.findOne({name: lastMigrationName})
            await declinedMigration!.deleteOne()
            console.log(`Migration ${lastMigrationName} cancel successfully`)
        }
    }
}