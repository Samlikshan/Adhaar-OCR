import {
  ParsedFields,
  AddressResult,
} from "../../interface/types/parsedFeilds";

export const extractFields = (text: string): ParsedFields => {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);

  let name = "";
  let dob = "";
  let gender = "";
  let aadhaar = "";

  const dobMatch = text.match(
    /(?:DOB|Date of Birth)[^\d]*([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i
  );
  if (dobMatch) dob = dobMatch[1];

  const genderMatch = text.match(/\b(MALE|FEMALE|M|F)\b/i);
  if (genderMatch) {
    const g = genderMatch[1].toUpperCase();
    gender = g === "M" ? "MALE" : g === "F" ? "FEMALE" : g;
  }

  const aadhaarMatch = text.match(/\b(\d{4}[\s\-]?\d{4}[\s\-]?\d{4})\b/);
  if (aadhaarMatch) aadhaar = aadhaarMatch[1].replace(/\s+/g, "");

  const noiseKeywords = [
    "GOVERNMENT",
    "OF INDIA",
    "INDIA",
    "AADHAAR",
    "DOB",
    "DATE OF BIRTH",
    "MALE",
    "FEMALE",
  ];

  const possibleNames = lines.filter((line) => {
    const upper = line.toUpperCase();
    return (
      !noiseKeywords.some((keyword) => upper.includes(keyword)) &&
      !/\d{4}[\s\-]?\d{4}[\s\-]?\d{4}/.test(line) &&
      !/[0-9]{2}\/[0-9]{2}\/[0-9]{4}/.test(line) &&
      line.length >= 3
    );
  });

  if (possibleNames.length > 0) {
    name = possibleNames[0];
  }

  return {
    name,
    dob,
    gender,
    documentNumber: aadhaar,
  };
};

export const extractAddress = (text: string): AddressResult => {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);

  const addressKeywords = [
    "S/O",
    "D/O",
    "W/O",
    "HNO",
    "HOUSE",
    "STREET",
    "ROAD",
    "NAGAR",
    "VILLAGE",
    "BLOCK",
    "LANE",
    "SECTOR",
    "COLONY",
    "CITY",
    "DIST",
    "P.O",
    "PO",
    "Pincode",
    "PIN",
    "State",
  ];

  let addressLines: string[] = [];
  let pincode = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toUpperCase();

    const isAddressLine =
      addressKeywords.some((kw) => line.includes(kw)) ||
      /\d{3,}.*(ROAD|STREET|NAGAR|LANE|BLOCK|SECTOR|COLONY)/i.test(line) ||
      /[A-Z]+\s*,?\s*[A-Z]+.*\d{6}/.test(line);

    if (isAddressLine || addressLines.length) {
      addressLines.push(lines[i]);
      const pinMatch = line.match(/\b\d{6}\b/);
      if (pinMatch) {
        pincode = pinMatch[0];
        break;
      }
    }
  }

  const address = addressLines.join(", ");
  return { address, pincode };
};
