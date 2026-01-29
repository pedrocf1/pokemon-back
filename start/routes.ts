/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import AuthController from '#controllers/auth_controller'
import User from '#models/user'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

// Users routes
router.get('/users', async () => {
  const users = await User.all()
  return users.map(user => ({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }))
})

// OAuth routes
router.get('/auth/github', [AuthController, 'redirect'])
router.get('/auth/github/callback', [AuthController, 'callback'])
