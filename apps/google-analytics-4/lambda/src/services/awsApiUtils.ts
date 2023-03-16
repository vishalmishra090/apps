import * as crypto from 'node:crypto';

export async function encryptSharedCredentials(data: object): Promise<string> {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.SECRET_KEY as string), iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export async function decryptSharedCredentials(encrypted: string): Promise<object> {
  const [ivHex, encryptedHex] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(process.env.SECRET_KEY as string), iv);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}

// const dataToEncrypt = {
//   key1: 'value1',
//   key2: 'value2',
// };

// const encryptedData = encrypt(dataToEncrypt);
// console.log('Encrypted data:', encryptedData);

// const decryptedData = decrypt(encryptedData);
// console.log('Decrypted data:', decryptedData);