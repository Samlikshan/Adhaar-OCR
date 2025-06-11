export interface UploadedImages {
  frontImage: File;
  backImage: File;
}

export interface ParsedData {
  name: string;
  dob: string;
  gender: string;
  address: string;
  pincode: string;
  documentNumber: string;
}

export interface ApiResponse {
  status: string;
  confidence: number;
  extractedText: string;
  parsedData: ParsedData;
  processingTime: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export const uploadAndParseDocument = async ({
  frontImage,
  backImage,
}: UploadedImages): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append("frontImage", frontImage);
  formData.append("backImage", backImage);

  const response = await fetch(API_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to process document");
  }

  return await response.json();
};
