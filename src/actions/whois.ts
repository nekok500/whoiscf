import { MessageFlags } from "discord-api-types/v10"
import { Server } from "../servers"
import { Context } from "hono"
import { AppEnv } from ".."
import { servers } from "../servers"
import { msg, updateOriginal, defer, update, deferUpdate } from "../utils"
import { whois } from "../whois"

export async function queryWhois(c: Context<AppEnv>, query: string, serverStr: string, english: boolean, callback = msg) {
    const body = c.get("interaction")

    let server: Server | undefined

    const hostname = serverStr.match(/^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9-]*[A-Za-z0-9])$/)
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
    } else if (hostname) {
        server = servers.findLast((e) => e.server.toLowerCase() === hostname[0].toLowerCase()) ?? {
            server: hostname[0],
        }
    } else { // autocompleteの名前でヒットする場合の処理
        server = servers.findLast((e) => e.name && e.name.trim().toLowerCase() === serverStr.trim().toLowerCase())

        if (!server) {
            return c.json(callback({
                content: "Invalid server",
                flags: MessageFlags.Ephemeral,
                embeds: []
            }))
        }
    }

    if (english && server?.supportsEnglish && !query.endsWith("/e")) {
        query += "/e"
    }

    if (!server) {
        return c.json(callback({
            content: "Cannot select server",
            flags: MessageFlags.Ephemeral,
            embeds: []
        }))
    }

    c.executionCtx.waitUntil((async () => {
        let resp
        try {
            resp = await whois(query, server.server)
            if (!resp) throw new Error("No response from server")
        } catch (e) {
            await updateOriginal(body, {
                content: `Error: ${e}`,
            })
            return
        }

        await updateOriginal(body, {
            embeds: [
                {
                    title: `WHOIS: ${query}`,
                    description: `\`\`\`\n${resp}\n\`\`\``,
                    color: 0x2b2d31,
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: server.name ?? server.server
                    }
                },
            ]
        })
    })())

    if (callback === update) {
        return c.json(deferUpdate())
    } else {
        return c.json(defer())
    }
}
