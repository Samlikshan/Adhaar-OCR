import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  Loader2,
  Eye,
  Copy,
  Check,
} from "lucide-react";
import { uploadAndParseDocument } from "./api/ocr";

interface UploadedFile {
  file: File;
  preview: string;
  name: string;
}

interface ParsedData {
  name: string;
  dob: string;
  gender: string;
  address: string;
  pincode: string;
  documentNumber: string;
}

interface ApiResponse {
  status: string;
  confidence: number;
  extractedText: string;
  parsedData: ParsedData;
  processingTime: string;
}

const DocumentUploader: React.FC = () => {
  const [frontImage, setFrontImage] = useState<UploadedFile | null>(null);
  const [backImage, setBackImage] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [showApiResponse, setShowApiResponse] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [copiedApiResponse, setCopiedApiResponse] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const frontFileRef = useRef<HTMLInputElement>(null);
  const backFileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File, type: "front" | "back") => {
    const validImageTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!validImageTypes.includes(file.type)) {
      setUploadError("Only JPG, PNG, or WEBP image files are allowed.");
      return;
    }

    if (file.size > 1024 * 1024) {
      setUploadError("Each file must be under 1MB.");
      return;
    }

    setUploadError(null); // Clear previous error on success

    const preview = URL.createObjectURL(file);
    const uploadedFile: UploadedFile = {
      file,
      preview,
      name: file.name,
    };

    if (type === "front") {
      setFrontImage(uploadedFile);
    } else {
      setBackImage(uploadedFile);
    }
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    type: "front" | "back"
  ) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0], type);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeImage = (type: "front" | "back") => {
    if (type === "front") {
      if (frontImage) URL.revokeObjectURL(frontImage.preview);
      setFrontImage(null);
    } else {
      if (backImage) URL.revokeObjectURL(backImage.preview);
      setBackImage(null);
    }
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const copyApiResponse = async () => {
    if (!apiResponse) return;

    try {
      await navigator.clipboard.writeText(JSON.stringify(apiResponse, null, 2));
      setCopiedApiResponse(true);
      setTimeout(() => setCopiedApiResponse(false), 2000);
    } catch (err) {
      console.error("Failed to copy API response: ", err);
    }
  };
  
  const handleParseDocument = async () => {
    if (!frontImage || !backImage) {
      setUploadError("Please upload both front and back images");
      return;
    }

    setUploadError(null);
    setIsProcessing(true);
    setParsedData(null);
    setApiResponse(null);

    try {
      const response = await uploadAndParseDocument({
        frontImage: frontImage.file, // ✅ only pass the File object
        backImage: backImage.file,
      });

      setApiResponse(response);
      setParsedData(response.parsedData);
    } catch (error) {
      console.error("OCR processing failed:", error);
      setUploadError("Failed to process document. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const DataField: React.FC<{
    label: string;
    value: string;
    fieldKey: string;
  }> = ({ label, value, fieldKey }) => (
    <div>
      <label className="block text-sm font-medium text-gray-500 mb-1">
        {label}
      </label>
      <div className="bg-gray-50 p-3 rounded-lg border relative group">
        <span className="text-gray-900 pr-8">{value}</span>
        <button
          onClick={() => copyToClipboard(value, fieldKey)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
          title="Copy to clipboard"
        >
          {copiedField === fieldKey ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>
    </div>
  );

  const UploadZone: React.FC<{
    title: string;
    type: "front" | "back";
    image: UploadedFile | null;
    fileRef: React.RefObject<HTMLInputElement>;
  }> = ({ title, type, image, fileRef }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>

      {!image ? (
        <div
          className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-blue-50/50"
          onDrop={(e) => handleDrop(e, type)}
          onDragOver={handleDragOver}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <p className="text-blue-600 font-medium mb-2">
            Click here to upload/Capture
          </p>
          <p className="text-gray-500 text-sm">
            or drag and drop your image here
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Supports JPG, PNG, WEBP (Max 1MB)
          </p>
        </div>
      ) : (
        <div className="relative border rounded-xl overflow-hidden bg-white shadow-sm">
          <img
            src={image.preview}
            alt={`${title} preview`}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700 truncate">
                  {image.name}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(type);
                }}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file, type);
        }}
        className="hidden"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Document OCR Parser
          </h1>
          <p className="text-gray-600">
            Upload document images to extract and parse information
            automatically
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8 mb-2">
            <UploadZone
              title="Document Front"
              type="front"
              image={frontImage}
              fileRef={frontFileRef}
            />
            <UploadZone
              title="Document Back"
              type="back"
              image={backImage}
              fileRef={backFileRef}
            />
          </div>

          {uploadError && (
            <div className="text-red-600 text-center mb-4 font-medium">
              {uploadError}
            </div>
          )}

          <button
            onClick={handleParseDocument}
            disabled={!frontImage || !backImage || isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing Document...</span>
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                <span>PARSE DOCUMENT</span>
              </>
            )}
          </button>
        </div>

        {(parsedData || isProcessing) && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Results</h2>

            {isProcessing ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">
                  Extracting information from your documents...
                </p>
              </div>
            ) : (
              parsedData && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Parsed Data
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <DataField
                          label="Name"
                          value={parsedData.name}
                          fieldKey="name"
                        />
                        <DataField
                          label="Date of Birth"
                          value={parsedData.dob}
                          fieldKey="dob"
                        />
                        <DataField
                          label="Gender"
                          value={parsedData.gender}
                          fieldKey="gender"
                        />
                      </div>
                      <div className="space-y-3">
                        <DataField
                          label="Address"
                          value={parsedData.address}
                          fieldKey="address"
                        />
                        <DataField
                          label="Pincode"
                          value={parsedData.pincode}
                          fieldKey="pincode"
                        />
                        <DataField
                          label="Document Number"
                          value={parsedData.documentNumber}
                          fieldKey="documentNumber"
                        />
                      </div>
                    </div>
                  </div>

                  {apiResponse && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          API Response
                        </h3>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={copyApiResponse}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 font-medium px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            {copiedApiResponse ? (
                              <>
                                <Check className="w-4 h-4 text-green-500" />
                                <span className="text-green-500">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setShowApiResponse(!showApiResponse)}
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            <span>
                              {showApiResponse ? "Hide" : "Show"} Details
                            </span>
                          </button>
                        </div>
                      </div>

                      {showApiResponse && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 relative">
                          <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto">
                            {JSON.stringify(apiResponse, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUploader;
