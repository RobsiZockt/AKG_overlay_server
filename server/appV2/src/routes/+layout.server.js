
// @ts-ignore
export const load = async ({ url, request }) => {
  const host = request.headers.get('host')

  return {
    isCaster: host?.startsWith('cast.'),
    isPublic: host?.startsWith('www.'),
    isOverlay: host?.startsWith('overlay.')
  }
}
