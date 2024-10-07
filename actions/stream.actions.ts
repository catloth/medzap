"use server";

import { currentUser } from "@clerk/nextjs/server";
import { StreamClient } from "@stream-io/node-sdk";
import { StreamVideoClient } from "@stream-io/video-react-sdk";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

export const tokenProvider = async () => {
  const user = await currentUser();

  if (!user) throw new Error('Usuário não autenticado');
  if (!apiKey) throw new Error('No API key');
  if (!apiSecret) throw new Error('No API secret');

  const client = new StreamClient(apiKey, apiSecret);

  // validity is optional (by default the token is valid for an hour)
  const validity = 60 * 60;  
 
  const token = client.generateUserToken({ user_id: user.id, validity_in_seconds: validity });
  
  return token;
}