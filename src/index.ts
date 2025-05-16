import { Hono } from 'hono'
import { discordVerify } from './middleware'
import { APIApplicationCommandInteractionDataBooleanOption, APIApplicationCommandInteractionDataStringOption, APIAutocompleteApplicationCommandInteractionData, APIChatInputApplicationCommandInteractionData, APIInteraction, InteractionType, MessageFlags } from 'discord-api-types/v10'
import { whois } from './whois';
import { servers } from './servers';
import { msg, defer, updateOriginal, autocomplete } from './utils';

export type AppEnv = { Variables: { interaction: APIInteraction }, Bindings: { PUBLIC_KEY: string } }

const app = new Hono<AppEnv>()

app.post('/interactions', discordVerify, async (c) => {
  const body = c.get("interaction")

  if (body.type === InteractionType.ApplicationCommand) {
    const data = body?.data as APIChatInputApplicationCommandInteractionData

    if (body.data.name === "whois") {
      let query = (data.options?.findLast((e) => e.name === "query") as APIApplicationCommandInteractionDataStringOption)?.value
      const serverStr = (data.options?.findLast((e) => e.name === "server") as APIApplicationCommandInteractionDataStringOption)?.value
      const english = (data.options?.findLast((e) => e.name === "english") as APIApplicationCommandInteractionDataBooleanOption)?.value ?? true

      let server: {
        name?: string,
        server: string,
        supportsEnglish?: boolean
      } | undefined

      if (!serverStr) {
        server = servers.findLast((e) => e.match && query.match(e.match))

        if (!server) {
          const resp = await whois(query, "whois.iana.org")
          const serverDomain = resp?.match(/^whois: (.+)$/m)?.[1].trim().toLowerCase()
          if (serverDomain) {
            server = servers.findLast((e) => e.server === serverDomain)
            if (!server) {
              server = {
                server: serverDomain,
                supportsEnglish: false
              }
            }
          }
        }
      } else if (!serverStr.match(/^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9-]*[A-Za-z0-9])$/)) { // autocompleteの名前でヒットする場合の処理
        server = servers.findLast((e) => e.name.toLowerCase() === serverStr.toLowerCase())

        if (!server) {
          return c.json(msg({
            content: "Invalid server",
            flags: MessageFlags.Ephemeral
          }))
        }
      }

      if (english && server?.supportsEnglish && !query.endsWith("/e")) {
        query += "/e"
      }

      if (!server) {
        return c.json(msg({
          content: "Cannot select server",
          flags: MessageFlags.Ephemeral
        }))
      }

      c.executionCtx.waitUntil((async () => {
        let resp
        try {
          resp = await whois(query, server.server)
          if (!resp) throw new Error("No response from server")
        } catch (e) {
          return c.json(msg({
            content: `Error: ${e}`,
            flags: MessageFlags.Ephemeral
          }))
        }

        await updateOriginal(body, {
          embeds: [
            {
              title: "WHOIS",
              description: `\`\`\`\n${resp}\n\`\`\``,
              color: 0x2b2d31,
              timestamp: new Date().toISOString(),
              footer: {
                text: server.name ?? server.server
              }
            }
          ]
        })
      })())

      return c.json(defer())
    } else if (body.data.name === "ipinfo") {
      const query = (data.options?.findLast((e) => e.name === "query") as APIApplicationCommandInteractionDataStringOption)?.value

      const resp = await fetch(`https://ipinfo.io/${query}`, {
        headers: {
          "accept": "application/json;charset=utf-8"
        }
      })

      if (resp.ok) {
        const data = await resp.json()

        return c.json(msg({
          embeds: [
            {
              title: "ipinfo.io",
              description: `\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``,
              color: 0x2b2d31,
            }
          ]
        }))
      } else {
        const error = await resp.json() as {
          status: number,
          error: {
            title: string,
            message: string
          }
        }

        return c.json(msg({
          content: `${error.error.title} (${error.status || resp.status}): ${error.error.message}`,
          flags: MessageFlags.Ephemeral
        }))
      }
    }
  } else if (body.type === InteractionType.ApplicationCommandAutocomplete) {
    const data = body?.data as APIAutocompleteApplicationCommandInteractionData

    if (data.name === "whois") {
      const server = (data.options?.findLast((e) => e.name === "server") as APIApplicationCommandInteractionDataStringOption)?.value

      return c.json(autocomplete({
        choices: servers.map((e) => ({
          name: e.name,
          value: e.server
        })).filter((e) => e.name.toLowerCase().includes(server.toLowerCase())).slice(0, 25)
      }))

    }
  }
  return c.json({})
})

export default app
