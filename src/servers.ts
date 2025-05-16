export type Server = {
  name?: string;
  server: string;
  match?: string;
  supportsEnglish?: boolean;
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
    name: "JPRS Whois",
    server: "whois.jprs.jp",
    match: "^(.+\\.jp|[A-z]{2}\\d{5}[Jj][Pp])$",
    supportsEnglish: true,
  },
  {
    name: "JPNIC Whois",
    server: "whois.nic.ad.jp",
    supportsEnglish: true,
  },
];

export const mappings: Mapping[] = [
  {
    name: "JPNIC Handle",
    match: /([A-z]{2}\d+[Jj][Pp])/g,
    server: "whois.nic.ad.jp",
    origin: /^.*(nic.ad.jp|jprs.jp)$/,
  },{
    name: "JPNIC Group Handle",
    match: /([Jj][Pp]\d{8})/g,
    server: "whois.nic.ad.jp",
    origin: /^.*(nic.ad.jp|jprs.jp)$/,
  },
];
