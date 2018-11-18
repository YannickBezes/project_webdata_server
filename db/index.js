import config from '../config'
import { MongoClient } from 'mongodb'

export let db

export default () => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(config.MONGO_URL, { useNewUrlParser: true, autoReconnect: true }, (err, client) => {
            if (err) return reject()
            db = client.db()
            console.log('Connected to mongoDB')
            return resolve()
        })
    })
}