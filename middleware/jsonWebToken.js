import jwt from 'jsonwebtoken'

export default {
  getToken(req, res, next) {
    const bearerHeader = req.headers['authorization']
    if (typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ')
      const bearerToken = bearer[1]
      req.token = bearerToken
      next()
    } else {
      res.sendStatus(401)
    }
  },

  verifyToken(req, res, next) {
    jwt.verify(req.token, process.env.JWT_PRIVATE_KEY, (error, decodedToken) => {
      if (error) {
        res.sendStatus(401)
      } else {
        req.userId = decodedToken.user._id
        next()
      }
    })
  }
}