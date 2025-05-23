export type Server = {
  name?: string;
  server: string;
  match?: string;
  supportsEnglish?: boolean;
  encoding?: string;
};

export type Mapping = {
  name: string;
  // name_localizations?: Partial<Record<Locale, string>>, // TODO: ローカライズ
  match: RegExp;
  server: string;
  origin: RegExp;
};

export const servers: Server[] = [
  {
    name: "APNIC",
    server: "whois.apnic.net",
  },
  {
    name: "ARIN",
    server: "whois.arin.net",
  },
  {
    name: "RIPE",
    server: "whois.ripe.net",
  },
  {
    name: "LACNIC",
    server: "whois.lacnic.net",
  },
  {
    name: "AFRINIC",
    server: "whois.afrinic.net",
  },
  {
    name: "JPRS",
    server: "whois.jprs.jp",
    match: "^(.+\\.jp|[A-z]{2}\\d{5}[Jj][Pp])$",
    supportsEnglish: true,
  },
  {
    name: "JPNIC",
    server: "whois.nic.ad.jp",
    supportsEnglish: true,
    encoding: "iso-2022-jp",
  },
  {
    name: "JPIRR",
    server: "jpirr.nic.ad.jp",
    supportsEnglish: false,
  },
];

export const mappings: Mapping[] = [
  {
    name: "JPNIC Handle",
    match: /([A-z]{2}\d+[Jj][Pp])/g,
    server: "whois.nic.ad.jp",
    origin: /^.*(nic.ad.jp|jprs.jp)$/,
  },
  {
    name: "JPNIC Group Handle",
    match: /([Jj][Pp]\d{8})/g,
    server: "whois.nic.ad.jp",
    origin: /^.*(nic.ad.jp|jprs.jp)$/,
  },
  {
    name: "JPNIC Contact Information",
    match: /([A-z]{2}\d{3}[Jj][Pp])/g,
    server: "whois.nic.ad.jp",
    origin: /^.*(nic.ad.jp|jprs.jp)$/,
  },
];
