/**
 * 客户端图片压缩与调整工具
 */
/**
 * 将图片缩放并压缩
 * @param file 原始文件
 * @param maxWidth 最大宽度
 * @param maxHeight 最大高度
 * @param quality 质量 (0-1)
 * @returns 压缩后的 Blob 对象
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.8
): Promise<Blob> {
  let imageFile: File | Blob = file;

  // 检查是否为 HEIC 格式
  const isHeic = 
    file.type === "image/heic" || 
    file.type === "image/heif" || 
    file.name.toLowerCase().endsWith(".heic") || 
    file.name.toLowerCase().endsWith(".heif");

  if (isHeic) {
    try {
      console.log("Converting HEIC to JPEG...");
      const heic2any = (await import("heic2any")).default;
      const convertedBlob = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: quality
      });
      // heic2any 可能返回数组，取第一个
      imageFile = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
    } catch (err) {
      console.error("HEIC conversion failed:", err);
      // 如果转换失败，尝试继续使用原文件（虽然浏览器大概率报错）
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // 计算缩放比例
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas toBlob failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
