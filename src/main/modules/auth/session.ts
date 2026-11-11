import keytar from "keytar";
import z from "zod";

const userSchema = z.object({
  id: z.uuidv4("user Id is required for user session."),
  username: z.string("username is required for user session."),
});

export type SessionUser = z.infer<typeof userSchema>;

// global user session state in main process
let session: SessionUser | null = null;

// Throws inside the callers' try blocks when unset, which keytar did implicitly before.
function serviceName(): string {
  const name = process.env.SERVICE_NAME;
  if (!name) throw new Error("SERVICE_NAME is not set");
  return name;
}

export async function setSession(user: SessionUser) {
  const parsed = userSchema.parse(user);
  session = parsed;
  try {
    await keytar.setPassword(serviceName(), "lastUserId", user.id);
  } catch (error) {
    console.error("Error in setSession function.", error);
  }
}

export function getSession() {
  return session;
}

export async function clearSession() {
  session = null;
  try {
    await keytar.deletePassword(serviceName(), "lastUserId");
  } catch (error) {
    console.error("Error in clearSession function.", error);
  }
}

export async function getLastUserId() {
  try {
    return await keytar.getPassword(serviceName(), "lastUserId");
  } catch (error) {
    console.error("Error in getLastUserId function.", error);
  }
}
