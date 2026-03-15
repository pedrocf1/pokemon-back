import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class AuthController {
  /**
   * Redirect to OAuth provider with stateless mode
   */
  async redirect({ ally }: HttpContext) {
    try {
      return ally.use('github').stateless().redirect()
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Handle OAuth callback with stateless authentication
   */
  async callback({ ally, response }: HttpContext) {
    const github = ally.use('github').stateless()

    // Handle access denied
    if (github.accessDenied()) {
      return response.redirect(
        `http://localhost:4200/auth/callback?error=access_denied`
      )
    }

    // Handle state mismatch (CSRF protection)
    if (github.stateMisMatch()) {
      return response.redirect(
        `http://localhost:4200/auth/callback?error=state_mismatch`
      )
    }

    // Handle provider errors
    if (github.hasError()) {
      const errorMsg = github.getError() || 'Unknown error'
      return response.redirect(
        `http://localhost:4200/auth/callback?error=${encodeURIComponent(errorMsg)}`
      )
    }

    try {
      const githubUser = await github.user()

      /**
       * Find or create user in database
       */
      const user = await User.firstOrCreate(
        { email: githubUser.email },
        {
          email: githubUser.email,
          fullName: githubUser.name || githubUser.nickName || 'GitHub User',
          password: crypto.randomUUID(),
        }
      )

      /**
       * Create an access token for the user
       */
      const token = await User.accessTokens.create(user)
      const tokenValue = token.value!.release()

      console.log('OAuth callback successful for user:', user.email)

      const userData = JSON.stringify({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
      })

      // Redirect back to frontend with token and user data
      return response.redirect(
        `http://localhost:4200/auth/callback?token=${tokenValue}&user=${encodeURIComponent(userData)}`
      )
    } catch (error) {
      console.error('OAuth callback error:', error)
      return response.redirect(
        `http://localhost:4200/auth/callback?error=callback_failed&message=${encodeURIComponent(error instanceof Error ? error.message : 'OAuth callback failed')}`
      )
    }
  }
}
