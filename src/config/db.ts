import mongoose from 'mongoose'
import colors from 'colors'

export const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI)
        const url = `${connection.connection.host}: ${connection.connection.port}`
        console.log(colors.magenta.bold(`mongo conectado en: ${url}`) )
    } catch (error) {
        console.log(colors.bgRed.white.bold(error.message))
        process.exit(1)
    }
}