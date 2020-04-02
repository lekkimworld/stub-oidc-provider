# Example client for stub-oidc-provider #

## Configuration ##
The following environment variables are available to configure the example client:
* `OIDC_PROTOCOL` (protocol to use when contacting the OIDC provider, default `http`)
* `OIDC_HOST` (hostname to use when contacting the OIDC provider, default `localhost`)
* `OIDC_PORT` (port to use when contacting the OIDC provider, default is not to specify a port)
* `CLIENT_ID` (client ID to use when contacting the OIDC provider, default `stubOidcClient`)
* `CLIENT_SECRET` (client secret to use when contacting the OIDC provider, default `secretsarehardtokeep`)
* `SESSION_SECRET` (optional, secret for generating session ID's)
* `PORT` (the port to listen on, default is `7000`)
