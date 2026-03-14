import api from '../api';

export interface PropertyFilters {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  type?: string;
  bedrooms?: number;
  hasWiFi?: boolean;
  hasPool?: boolean;
}

export const propertyService = {
  getProperties: (filters: PropertyFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') params.set(key, String(val));
    });
    return api.get(`/properties?${params.toString()}`);
  },
  getPropertyById: (id: string) => api.get(`/properties/${id}`),
  getMyProperties: () => api.get('/properties/my/listings'),
  createProperty: (data: any) => api.post('/properties', data),
  updateProperty: (id: string, data: any) => api.put(`/properties/${id}`, data),
  deleteProperty: (id: string) => api.delete(`/properties/${id}`),
  uploadPropertyImage: async (propertyId: string, file: File) => {
    // 1. Get signature from backend
    const sigRes = await api.get('/uploads/signature');
    const { signature, timestamp, cloudName, apiKey, folder } = sigRes.data.data;

    // 2. Upload to Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('signature', signature);
    formData.append('timestamp', String(timestamp));
    formData.append('api_key', apiKey);
    formData.append('folder', folder);

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!uploadRes.ok) {
      throw new Error('Cloudinary upload failed');
    }
    const cloudData = await uploadRes.json();

    // 3. Save metadata to backend
    return api.post('/uploads/property-image', {
      propertyId,
      publicId: cloudData.public_id,
      secureUrl: cloudData.secure_url,
      format: cloudData.format,
      width: cloudData.width,
      height: cloudData.height,
      bytes: cloudData.bytes,
      resourceType: cloudData.resource_type,
    });
  },
  deletePropertyImage: (imageId: string) => api.delete(`/uploads/property-image/${imageId}`),
  setPrimaryPropertyImage: (imageId: string) => api.patch(`/uploads/property-image/${imageId}/primary`),
};

