import jwt from 'jsonwebtoken'
import config from '../../config'

export default (req, res, next) => {
    // X-Auth-Token
    const user_token = req.get('X-Auth-Token')
    if(!user_token) { // Check if there is a token in the header
        return res.json({status: 'failed', message: 'No token in header'})
    } else {
        jwt.verify(user_token, config.SALT, (err, decoded) => {
            if (err)
                res.json({ status: "failed", message: 'Invalid token' })
            else
                next()
        })
    }
}
