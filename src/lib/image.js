// 업로드 전에 브라우저에서 사진을 줄여 JPEG로 변환합니다.
// (휴대폰 원본 5~10MB → 대략 200~400KB) 서버 저장공간과 로딩 속도 모두 절약.
async function loadImage(file) {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      // 일부 브라우저/형식은 아래 방식으로 대체
    }
  }
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('이미지를 읽을 수 없습니다: ' + file.name))
    img.src = URL.createObjectURL(file)
  })
}

function toBase64(img, maxSide, quality) {
  const w = img.width
  const h = img.height
  const scale = Math.min(1, maxSide / Math.max(w, h))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(w * scale)
  canvas.height = Math.round(h * scale)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', quality).split(',')[1]
}

export async function prepareImage(file) {
  const img = await loadImage(file)
  return {
    mime: 'image/jpeg',
    data: toBase64(img, 1600, 0.82),
    thumb: toBase64(img, 560, 0.78),
  }
}
