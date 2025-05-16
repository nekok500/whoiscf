export type Server = {
    name?: string,
    server: string,
    match?: string,
    supportsEnglish?: boolean
}

export const servers: Server[] = [
    {
        name: "JPRS Whois",
        server: "whois.jprs.jp",
        match: "^(.+\\.jp|[A-z]{2}\\d{5}[Jj][Pp])$",
        supportsEnglish: true
    },
    {
        name: "JPNIC Whois",
        server: "whois.nic.ad.jp",
        supportsEnglish: true
    }
]
