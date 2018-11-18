import bodyParser from 'body-parser'
import logger from './logger'
import express from 'express'

export default (app) => {
    app.use(logger)
    app.use(express.json())
    app.use(bodyParser.urlencoded({
        extended: true
    }))
}