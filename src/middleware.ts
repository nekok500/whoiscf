import {
  InteractionResponseType,
  InteractionType,
  type APIInteraction,
  type APIInteractionResponse,
} from "discord-api-types/v10";
import { createMiddleware } from "hono/factory";
import { verifyKey } from "discord-interactions";
import { AppEnv } from ".";

export const discordVerify = createMiddleware<AppEnv>(async (c, next) => {
  const signature = c.req.header("x-signature-ed25519");
  const timestamp = c.req.header("x-signature-timestamp");
  if (!signature || !timestamp) {
    return c.text("", 401);
  }

  const raw = await c.req.text();
  const isValid = await verifyKey(raw, signature, timestamp, c.env.PUBLIC_KEY);
  if (!isValid) return c.text("", 401);

  const body = JSON.parse(raw) as APIInteraction;
  if (body.type === InteractionType.Ping) {
    return c.json<APIInteractionResponse>({
      type: InteractionResponseType.Pong,
    });
  }

  c.set("interaction", body);
  await next();
});
