import { MessageFlags } from "discord-api-types/v10";
import { Context } from "hono";
import { AppEnv } from "..";
import { msg } from "../utils";

export async function queryIpinfo(
  c: Context<AppEnv>,
  query: string,
  callback = msg,
) {
  const resp = await fetch(`https://ipinfo.io/${query}`, {
    headers: {
      accept: "application/json;charset=utf-8",
    },
  });

  if (resp.ok) {
    const data = await resp.json();

    return c.json(
      callback({
        embeds: [
          {
            title: `ipinfo.io: ${query}`,
            description: `\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``,
            color: 0x2b2d31,
          },
        ],
      }),
    );
  } else {
    const error = (await resp.json()) as {
      status: number;
      error: {
        title: string;
        message: string;
      };
    };

    return c.json(
      callback({
        content: `${error.error.title} (${error.status || resp.status}): ${error.error.message}`,
        flags: MessageFlags.Ephemeral,
      }),
    );
  }
}
