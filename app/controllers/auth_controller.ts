import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import env from '#start/env'

export default class AuthController {
  /**
   * Redirect to OAuth provider
   */
  async redirect({ ally, response }: HttpContext) {
    try {
      return ally.use('github').redirect()
    } catch (error) {
      console.error('GitHub redirect error:', error)
      return response.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  /**
   * Handle OAuth callback
   */
  async callback({ ally, auth, response }: HttpContext) {
    const github = ally.use('github')

    if (github.accessDenied()) {
      return response.redirect(
        `http://localhost:4200/auth/callback?error=access_denied`
      )
    }

    if (github.stateMisMatch()) {
      return response.redirect(
        `http://localhost:4200/auth/callback?error=state_mismatch`
      )
    }

    if (github.hasError()) {
      return response.redirect(
        `http://localhost:4200/auth/callback?error=${github.getError()}`
      )
    }

    const githubUser = await github.user()

    let user = await User.findBy('email', githubUser.email)

    if (!user) {
      user = await User.create({
        email: githubUser.email,
        fullName: githubUser.name || githubUser.original.login,
        password: Math.random().toString(36).substring(2, 15), // Random password since OAuth user
      })
    }

    const token = await User.accessTokens.create(user)

    const userData = JSON.stringify({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
    })

    // Redirect to Angular with token and user data as query params
    return response.redirect(
      `http://localhost:4200/auth/callback?token=${token.value}&user=${encodeURIComponent(userData)}`
    )
  }
}
