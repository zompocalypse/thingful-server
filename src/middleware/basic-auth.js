const authService = require('../auth/auth-service')

function requireAuth(req, res, next) {
  const authToken = req.get('Authorization') || ''
  let basicToken

  if (!authToken.toLowerCase().startsWith('basic')) {
    return res.status(401).json({ error: 'Missing basic token' })
  } else {
    basicToken = authToken.slice('basic '.length, authToken.length)
  }
  const [tokenUsername, tokenPassword] = Buffer.from(basicToken, 'base64')
    .toString()
    .split(':')
  if (!tokenUsername || !tokenPassword) {
    return res.status(401).json({ error: 'Unauthorized request' })
  }
  authService
    .getUserWithUserName(req.app.get('db'), tokenUsername)
    .then((user) => {
      if (!user || user.password !== tokenPassword) {
        return res.status(401).json({ error: 'Unauthorized request' })
      }
      req.user = user
      next()
    })
}

module.exports = {
  requireAuth,
}
