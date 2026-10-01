const imageUrls = Object.fromEntries(
  Object.entries(import.meta.glob('../assets/img/*.{avif,gif,jpg,jpeg,png,webp,AVIF,GIF,JPG,JPEG,PNG,WEBP}', {
    eager: true,
    query: '?url',
    import: 'default',
  })),
);

export function imageUrl(file) {
  return imageUrls[`../assets/img/${file}`] || `/assets/img/${file}`;
}
