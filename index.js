import express from 'express'
import routes from './routes'
import middlewares from './routes/middlewares'
import config from './config'
import initDB from './db'

const app = express()
async function launch(params) {
    let connected = false
    while (!connected) {
        try {
            await initDB()
            // Si la connexion à la BDD à réussi
            connected = true
            middlewares(app) // Initialiseation des midllewares AVANT les routes
            routes(app) // Initilisatopn des routes
    
            app.listen(config.PORT, () => {
                console.log('Server on')
            })
        } catch (error) {
            console.log('Connection to database failed')
            await sleep(12500) // Wait 2 min 30 sec
        }
    }
}

launch()

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
