export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function reportError(err: unknown, context: string) {
  if (err instanceof Error) {
    console.error(context, err);
  }
}