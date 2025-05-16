export const servers = [
    {
        name: "JPRS Whois",
        server: "whois.jprs.jp",
        match: "^.+\.jp$"
    },
    {
        name: "JPNIC Whois",
        server: "whois.nic.ad.jp"
    },
    {
        name: "IANA",
        server: "whois.iana.org",
        match: "^.+$",
        supportsEnglish: false
    }
]
