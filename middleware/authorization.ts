import jwt from "koa-jwt"
import jwks from "jwks-rsa"

const oAuth = jwt({
    secret: jwks.koaJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: ''
    }),
    audience: '',
    algorithms: ['RS256']
})

export default oAuth
