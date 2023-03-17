import config from 'config'
import { MongoClient } from 'mongodb'
import { ConnectOptions } from 'mongoose'
import migrations from './migrations/index'
import {Migration} from './schema'

const MONGO_URL: string = config.get('mongoUri')
const migrationType = config.get('migrationType')

export const getDb = async () => {
    const client = await MongoClient.connect(MONGO_URL, { useUnifiedTopology: true } as ConnectOptions)
    return client.db()
}

export const migrate = async () => {
    const db = await getDb()

    //get all performed migrations names from DB
    const performedMigrations = await Migration.find()
    let migrationNames = []
    for (let mig of performedMigrations) {
        migrationNames.push(mig.name)
    }

    for await (const m of Object.entries(migrations)) {
        const [name, func] = m

        if (migrationType === 'up') {
            if (!migrationNames.includes(name)) {
                await func.up(db)
                const newMigration = new Migration ({name, date: Date.now()})
                await newMigration.save()
                console.log(`Migration ${name} apply successfully`)
            } else {
                console.log(`Migration ${name} has already been applied`)
            }
        } else {
            if (!migrationNames.includes(name)) {
                console.log(`Migration ${name} has not been applied`)
            } else {
                await func.down(db)
                const declinedMigration = await Migration.findOne({name})
                if (!declinedMigration) {
                    console.log(`Migration ${name} doesn't provided yet`)
                    return
                }
                await declinedMigration.deleteOne()
                console.log(`Migration ${name} cancel successfully`)
            }
        }
    }
}