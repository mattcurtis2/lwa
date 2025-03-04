
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export const generateUniqueFilename = (originalFilename: string): string => {
  const extension = path.extname(originalFilename);
  const uniqueId = uuidv4();
  return `${uniqueId}${extension}`;
};
