import {
  APP_SCHEME,
  BASE_URL,
  GOOGLE_AUTH_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_REDIRECT_URI,
} from "@/constant";

export async function GET(request: Request) {
  if (!GOOGLE_CLIENT_ID) {
    return Response.json(
      { error: "Google Client ID not configured" },
      { status: 500 },
    );
  }

  const url = new URL(request.url);
  let idpClientId: string;
  console.log("url", url);

  const internalClient = url.searchParams.get("client_id");
  const redirectUri = url.searchParams.get("redirect_uri");

  let platform;

  const appSchemePrefix = APP_SCHEME.replace("://", "");
  if (
    redirectUri?.startsWith("expodevbuild://") ||
    redirectUri?.startsWith(`${appSchemePrefix}://`) ||
    redirectUri?.startsWith("exp://")
  ) {
    platform = "mobile";
  } else if (redirectUri === BASE_URL) {
    platform = "web";
  } else {
    return Response.json({ error: "Invalid redirect_uri" }, { status: 400 });
  }

  const clientState = url.searchParams.get("state");
  if (!clientState) {
    return Response.json({ error: "Missing state parameter" }, { status: 400 });
  }

  let state = `${platform}|${clientState}`;
  console.log("state", state);

  if (internalClient === "google") {
    idpClientId = GOOGLE_CLIENT_ID;
  } else {
    return Response.json({ error: "Unsupported client_id" }, { status: 400 });
  }
  const params = new URLSearchParams({
    client_id: idpClientId,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: url.searchParams.get("scope") || "identity",
    state,
    access_type: "offline",
    prompt: "select_account",
  });

  return Response.redirect(GOOGLE_AUTH_URL + "?" + params.toString());
}
