import { APP_SCHEME, BASE_URL } from "@/constant";

export async function GET(request: Request) {
  const incomingParams = new URLSearchParams(request.url.split("?")[1]);
  const combinedPlatformState = incomingParams.get("state");
  console.log("incomingParams", incomingParams);
  console.log("combinedPlatformState", combinedPlatformState);
  if (!combinedPlatformState) {
    return Response.json({ error: "Invalid state" }, { status: 500 });
  }

  // strip platform to return state as it was set on the client
  const [platform, ...rest] = combinedPlatformState.split("|");
  const state = rest.join("|");
  console.log("platform", platform);
  console.log("state", state);
  const outgoingParams = new URLSearchParams({
    code: incomingParams.get("code")?.toString() || "",
    state,
  });
  console.log("outgoingParams", outgoingParams);

  const redirectUrl =
    platform === "web"
      ? `${BASE_URL}#${outgoingParams}`
      : `${APP_SCHEME}#${outgoingParams}`;
  console.log("redirectUrl", redirectUrl);
  return Response.redirect(redirectUrl);

}
