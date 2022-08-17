
export function waitUntil(
  checkFn: () => boolean,
  timeout: number = 5000,
  checkDelay: number = 100,
): Promise<void> {
  const startTime = Date.now()

  function check(resolve: () => void, reject: (reason: string) => void) {
    if (checkFn()) {
      resolve()
    } else if (Date.now() - startTime > timeout) {
      reject("Timeout")
    } else {
      setTimeout(() => check(resolve, reject), checkDelay)
    }
  }

  return new Promise((resolve, reject) => {
    check(resolve, reject)
  })
}