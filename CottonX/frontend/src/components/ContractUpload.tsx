"use client";

import { pixelify_sans } from '@/app/fonts';
import { useState } from 'react';
import { FiUpload, FiFile, FiCheck, FiX } from 'react-icons/fi';

interface ContractUploadProps {
    userId: string;
    onUploadSuccess?: (fileId: string, contractName: string) => void;
}

interface UploadResult {
    success: boolean;
    fileId?: string;
    fileName?: string;
    contractName?: string;
    error?: string;
    details?: string;
}

const ContractUpload = ({ userId, onUploadSuccess }: ContractUploadProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [contractName, setContractName] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = (file: File) => {
        if (file.name.endsWith('.sol')) {
            setSelectedFile(file);
            setUploadResult(null);
            // Try to extract contract name from filename
            const nameWithoutExt = file.name.replace('.sol', '');
            setContractName(nameWithoutExt);
        } else {
            setUploadResult({
                success: false,
                error: 'Please select a .sol file'
            });
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !contractName.trim()) {
            setUploadResult({
                success: false,
                error: 'Please select a file and enter a contract name'
            });
            return;
        }

        setIsUploading(true);
        setUploadResult(null);

        try {
            // Read file content
            const sourceCode = await selectedFile.text();

            // Send to backend
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'}/api/contracts/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    fileName: selectedFile.name,
                    sourceCode,
                    contractName: contractName.trim()
                })
            });

            const result = await response.json();

            if (result.success) {
                setUploadResult({
                    success: true,
                    fileId: result.data.fileId,
                    fileName: result.data.fileName,
                    contractName: result.data.contractName
                });
                
                // Call success callback
                if (onUploadSuccess) {
                    onUploadSuccess(result.data.fileId, result.data.contractName);
                }

                // Reset form after 3 seconds
                setTimeout(() => {
                    setSelectedFile(null);
                    setContractName('');
                    setUploadResult(null);
                }, 3000);
            } else {
                setUploadResult({
                    success: false,
                    error: result.error || 'Upload failed',
                    details: result.details
                });
            }
        } catch (error: any) {
            setUploadResult({
                success: false,
                error: 'Network error',
                details: error.message
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={`${pixelify_sans.className} bg-card/80 backdrop-blur-sm rounded-lg p-4 space-y-4`}>
            <h3 className="font-semibold text-lg text-blue-900">Deploy Custom Contract</h3>
            
            {/* Drag & Drop Area */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
                    border-2 border-dashed rounded-lg p-6 text-center transition-colors
                    ${isDragging 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-blue-400'
                    }
                `}
            >
                {selectedFile ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                        <FiFile size={24} />
                        <span className="font-medium">{selectedFile.name}</span>
                        <button
                            onClick={() => setSelectedFile(null)}
                            className="ml-2 text-red-500 hover:text-red-700"
                        >
                            <FiX size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <FiUpload size={32} className="mx-auto text-gray-400" />
                        <p className="text-gray-600">Drag & drop your .sol file here</p>
                        <p className="text-sm text-gray-400">or</p>
                        <label className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors">
                            Browse Files
                            <input
                                type="file"
                                accept=".sol"
                                onChange={handleFileInput}
                                className="hidden"
                            />
                        </label>
                    </div>
                )}
            </div>

            {/* Contract Name Input */}
            {selectedFile && (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Contract Name
                    </label>
                    <input
                        type="text"
                        value={contractName}
                        onChange={(e) => setContractName(e.target.value)}
                        placeholder="e.g., SimpleToken, MyNFT"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 
                                 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500">
                        Enter the main contract name from your Solidity file
                    </p>
                </div>
            )}

            {/* Upload Button */}
            {selectedFile && (
                <button
                    onClick={handleUpload}
                    disabled={isUploading || !contractName.trim()}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg
                             hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed
                             transition-colors flex items-center justify-center gap-2"
                >
                    {isUploading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <FiUpload size={18} />
                            Upload & Compile
                        </>
                    )}
                </button>
            )}

            {/* Upload Result */}
            {uploadResult && (
                <div className={`
                    p-4 rounded-lg border-2
                    ${uploadResult.success 
                        ? 'bg-green-50 border-green-500 text-green-800' 
                        : 'bg-red-50 border-red-500 text-red-800'
                    }
                `}>
                    <div className="flex items-start gap-2">
                        {uploadResult.success ? (
                            <FiCheck size={20} className="flex-shrink-0 mt-0.5" />
                        ) : (
                            <FiX size={20} className="flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                            {uploadResult.success ? (
                                <div className="space-y-1">
                                    <p className="font-semibold">Contract uploaded successfully!</p>
                                    <p className="text-sm">Contract: {uploadResult.contractName}</p>
                                    <p className="text-xs font-mono bg-white/50 p-2 rounded mt-2">
                                        File ID: {uploadResult.fileId}
                                    </p>
                                    <p className="text-sm mt-2">
                                        Now ask Rishi to deploy it: "Deploy my {uploadResult.contractName} contract"
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <p className="font-semibold">{uploadResult.error}</p>
                                    {uploadResult.details && (
                                        <p className="text-sm whitespace-pre-wrap">{uploadResult.details}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="text-xs text-gray-500 space-y-1 border-t pt-3">
                <p className="font-semibold">How it works:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Upload your Solidity (.sol) file</li>
                    <li>Enter the main contract name</li>
                    <li>Contract will be compiled and validated</li>
                    <li>Ask Rishi to deploy it to HeLa testnet</li>
                </ol>
            </div>
        </div>
    );
};

export default ContractUpload;
