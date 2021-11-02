const serverlessExpress = require('@vendia/serverless-express');
const app = require('../domains/app');

exports.handler = serverlessExpress({ app });

if (process.env.IS_LOCAL === 'true') {
  (async () => {
    // Start your app
    const PORT = process.env.PORT || 3000;
    await app.listen(PORT);

    console.log(`app is running at PORT ${PORT}!`);
  })();
}
