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
import FavoritePokemonController from '#controllers/favorite_pokemon_controller'
import User from '#models/user'
import { middleware } from '#start/kernel'

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

// Favorite Pokemon routes
router.get('/favorite-pokemon', [FavoritePokemonController, 'index']).use(middleware.auth())
router.get('/favorite-pokemon/:id', [FavoritePokemonController, 'show']).use(middleware.auth())
router.post('/favorite-pokemon', [FavoritePokemonController, 'store']).use(middleware.auth())
router.delete('/favorite-pokemon/:id', [FavoritePokemonController, 'destroy']).use(middleware.auth())

// OAuth routes
router.get('/auth/github', [AuthController, 'redirect'])
router.get('/auth/github/callback', [AuthController, 'callback'])
