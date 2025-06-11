import axios from "axios";
import FormData from "form-data";
import fs from "fs";

export const sendToOCR = async (filePath: string): Promise<string> => {
  const form = new FormData();
  const apiKey = process.env.OCR_API_KEY;
  const ocrApiUrl = process.env.OCR_API_URL;
  if (!ocrApiUrl) throw new Error("OCR_API_URL is not set");
  if (!apiKey) throw new Error("OCR_API_KEY is not set");

  form.append("apikey", apiKey);
  form.append("language", "eng");
  form.append("file", fs.createReadStream(filePath));

  const response = await axios.post(ocrApiUrl, form, {
    headers: form.getHeaders(),
  });

  return response.data?.ParsedResults?.[0]?.ParsedText || "";
};
