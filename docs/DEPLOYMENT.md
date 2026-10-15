# Deployment and publication

1. `npm ci`
2. `npm test`
3. `npm run build`
4. Start the development server and run `npm run test:e2e`.
5. Start the production preview on 4173 and run `npm run test:offline`.
6. Import the repository into Vercel as a Vite project (build command `npm run build`, output `dist`). No secrets or API configuration are needed. Or upload dist to another static HTTPS host.
7. Verify the deployed URL, language controls, real calculator, loan example and cached offline reload.

A local branch is suitable for review before pushing. Confirm the destination repository and visibility through an authorized GitHub connection. Authenticate through the provider's official flow; never paste tokens into source code.

The application's financial and learning data is stored in the visitor's browser. Private site hosting, if selected, may require the host's access gate; it does not add an account to the calculator itself. Service workers require HTTPS or localhost. Offline capability is available only after the first complete load and cache installation. Browser storage clearing removes offline caches independently of app progress.

All static files are public to whoever can access the host. Only application code and original course content belong in dist. Never include local user financial exports, browser storage, credentials, research downloads or test artifacts in a deployment.
