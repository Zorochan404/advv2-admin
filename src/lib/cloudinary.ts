import { getCloudinaryUrl } from './urls'

interface CloudinaryResponse {
  public_id: string
  secure_url: string
  url: string
  width: number
  height: number
  format: string
  resource_type: string
}

interface UploadResponse {
  success: boolean
  data?: CloudinaryResponse
  error?: string
}


export async function uploadFileToCloudinary(
  file: File,
  folder: string = 'car-rental'
): Promise<UploadResponse> {
  try {
    // Create FormData
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '')
    formData.append('cloud_name', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '')
    formData.append('folder', folder)

    // Upload to Cloudinary
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ''
    const response = await fetch(
      getCloudinaryUrl(cloudName),
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    const data: CloudinaryResponse = await response.json()

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

export async function uploadMultipleFilesToCloudinary(
  files: File[],
  folder: string = 'car-rental'
): Promise<UploadResponse[]> {
  const uploadPromises = files.map(file => uploadFileToCloudinary(file, folder))
  return Promise.all(uploadPromises)
}

// Backward compatibility aliases
export const uploadImageToCloudinary = uploadFileToCloudinary
export const uploadMultipleImagesToCloudinary = uploadMultipleFilesToCloudinary

// Helper function to validate file type (images and PDFs)
export function validateImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!validTypes.includes(file.type)) {
    return false
  }

  if (file.size > maxSize) {
    return false
  }

  return true
}

// Helper function to validate only image files
export function validateImageOnlyFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!validTypes.includes(file.type)) {
    return false
  }

  if (file.size > maxSize) {
    return false
  }

  return true
}

// Helper function to get file extension
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
} 