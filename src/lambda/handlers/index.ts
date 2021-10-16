import jwtDecode, { JwtPayload } from 'jwt-decode';

export async function handler(event: any) {
  const token = event.headers.authorization;
  const decoded = jwtDecode<JwtPayload>(token);
  console.log(decoded.sub);

  return {
    statusCode: 200,
    body: `your subject is ${decoded.sub}`,
  };
}
