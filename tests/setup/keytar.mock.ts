/**
 * In-memory stand-in for keytar (the OS credential store). Main-project tests must never
 * read or write the developer's real Windows Credential Manager / Keychain.
 */
const store = new Map<string, string>();
const key = (service: string, account: string) => `${service}\u0000${account}`;

export const keytarMock = {
  async setPassword(service: string, account: string, password: string) {
    store.set(key(service, account), password);
  },
  async getPassword(service: string, account: string) {
    return store.get(key(service, account)) ?? null;
  },
  async deletePassword(service: string, account: string) {
    return store.delete(key(service, account));
  },
  /** Test helper: wipe all entries. */
  reset() {
    store.clear();
  },
};
