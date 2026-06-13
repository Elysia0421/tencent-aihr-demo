import fs from 'fs/promises';
import path from 'path';
import COS from 'cos-nodejs-sdk-v5';

const requiredEnv = [
  'TENCENT_SECRET_ID',
  'TENCENT_SECRET_KEY',
  'TENCENT_COS_BUCKET',
  'TENCENT_COS_REGION',
];

for (const name of requiredEnv) {
  if (!process.env[name]) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
}

const bucket = process.env.TENCENT_COS_BUCKET;
const region = process.env.TENCENT_COS_REGION;
const prefix = process.env.TENCENT_COS_PREFIX ? process.env.TENCENT_COS_PREFIX.replace(/^\/+|\/+$/g, '') + '/' : '';

const cos = new COS({
  SecretId: process.env.TENCENT_SECRET_ID,
  SecretKey: process.env.TENCENT_SECRET_KEY,
});

const rootDir = path.resolve('./dist');

const contentTypes = {
  html: 'text/html; charset=utf-8',
  js: 'application/javascript; charset=utf-8',
  css: 'text/css; charset=utf-8',
  json: 'application/json; charset=utf-8',
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  ico: 'image/x-icon',
  map: 'application/json; charset=utf-8',
  txt: 'text/plain; charset=utf-8',
  xml: 'application/xml; charset=utf-8',
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  eot: 'application/vnd.ms-fontobject',
};

const getContentType = (filename) => {
  const ext = path.extname(filename).slice(1).toLowerCase();
  return contentTypes[ext] || 'application/octet-stream';
};

const uploadObject = (Key, Body, ContentType) => new Promise((resolve, reject) => {
  cos.putObject({
    Bucket: bucket,
    Region: region,
    Key,
    Body,
    ContentType,
    CacheControl: 'public, max-age=31536000, immutable',
  }, (err, data) => {
    if (err) {
      reject(err);
    } else {
      resolve(data);
    }
  });
});

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
};

const main = async () => {
  try {
    const files = await walk(rootDir);
    if (files.length === 0) {
      throw new Error('dist 目录为空，请先运行 npm run build');
    }

    console.log(`Uploading ${files.length} files to COS bucket ${bucket}/${prefix}`);

    for (const filePath of files) {
      const relativePath = path.relative(rootDir, filePath).split(path.sep).join('/');
      const Key = `${prefix}${relativePath}`;
      const Body = await fs.readFile(filePath);
      const ContentType = getContentType(filePath);

      process.stdout.write(`Uploading ${Key} ... `);
      await uploadObject(Key, Body, ContentType);
      console.log('done');
    }

    console.log('\n上传完成！请在 COS 控制台或 CDN 中确认静态站点设置。');
  } catch (error) {
    console.error('上传失败：', error);
    process.exit(1);
  }
};

main();
