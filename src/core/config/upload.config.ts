import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';

const MB = 1024 * 1024;

export const IMAGE_MAX_SIZE_BYTES = 5 * MB;
export const VIDEO_MAX_SIZE_BYTES = 100 * MB;

export const IMAGE_PUBLIC_PATH = '/uploads/images';
export const VIDEO_PUBLIC_PATH = '/uploads/videos';

export const IMAGE_UPLOAD_DIR = join(process.cwd(), 'uploads', 'images');
export const VIDEO_UPLOAD_DIR = join(process.cwd(), 'uploads', 'videos');

const ensureDir = (dir: string) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
};

const createStorage = (destination: string) =>
  diskStorage({
    destination: (_req, _file, cb) => {
      ensureDir(destination);
      cb(null, destination);
    },
    filename: (_req, file, cb) => {
      const ext = extname(file.originalname).toLowerCase();
      const uniqueName = `${Date.now()}-${randomUUID()}${ext}`;
      cb(null, uniqueName);
    },
  });

const createFileFilter = (
  allowedMimeTypes: Set<string>,
  allowedExtensions: Set<string>,
  label: string,
): MulterOptions['fileFilter'] => {
  return (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    const isAllowed =
      allowedMimeTypes.has(file.mimetype) || allowedExtensions.has(ext);

    if (isAllowed) {
      return cb(null, true);
    }

    return cb(
      new BadRequestException(
        `Invalid ${label} file type. Allowed: ${Array.from(allowedExtensions).join(', ')}`,
      ),
      false,
    );
  };
};

const imageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const videoMimeTypes = new Set([
  'video/mp4',
  'video/x-matroska',
  'video/quicktime',
]);
const videoExtensions = new Set(['.mp4', '.mkv', '.mov']);

export const imageUploadOptions: MulterOptions = {
  storage: createStorage(IMAGE_UPLOAD_DIR),
  fileFilter: createFileFilter(imageMimeTypes, imageExtensions, 'image'),
  limits: { fileSize: IMAGE_MAX_SIZE_BYTES },
};

export const videoUploadOptions: MulterOptions = {
  storage: createStorage(VIDEO_UPLOAD_DIR),
  fileFilter: createFileFilter(videoMimeTypes, videoExtensions, 'video'),
  limits: { fileSize: VIDEO_MAX_SIZE_BYTES },
};

export const buildPublicFilePath = (basePath: string, filename: string) => {
  const normalizedBase = basePath.endsWith('/')
    ? basePath.slice(0, -1)
    : basePath;
  return `${normalizedBase}/${filename}`;
};
