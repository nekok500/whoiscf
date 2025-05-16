import { Socket } from "net";
import PromiseSocket from "promise-socket";

export async function whois(
  query: string,
  server: string,
  encoding: string | undefined = undefined,
): Promise<string | undefined> {
  console.info(`query to ${server}: ${query}`);
  const port = 43;
  const client = new PromiseSocket(new Socket());

  await client.connect(port, server);

  await client.write(query + "\r\n");

  const data = await client.readAll();
  await client.end();

  if (encoding && data instanceof Buffer) {
    console.debug("decoding with", encoding);
    return new TextDecoder(encoding).decode(data);
  }

  return data?.toString();
}
