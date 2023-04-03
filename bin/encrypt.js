import fs from 'fs-extra';
import path from "path";
const __dirname = path.dirname(new URL(import.meta.url).pathname);
import { unlinkSync, existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { randomBytes, scryptSync, createCipheriv, createDecipheriv } from "crypto";


const algorithm = "aes-256-cbc";
const secretKey = "terminalGPT";

const encrypt = (text) => {
  const iv = randomBytes(16);
  const key = scryptSync(secretKey, "salt", 32);
  const cipher = createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

const decrypt = (text) => {
  const textParts = text.split(":");
  const iv = Buffer.from(textParts.shift(), "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const key = scryptSync(secretKey, "salt", 32);
  const decipher = createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

const saveApiKey = (apiKey) => {
  const filePath = path.join(process.cwd(), "bin", "apiKey.txt");

  if (!apiKey) {
    throw new Error("API key is required");
  }

  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, apiKey);
};



const deleteApiKey = () => {
  const filePath = path.join(__dirname, "./apiKey.txt");
  unlinkSync(filePath);
};

const getApiKey = () => {
  const filePath = path.join(__dirname, "./apiKey.txt");
  if (existsSync(filePath)) {
    const getEncryptedScript = readFileSync(filePath, "utf8");
    const decryptedScript = decrypt(getEncryptedScript);
    return decryptedScript;
  }
  return null;
};

export { encrypt, decrypt, saveApiKey, getApiKey, deleteApiKey };
