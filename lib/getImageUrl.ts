export function getImageUrl(image: string) {
  if (process.env.NODE_ENV === "development") {
    return `http://localhost:3000/api/user/asset/get-image?url=${image}`;
  }
  return `https://${process.env.NEXT_PUBLIC_APP_URL}/api/user/asset/get-image?url=${image}`;
}
