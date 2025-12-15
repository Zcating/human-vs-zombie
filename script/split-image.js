/* eslint-disable no-undef */
import sharp from 'sharp';
import path from 'path';

// 获取命令行参数
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('请提供图片路径作为参数');
  process.exit(1);
}

const inputPath = args[0];
const dir = path.dirname(inputPath);
const ext = path.extname(inputPath);
const name = path.basename(inputPath, ext);

async function processImage() {
  try {
    console.log(`正在处理图片: ${inputPath}`);

    // 1. 读取图片并转换为 raw buffer 以便处理像素
    const image = sharp(inputPath).ensureAlpha();
    const { data, info } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });

    // 2. 遍历像素，将白色背景替换为透明
    // 假设白色阈值为 250 (0-255)
    const threshold = 235;
    const channels = info.channels; // 通常为 4 (RGBA)

    if (channels !== 4) {
      throw new Error('图片必须包含 Alpha 通道或被转换为 RGBA');
    }

    for (let i = 0; i < data.length; i += channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // 检查是否为白色（或接近白色）
      if (r >= threshold && g >= threshold && b >= threshold) {
        data[i + 3] = 0; // 设置 Alpha 为 0 (完全透明)
      }
    }

    // 重新构建 sharp 对象
    const processedImage = sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: channels,
      },
    });

    // 3. 切割图片为四份
    const width = 1024;
    const height = 1024;
    const halfW = width / 2;
    const halfH = height / 2;

    // 检查尺寸是否匹配
    if (info.width !== width || info.height !== height) {
      console.warn(
        `警告: 图片尺寸为 ${info.width}x${info.height}，建议为 ${width}x${height}`
      );
    }

    const regions = [
      { name: 'tl', left: 0, top: 0, width: halfW, height: halfH }, // 左上
      { name: 'tr', left: halfW, top: 0, width: halfW, height: halfH }, // 右上
      { name: 'bl', left: 0, top: halfH, width: halfW, height: halfH }, // 左下
      { name: 'br', left: halfW, top: halfH, width: halfW, height: halfH }, // 右下
    ];

    for (const region of regions) {
      const outputPath = path.join(dir, `${name}_${region.name}.png`);

      await processedImage
        .clone()
        .extract({
          left: region.left,
          top: region.top,
          width: region.width,
          height: region.height,
        })
        .toFormat('png')
        .toFile(outputPath);

      console.log(`已生成: ${outputPath}`);
    }

    console.log('处理完成！');
  } catch (err) {
    console.error('处理失败:', err);
  }
}

processImage();
