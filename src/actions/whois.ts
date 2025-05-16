import {
  APIActionRowComponent,
  APIStringSelectComponent,
  ComponentType,
  MessageFlags,
} from "discord-api-types/v10";
import { mappings, Server } from "../servers";
import { Context } from "hono";
import { AppEnv } from "..";
import { servers } from "../servers";
import { msg, updateOriginal, defer, update, deferUpdate } from "../utils";
import { whois } from "../whois";

export async function queryWhois(
  c: Context<AppEnv>,
  query: string,
  serverStr: string | undefined,
  english: boolean = false,
  callback = msg,
) {
  const body = c.get("interaction");

  let server: Server | undefined;

  const hostname = serverStr?.match(
    /^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9-]*[A-Za-z0-9])$/,
  );
  if (!serverStr) {
    server = servers.findLast((e) => e.match && query.match(e.match));

    if (!server) {
      const resp = await whois(query, "whois.iana.org");
      const serverDomain = resp
        ?.match(/^whois: (.+)$/m)?.[1]
        .trim()
        .toLowerCase();
      if (serverDomain) {
        server = servers.findLast((e) => e.server === serverDomain);
        if (!server) {
          server = {
            server: serverDomain,
            supportsEnglish: false,
          };
        }
      }
    }
  } else if (hostname) {
    server = servers.findLast(
      (e) => e.server.toLowerCase() === hostname[0].toLowerCase(),
    ) ?? {
      server: hostname[0],
    };
  } else {
    // autocompleteの名前でヒットする場合の処理
    server = servers.findLast(
      (e) =>
        e.name &&
        e.name.trim().toLowerCase() === serverStr.trim().toLowerCase(),
    );

    if (!server) {
      return c.json(
        callback({
          content: "Invalid server",
          flags: MessageFlags.Ephemeral,
          embeds: [],
        }),
      );
    }
  }

  let lookupQuery = query;
  if (english && server?.supportsEnglish && !query.endsWith("/e")) {
    lookupQuery += "/e";
  }

  if (!server) {
    return c.json(
      callback({
        content: "Cannot select server",
        flags: MessageFlags.Ephemeral,
        embeds: [],
      }),
    );
  }

  c.executionCtx.waitUntil(
    (async () => {
      let resp;
      try {
        resp = await whois(lookupQuery, server.server, server.encoding);
        if (!resp) throw new Error("No response from server");
      } catch (e) {
        await updateOriginal(body, {
          content: `Error: ${e}`,
        });
        return;
      }

      const originalOptions =
        (
          body.message?.components as
            | APIActionRowComponent<APIStringSelectComponent>[]
            | undefined
        )?.[0]?.components[0]?.options ?? [];

      const matches: Record<
        string,
        {
          name: string;
          server: string;
          query: string;
        }
      > = {};

      for (const e of originalOptions) {
        const [server, query] = e.value.split(":");
        matches[query] = {
          name: e.description ?? "",
          server: server,
          query,
        };
      }

      for (const mapping of mappings.filter((e) =>
        e.origin.test(server.server),
      )) {
        for (const match of resp.matchAll(mapping.match)) {
          const query = match[1];
          matches[query] = {
            name: mapping.name,
            server: mapping.server,
            query,
          };
        }
      }

      if (
        Object.values(matches).filter((e) => e.name === "Original Query")
          .length === 0
      ) {
        matches[query] = {
          name: "Original Query",
          server: server.server,
          query: query,
        };
      }

      console.log(query);

      let components: APIActionRowComponent<APIStringSelectComponent>[] = [];

      const sortedMatches = Object.values(matches).sort((a, b) => {
        if (a.name === "Original Query") return -1;
        if (b.name === "Original Query") return 1;
        return 0;
      });

      if (Object.keys(matches).length > 0) {
        components = [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.StringSelect,
                custom_id: `whois_links:${lookupQuery}`,
                options: sortedMatches
                  .map((e) => ({
                    label: e.query,
                    value: `${e.server}:${e.query}`,
                    description: e.name,
                    default: e.query === query,
                  }))
                  .slice(0, 25),
              },
            ],
          },
        ];
      }

      await updateOriginal(body, {
        embeds: [
          {
            title: `WHOIS: ${lookupQuery}`,
            description: `\`\`\`\n${resp}\n\`\`\``,
            color: 0x2b2d31,
            timestamp: new Date().toISOString(),
            footer: {
              text: server.name ?? server.server,
            },
          },
        ],
        components,
      });
    })(),
  );

  if (callback === update) {
    return c.json(deferUpdate());
  } else {
    return c.json(defer());
  }
}
