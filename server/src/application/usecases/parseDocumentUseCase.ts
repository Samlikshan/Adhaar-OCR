import { sendToOCR } from "../../infrastructure/service/ocrService";
import {
  extractFields,
  extractAddress,
} from "../../infrastructure/service/parseService";
import { ParsedData } from "../../interface/dto/parsedData.dto";

export const parseDocumentUseCase = async (files: {
  [fieldname: string]: Express.Multer.File[];
}): Promise<ParsedData> => {
  const front = files["frontImage"]?.[0];
  const back = files["backImage"]?.[0];

  if (!front || !back) {
    throw new Error("Both front and back images are required");
  }

  const [frontText, backText] = await Promise.all([
    sendToOCR(front.path),
    sendToOCR(back.path),
  ]);

  const parsedFields = extractFields(frontText);
  const { address, pincode } = extractAddress(backText);

  return { ...parsedFields, address, pincode };
};
