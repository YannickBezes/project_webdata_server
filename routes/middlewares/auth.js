import sha from 'jssha'
import config from '../../config'

export default (req, res, next) => {
    // X-Auth-Token
    const userToken = req.get('X-Auth-Token')
    const serverToken = genrateToken(req.originalUrl)

    // console.log(`Token - ${userToken} vs ${serverToken}`)

    if(!userToken) {
        return res.json({status: 'failed', message: 'No token in header'})
    } else if(userToken !== serverToken) {
        return res.json({status: 'failed', message: 'Token invalid'})
    }
    next()
}

// Génère un token unique pour la route accédée
function genrateToken(path) {
    // Sans hash
    // return path + config.SALT

    // Avec le hash
    const _sha = new sha('SHA-512', 'TEXT')
    // Crééer la chaine à hasher et l'encoder
    const string = encodeURI(path + config.SALT)

    _sha.update(string)

    return _sha.getHash('HEX')
}
