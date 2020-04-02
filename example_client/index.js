const express = require("express");
const { Issuer, generators } = require('openid-client');
const session = require("express-session");
const logger = require("./logger");
require("dotenv").config();

const app = express();
app.use(session({
    "saveUninitialized": false,
    "resave": false,
    "secret": process.env.SESSION_SECRET || "DoNotTellAnybody"
}));

// build OpenID client
const discoveryAddress = `${process.env.OIDC_PROTOCOL || "http"}://${process.env.OIDC_HOST || "localhost"}${process.env.OIDC_PORT ? `:${process.env.OIDC_PORT}` : ""}`;
logger.info(`Doing discovery against address <${discoveryAddress}>`);
Issuer.discover(discoveryAddress).then(oidcIssuer => {
    logger.debug(`Received OIDC discovery info`, JSON.stringify(oidcIssuer));
    const redirectUri = process.env.REDIRECT_URI || `http://localhost:${process.env.PORT || 7000}/callback`;
    logger.debug(`Redirect URI is <${redirectUri}>`);
    const client = new oidcIssuer.Client({
        "client_id": process.env.CLIENT_ID,
        "client_secret": process.env.CLIENT_SECRET,
        "redirect_uris": [process.env.REDIRECT_URI],
        "response_types": ["code"]
    })

    app.get("/callback", (req, res) => {
        logger.debug("Received callback from OIDC provider");
        const nonce = req.session.nonce;
        logger.debug(`Retrieved nonce from session <${nonce}>`);
        if (!nonce) return res.status(417).send(`No nonce found (<${nonce}>)`);
        
        // get params
        const params = client.callbackParams(req);
        logger.debug(`Doing callback to OIDC provider using parameters`, params);
        client.callback(redirectUri, params, { nonce }, {
            "exchangeBody": {
                "client_secret": process.env.CLIENT_SECRET
            }}).then((tokenSet) => {
            // get claims and validate hosted domain
            const claims = tokenSet.claims();
            
            // save in session and redirect
            logger.debug(`Retrieved claims from OIDC provider - storing in session`, claims);
            req.session.user = claims;

            res.redirect("/");
        }).catch(err => {
            logger.error(`Unable to perform callback to OIDC provider: ${err.message}`, err);
            return res.status(500).send(`Unable to do callback to OIDC provider - message: ${err.message}`);
        });
    })
    app.get("/logout", (req, res) => {
        if (req.session || req.session.user) {
            delete req.session.user;
            res.redirect("/");
        }
    })
    app.get("/login", (req, res) => {
        // generate nonce and auth url
        const nonce = generators.nonce();
        logger.debug(`Generated nonce <${nonce}>`);
        const url = client.authorizationUrl({
            "scope": process.env.SCOPES || "openid email profile",
            "nonce": nonce,
            "redirect_uri": redirectUri
        });
        logger.debug(`Generated authorization url <${url}>`);

        // store in session
        req.session.nonce = nonce;
        req.session.save(err => {
            logger.info(`Starting redirect for authentication - nonce <${nonce}>`);

            // abort if errror
            if (err) {
                return res.status(500).send({"error": true, "message": "Unable to save session"});
            }

            // redirect
            return res.redirect(url);
        });
    })
})

app.get("/", (req, res) => {
    res.type("html");
    if (req.session.user) {
        res.send(`
        <html>
        <body>
        <h1>Hello ${req.session.user.sub}!</h1>
        <a href="/logout">Logout</a>
        </body>
        </html>
        `);
    } else {
        res.send(`
        <html>
        <body>
        <h1>Hello stranger!</h1>
        <a href="/login">Login</a>
        </body>
        </html>
        `);
    }
})

logger.info(`Listening on <http://localhost:${process.env.PORT || 7000}>`);
app.listen(process.env.PORT || 7000);