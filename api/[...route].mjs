import { requestHandler } from '../backend/server.mjs';

export default async function handler(request, response) {
  return requestHandler(request, response);
}
