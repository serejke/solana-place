export function isMockEnvironment(): boolean {
  return process.env.MOCK_ENV === "true";
}
