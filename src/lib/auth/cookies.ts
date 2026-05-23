export function getAuthCookieOptions() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const secure = appUrl
    ? appUrl.startsWith("https://")
    : process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  };
}
