'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface ImageUploadProps {
    value?: string | string[];
    onChange: (urls: string | string[]) => void;
    multiple?: boolean;
    folder?: string;
    maxFiles?: number;
    className?: string;
}

export function ImageUpload({
    value,
    onChange,
    multiple = false,
    folder = 'general',
    maxFiles = 5,
    className = ''
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Normalize value to array
    const images: string[] = Array.isArray(value) ? value : (value ? [value] : []);

    const handleFiles = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const filesToUpload = Array.from(files).slice(0, multiple ? maxFiles - images.length : 1);
        if (filesToUpload.length === 0) return;

        setIsUploading(true);
        try {
            if (multiple) {
                const result = await api.uploadImages(filesToUpload, folder);
                const newUrls = [...images, ...result.urls];
                onChange(newUrls);
            } else {
                const result = await api.uploadImage(filesToUpload[0], folder);
                onChange(result.url);
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('画像のアップロードに失敗しました');
        } finally {
            setIsUploading(false);
        }
    }, [images, multiple, maxFiles, folder, onChange]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        handleFiles(e.dataTransfer.files);
    }, [handleFiles]);

    const removeImage = useCallback((index: number) => {
        if (multiple) {
            const newUrls = images.filter((_, i) => i !== index);
            onChange(newUrls);
        } else {
            onChange('');
        }
    }, [images, multiple, onChange]);

    const canAddMore = multiple ? images.length < maxFiles : images.length === 0;

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Preview area */}
            {images.length > 0 && (
                <div className={`grid gap-2 ${multiple ? 'grid-cols-3 md:grid-cols-5' : 'grid-cols-1'}`}>
                    {images.map((url, index) => (
                        <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                            <img
                                src={url}
                                alt={`Image ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload area */}
            {canAddMore && (
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`
                        relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                        ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}
                        ${isUploading ? 'pointer-events-none opacity-50' : ''}
                    `}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        multiple={multiple}
                        onChange={(e) => handleFiles(e.target.files)}
                        className="hidden"
                    />

                    {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            <p className="text-sm text-gray-500">アップロード中...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-3 bg-gray-100 rounded-full">
                                {images.length === 0 ? (
                                    <ImageIcon className="w-6 h-6 text-gray-400" />
                                ) : (
                                    <Upload className="w-6 h-6 text-gray-400" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">
                                    クリックまたはドラッグ&ドロップ
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    PNG, JPG, GIF (最大5MB)
                                    {multiple && ` • 最大${maxFiles}枚`}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
