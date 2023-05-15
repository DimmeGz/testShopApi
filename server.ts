import {getEnv} from './utils/env_validation';
import {connectDB} from './utils/postgresqlConnect';
import app from './app';

async function start() {
    try {
        const envValues = await getEnv()

        const PORT: number = Number(envValues.PORT) || 5000

        await connectDB()

        app.listen(PORT, () => {
            console.log(`Server has been started on port ${PORT}...`)
        })
    } catch (e) {
        if (e instanceof Error) {
            console.log('Server Error', e.message)
            process.exit(1)
        }
        process.exit(1)
    }
}

start()