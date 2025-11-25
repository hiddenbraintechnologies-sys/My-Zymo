import { useRef } from "react";
import type { ReactNode, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";

interface FileInfo {
  name: string;
  type: string;
  size: number;
  objectPath: string;
}

interface ObjectUploaderProps {
  maxFileSize?: number;
  allowedFileTypes?: string[];
  onGetUploadParameters: (file: { name: string; type: string; size: number }) => Promise<{
    method: "PUT";
    url: string;
    objectPath: string;
  }>;
  onComplete?: (file: FileInfo) => void;
  onError?: (error: Error) => void;
  buttonClassName?: string;
  buttonVariant?: "default" | "outline" | "ghost" | "secondary" | "destructive";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  children: ReactNode;
  disabled?: boolean;
  isUploading?: boolean;
}

export function ObjectUploader({
  maxFileSize = 10485760,
  allowedFileTypes,
  onGetUploadParameters,
  onComplete,
  onError,
  buttonClassName,
  buttonVariant = "ghost",
  buttonSize = "icon",
  children,
  disabled = false,
  isUploading = false,
}: ObjectUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > maxFileSize) {
      onError?.(new Error(`File size exceeds ${Math.round(maxFileSize / 1024 / 1024)}MB limit`));
      return;
    }

    if (allowedFileTypes && allowedFileTypes.length > 0) {
      const isAllowed = allowedFileTypes.some(type => {
        if (type.endsWith('/*')) {
          const category = type.replace('/*', '');
          return file.type.startsWith(category);
        }
        return file.type === type;
      });
      if (!isAllowed) {
        onError?.(new Error('File type not allowed'));
        return;
      }
    }

    try {
      const params = await onGetUploadParameters({
        name: file.name,
        type: file.type,
        size: file.size,
      });

      const response = await fetch(params.url, {
        method: params.method,
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      onComplete?.({
        name: file.name,
        type: file.type,
        size: file.size,
        objectPath: params.objectPath,
      });
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Upload failed'));
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={allowedFileTypes?.join(',')}
        style={{ display: 'none' }}
        data-testid="input-file-upload"
      />
      <Button 
        onClick={handleButtonClick}
        className={buttonClassName}
        variant={buttonVariant}
        size={buttonSize}
        disabled={disabled || isUploading}
        type="button"
        data-testid="button-file-upload"
      >
        {children}
      </Button>
    </>
  );
}
