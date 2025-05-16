import { ApplicationCommandOptionType, ApplicationIntegrationType, InteractionContextType, RESTPutAPIApplicationCommandsJSONBody } from "discord-api-types/v10";

const commands: RESTPutAPIApplicationCommandsJSONBody = [
    {
        name: "whois",
        description: "Query a server for WHOIS",
        description_localizations: {
            ja: "指定したサーバーにWHOISをクエリします",
        },
        integration_types: [ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall],
        contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
        options: [
            {
                name: "query",
                description: "Query",
                description_localizations: {
                    ja: "クエリ",
                },
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: "server",
                description: "Whois Server",
                description_localizations: {
                    ja: "クエリするサーバー",
                },
                type: ApplicationCommandOptionType.String,
                autocomplete: true
            },
            {
                name: "english",
                description: "Query in English",
                description_localizations: {
                    ja: "英語でクエリするかどうか",
                },
                type: ApplicationCommandOptionType.Boolean,
                required: false
            }
        ]
    },
    {
        name: "ipinfo",
        description: "Query ipinfo",
        description_localizations: {
            ja: "ipinfo.ioにクエリします",
        },
        integration_types: [ApplicationIntegrationType.UserInstall, ApplicationIntegrationType.GuildInstall],
        contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
        options: [
            {
                name: "query",
                description: "Query",
                description_localizations: {
                    ja: "クエリ",
                },
                type: ApplicationCommandOptionType.String,
                required: true
            },
        ]
    },
]

const resp = await fetch(`https://discord.com/api/v10/applications/${process.env.APPLICATION_ID}/commands`, {
    method: "PUT",
    body: JSON.stringify(commands),
    headers: {
        "Authorization": `Bot ${process.env.DISCORD_TOKEN}`,
        "Content-Type": "application/json"
    }
})

if (resp.ok) {
    console.info(await resp.json())
} else {
    console.error(await resp.text())
}
