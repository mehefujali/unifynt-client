import fs from 'fs';
import path from 'path';

const copyRecursiveSync = (src, dest) => {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
};

const basePath = 'h:/Personal/unifynt/unifynt-website/unifynt/src/app/(dashboard)';
copyRecursiveSync(`${basePath}/admin/sms`, `${basePath}/admin/email`);
copyRecursiveSync(`${basePath}/super-admin/sms-packages`, `${basePath}/super-admin/email-packages`);
console.log('Folders copied successfully');
