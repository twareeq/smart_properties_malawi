import { v2 as cloudinary } from 'cloudinary';
import { config } from './env';

cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
});

export { cloudinary };

/**
 * Generates an authentication signature for frontend direct uploads
 */
export const generateCloudinarySignature = (folder: string = 'smart_properties_malawi/properties') => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder,
    },
    config.cloudinaryApiSecret
  );

  return {
    signature,
    timestamp,
    cloudName: config.cloudinaryCloudName,
    apiKey: config.cloudinaryApiKey,
    folder,
  };
};

/**
 * Safely removes an image from Cloudinary by its public ID
 */
export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
};
