import express from 'express'
import routes from './routes'
import middlewares from './routes/middlewares'
import config from './config'
import initDB from './db'

const app = express()
try {
    initDB()
} catch (error) {
    console.error('Connection to database failed');
}
// Si la connexion à la BDD à réussi
middlewares(app) // Initialiseation des midllewares AVANT les routes
routes(app) // Initilisatopn des routes

app.listen(config.PORT, () => {
    console.log('Server on')
})

