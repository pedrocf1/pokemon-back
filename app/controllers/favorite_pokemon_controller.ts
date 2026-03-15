import type { HttpContext } from '@adonisjs/core/http'
import FavoritePokemon from '#models/favorite_pokemon'

export default class FavoritePokemonController {
  /**
   * Get all favorite pokemons for the authenticated user
   */
  async index({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const favorites = await FavoritePokemon.query()
        .where('user_id', user.id)
        .orderBy('created_at', 'desc')

      return favorites.map(fav => ({
        id: fav.id,
        userId: fav.userId,
        pokemonId: fav.pokemonId,
        createdAt: fav.createdAt,
        updatedAt: fav.updatedAt,
      }))
    } catch (error) {
      return response.status(500).json({ error: 'Failed to fetch favorite pokemons' })
    }
  }

  /**
   * Get a single favorite pokemon by ID
   */
  async show({ auth, params, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const { id } = params

      const favorite = await FavoritePokemon.findOrFail(id)

      if (favorite.userId !== user.id) {
        return response.status(403).json({ error: 'Unauthorized' })
      }

      return response.json({
        id: favorite.id,
        userId: favorite.userId,
        pokemonId: favorite.pokemonId,
        createdAt: favorite.createdAt,
        updatedAt: favorite.updatedAt,
      })
    } catch (error) {
      return response.status(500).json({ error: 'Failed to fetch favorite pokemon' })
    }
  }

  /**
   * Create a new favorite pokemon
   */
  async store({ auth, request, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const { pokemonId } = request.body()

      if (!pokemonId) {
        return response.status(400).json({ error: 'pokemonId is required' })
      }
      console.log('USER', user)
      const favorite = await FavoritePokemon.create({
        userId: user.id,
        pokemonId,
      })

      return response.status(201).json({
        id: favorite.id,
        userId: favorite.userId,
        pokemonId: favorite.pokemonId,
        createdAt: favorite.createdAt,
        updatedAt: favorite.updatedAt,
      })
    } catch (error) {
      console.log('Error creating favorite pokemon:', error)
      return response.status(500).json({ error: error })
    }
  }

  /**
   * Delete a favorite pokemon
   */
  async destroy({ auth, params, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const { id } = params

      const favorite = await FavoritePokemon.findOrFail(id)

      if (favorite.userId !== user.id) {
        return response.status(403).json({ error: 'Unauthorized' })
      }

      await favorite.delete()

      return response.status(204).send(null)
    } catch (error) {
      return response.status(500).json({ error: 'Failed to delete favorite pokemon' })
    }
  }
}
