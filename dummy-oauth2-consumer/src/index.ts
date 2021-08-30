import service from "express"
import expressSesssion from "express-session"
import passport from "passport"
import cors from "cors"

import { Issuer, Strategy, TokenSet, UserinfoResponse } from "openid-client"

const main = async () => {
  const openIdProvider = await Issuer.discover("http://localhost:4444")
  const openIdClient = new openIdProvider.Client({
    client_id: "oauth2-client",
    client_secret: "supersecret",
    redirect_uris: ["http://localhost:5003/auth/callback"],
    //post_logout_redirect_uris: ["http://localhost:5003/logout/callback"],
    token_endpoint_auth_method: "client_secret_basic",
  }) 

/*   const openIdProvider = await Issuer.discover("https://beta.hydra.mattiacampagna.com")
  const openIdClient = new openIdProvider.Client({
    client_id: "oauth2-client",
    client_secret: "fsdhiufssihufwHgshgh",
    redirect_uris: ["http://localhost:5003/auth/callback"],
    post_logout_redirect_uris: ["http://localhost:5003/logout/callback"],
    token_endpoint_auth_method: "client_secret_basic",
  }) */
  const app = service()

  app.use(cors() as any)
  app.use(service.json())

  // Sessions
  app.use(
    expressSesssion({
      secret: "keyboard cat",
      resave: false,
      saveUninitialized: true,
    }) as any,
  )

  // Passport
  app.use(passport.initialize() as any)
  app.use(passport.session())

  passport.use(
    "oidc",
    new Strategy(
      { client: openIdClient },
      (tokenSet: TokenSet, userinfo: UserinfoResponse, done: (err: string | null, user?: any) => void) => {
        console.log("token info")
        console.log(tokenSet)
        console.log(tokenSet.claims())
        console.log(userinfo)
        // remove sid from user info, we have no need of that here
        const { sid, ...user } = userinfo
        return done(null, user)
      },
    ),
  )

  passport.serializeUser((user, done) => {
    console.log("serializeUser")
    console.log(user)

    done(null, user)
  })

  passport.deserializeUser((user, done) => {
    console.log("deserializeUser")
    console.log(user)

    done(null, user as any)
  })

  // Start login flow
  app.get("/auth/login", (req, res, next) => {
    passport.authenticate("oidc")(req, res, next)
  })

  // Get callback
  app.get("/auth/callback", (req, res, next) => {
    passport.authenticate("oidc", { successRedirect: "/auth/am-i-auth" })(req, res, next)
  })

  app.get("/auth/am-i-auth", (req, res) => {
    const { user } = req
    res.send({ user })
  })

  // Logout callback
  app.get("/auth/logout/callback", async (req, res, next) => {
    req.logout();
  })

  app.get("/logout", async (req, res, next) => {
    res.redirect('http://localhost:4444/oauth2/sessions/logout')
  })

  app.listen(5003)
  console.log("Server listening at: http://localhost:5003")
}

main()