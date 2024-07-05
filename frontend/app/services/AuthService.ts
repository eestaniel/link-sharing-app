import {sessionCookie} from "~/utils/sessionCookie";

// AuthService.js
async function signIn(email: string, password:string) {
  const res = await fetch('http://localhost:3000/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return data;
}

interface Session {
  sessionId: string;
}


async function serializeSession(session: Session) {
   // Serialize the session
  return sessionCookie.serialize(session.sessionId); // Just return the cookie header string
}

async function signOut(token: string) {
  const res = await fetch('http://localhost:3000/auth/signout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({token})
  });

  const data = await res.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}

export { signIn, serializeSession, signOut };
