import { Hono } from "hono";
import { discordVerify } from "./middleware";
import {
  APIApplicationCommandInteractionDataBooleanOption,
  APIApplicationCommandInteractionDataStringOption,
  APIAutocompleteApplicationCommandInteractionData,
  APIChatInputApplicationCommandInteractionData,
  APIInteraction,
  APIMessageSelectMenuInteractionData,
  InteractionType,
} from "discord-api-types/v10";
import { servers } from "./servers";
import { autocomplete, update } from "./utils";
import { queryWhois } from "./actions/whois";
import { queryIpinfo } from "./actions/ipinfo";

export type AppEnv = {
  Variables: {
    interaction: APIInteraction;
    commandIds: Record<string, string>;
  };
  Bindings: { PUBLIC_KEY: string; DISCORD_TOKEN: string };
};

const app = new Hono<AppEnv>();

app.post("/interactions", discordVerify, async (c) => {
  const body = c.get("interaction");

  if (body.type === InteractionType.ApplicationCommand) {
    const data = body?.data as APIChatInputApplicationCommandInteractionData;

    if (body.data.name === "whois") {
      const query = (
        data.options?.findLast(
          (e) => e.name === "query",
        ) as APIApplicationCommandInteractionDataStringOption
      )?.value;
      const serverStr = (
        data.options?.findLast(
          (e) => e.name === "server",
        ) as APIApplicationCommandInteractionDataStringOption
      )?.value;
      const english =
        (
          data.options?.findLast(
            (e) => e.name === "english",
          ) as APIApplicationCommandInteractionDataBooleanOption
        )?.value ?? false;

      return await queryWhois(c, query, serverStr, english);
    } else if (body.data.name === "ipinfo") {
      const query = (
        data.options?.findLast(
          (e) => e.name === "query",
        ) as APIApplicationCommandInteractionDataStringOption
      )?.value;

      return queryIpinfo(c, query);
    }
  } else if (body.type === InteractionType.ApplicationCommandAutocomplete) {
    const data = body?.data as APIAutocompleteApplicationCommandInteractionData;

    if (data.name === "whois") {
      const server = (
        data.options?.findLast(
          (e) => e.name === "server",
        ) as APIApplicationCommandInteractionDataStringOption
      )?.value;

      return c.json(
        autocomplete({
          choices: servers
            .map((e) => ({
              name: e.name ?? e.server,
              value: e.server,
            }))
            .filter((e) => e.name.toLowerCase().includes(server.toLowerCase()))
            .slice(0, 25),
        }),
      );
    }
  } else if (body.type === InteractionType.MessageComponent) {
    const data = body.data as APIMessageSelectMenuInteractionData;

    if (data.custom_id.startsWith("whois_links:")) {
      const original = data.custom_id.split(":")[1];
      const [server, query] = data.values[0].split(":");
      const english = original.endsWith("/e");

      return queryWhois(c, query, server, english, update);
    }
  }

  return c.json({});
});

export default app;
