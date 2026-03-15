import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class FavoritePokemon extends BaseModel {
  public static table = 'favorite_pokemon'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare pokemonId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
