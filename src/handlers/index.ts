// import jwtDecode, { JwtPayload } from 'jwt-decode';

// export async function handler(event: any) {
//   const token = event.headers.authorization;
//   const decoded = jwtDecode<JwtPayload>(token);
//   console.log(decoded.sub);

//   return {
//     statusCode: 200,
//     body: `your subject is ${decoded.sub}`,
//   };
// }

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
