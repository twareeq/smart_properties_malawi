'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useRouter } from 'next/navigation';
import { useProperty, useUpdateProperty, useUploadPropertyImage, useSetPrimaryPropertyImage } from '@/hooks/useProperties';
import { useToast } from '@/components/providers/ToastProvider';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, UploadCloud, X, ImagePlus, Trash2, MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import api from '@/lib/api';

const MapPreview = dynamic(() => import('@/components/MapPreview'), { 
  ssr: false,
  loading: () => <div className="h-[300px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center text-gray-400">Loading map...</div>
});

const schema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  pricePerNight: z.string().min(1),
  city: z.string().min(1),
  address: z.string().min(3),
  region: z.string().min(2),
  type: z.enum(['APARTMENT', 'HOUSE', 'VILLA', 'COMMERCIAL', 'LAND']),
  bedrooms: z.string().min(1),
  bathrooms: z.string().min(1),
  status: z.enum(['AVAILABLE', 'MAINTENANCE', 'RENTED', 'HIDDEN']),
  hasWiFi: z.boolean().default(false),
  hasPool: z.boolean().default(false),
  hasParking: z.boolean().default(false),
  isFurnished: z.boolean().default(false),
  hasSecurity: z.boolean().default(false),
  hasGarden: z.boolean().default(false),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  googleMapsUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
});

type EditPropertyForm = z.infer<typeof schema>;

const CITIES = ['Lilongwe', 'Blantyre', 'Zomba', 'Mangochi', 'Mzuzu', 'Salima', 'Karonga', 'Dedza', 'Liwonde'];
const TYPES = ['APARTMENT', 'HOUSE', 'VILLA', 'COMMERCIAL', 'LAND'];
const STATUSES = ['AVAILABLE', 'MAINTENANCE', 'RENTED', 'HIDDEN'];
const AMENITIES = [
  { key: 'hasWiFi', label: 'WiFi' },
  { key: 'hasPool', label: 'Swimming Pool' },
  { key: 'hasParking', label: 'Parking' },
  { key: 'isFurnished', label: 'Furnished' },
  { key: 'hasSecurity', label: 'Security' },
  { key: 'hasGarden', label: 'Garden' },
] as const;

export default function EditPropertyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data: property, isLoading } = useProperty(id);
  const { mutateAsync: updateProperty, isPending: saving } = useUpdateProperty(id);
  const { mutateAsync: uploadImage } = useUploadPropertyImage();
  const { mutateAsync: setPrimaryImage } = useSetPrimaryPropertyImage();

  // Existing images from DB
  const [existingImages, setExistingImages] = useState<{ id: string; secureUrl: string; thumbnailUrl?: string | null; isPrimary?: boolean }[]>([]);
  // New local file selections
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<EditPropertyForm>({
    resolver: zodResolver(schema),
  });

  const watchLat = watch('latitude');
  const watchLng = watch('longitude');

  // Parse Google Maps URL to extract coordinates
  const handleUrlParse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    if (!url) return;
    
    // Match common Google Maps URL coordinate patterns
    const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || url.match(/center=(-?\d+\.\d+),(-?\d+\.\d+)/);
    
    if (match && match[1] && match[2]) {
      setValue('latitude', match[1]);
      setValue('longitude', match[2]);
      addToast('Coordinates extracted from URL!', 'success');
    }
  };

  // Pre-fill form when property data loads
  useEffect(() => {
    if (property) {
      reset({
        title: property.title,
        description: property.description,
        pricePerNight: String(property.pricePerNight),
        city: property.city,
        address: property.address,
        region: property.region || '',
        type: property.type,
        bedrooms: String(property.bedrooms),
        bathrooms: String(property.bathrooms),
        status: property.status,
        hasWiFi: property.hasWiFi,
        hasPool: property.hasPool,
        hasParking: property.hasParking,
        isFurnished: property.isFurnished,
        hasSecurity: property.hasSecurity,
        hasGarden: property.hasGarden,
        latitude: property.latitude ? String(property.latitude) : '',
        longitude: property.longitude ? String(property.longitude) : '',
        googleMapsUrl: property.googleMapsUrl || '',
      });
      setExistingImages(property.images || []);
    }
  }, [property, reset]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length + newFiles.length + files.length;
    if (totalImages > 8) {
      addToast('Maximum 8 images per property.', 'error');
      return;
    }
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setNewFiles(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeNewFile = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const deleteExistingImage = async (imageId: string) => {
    if (!confirm('Remove this photo?')) return;
    try {
      setDeletingImageId(imageId);
      await api.delete(`/uploads/property-image/${imageId}`);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      queryClient.invalidateQueries({ queryKey: ['property', id] });
      queryClient.invalidateQueries({ queryKey: ['myProperties'] });
      addToast('Photo removed.', 'success');
    } catch {
      addToast('Failed to remove photo.', 'error');
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      setDeletingImageId(imageId); // Reuse loading state string for visual feedback
      await setPrimaryImage(imageId);
      
      // Update local state optimistic UI
      setExistingImages(prev => prev.map(img => ({
        ...img,
        isPrimary: img.id === imageId
      })));
      
      queryClient.invalidateQueries({ queryKey: ['property', id] });
      queryClient.invalidateQueries({ queryKey: ['myProperties'] });
      addToast('Cover photo updated.', 'success');
    } catch {
      addToast('Failed to set cover photo.', 'error');
    } finally {
      setDeletingImageId(null);
    }
  };

  const onSubmit = async (data: EditPropertyForm) => {
    try {
      const payload: any = {
        ...data,
        pricePerNight: parseFloat(data.pricePerNight),
        bedrooms: parseInt(data.bedrooms),
        bathrooms: parseInt(data.bathrooms),
      };

      if (data.latitude) payload.latitude = parseFloat(data.latitude);
      if (data.longitude) payload.longitude = parseFloat(data.longitude);
      if (data.googleMapsUrl) payload.googleMapsUrl = data.googleMapsUrl;

      await updateProperty(payload);

      if (newFiles.length > 0) {
        setUploading(true);
        await Promise.all(newFiles.map(file => uploadImage({ propertyId: id, file })));
        setUploading(false);
      }

      queryClient.invalidateQueries({ queryKey: ['myProperties'] });
      queryClient.invalidateQueries({ queryKey: ['property', id] });
      addToast('Property updated successfully!', 'success');
      router.push('/admin/properties');
    } catch (err: any) {
      setUploading(false);
      addToast(err?.response?.data?.message || 'Failed to update property.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Property not found.</p>
        <Button className="mt-4" onClick={() => router.push('/admin/properties')}>Back to Properties</Button>
      </div>
    );
  }

  const isSubmitting = saving || uploading;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/properties')}>←</Button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Property</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Property Title *</Label>
              <Input {...register('title')} />
              {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Description *</Label>
              <Textarea rows={4} {...register('description')} />
              {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Property Type *</Label>
                <Select {...register('type')}>
                  {TYPES.map(t => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select {...register('status')}>
                  {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Price per Night (MWK) *</Label>
              <Input type="number" {...register('pricePerNight')} />
              {errors.pricePerNight && <p className="text-red-500 text-xs">Required</p>}
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle>Location</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>City *</Label>
              <Select {...register('city')}>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Street Address *</Label>
              <Input {...register('address')} />
              {errors.address && <p className="text-red-500 text-xs">{errors.address.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Region *</Label>
              <Input {...register('region')} />
              {errors.region && <p className="text-red-500 text-xs">{errors.region.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Rooms & Amenities */}
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle>Rooms & Amenities</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Bedrooms *</Label>
                <Input type="number" min="0" {...register('bedrooms')} />
              </div>
              <div className="space-y-1">
                <Label>Bathrooms *</Label>
                <Input type="number" min="0" {...register('bathrooms')} />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AMENITIES.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 text-sm">
                  <input type="checkbox" {...register(key)} className="rounded" />
                  {label}
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Map Location ─────────────────────────────────────── */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Map Location
            </CardTitle>
            <CardDescription>Enter coordinates directly or paste a Google Maps URL to auto-fill.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Google Maps URL (Optional)</Label>
                <Input placeholder="https://www.google.com/maps/..." {...register('googleMapsUrl')} onChange={(e) => {
                  register('googleMapsUrl').onChange(e);
                  handleUrlParse(e);
                }} />
                {errors.googleMapsUrl && <p className="text-red-500 text-xs">{errors.googleMapsUrl.message}</p>}
                <p className="text-xs text-gray-500 mt-1">Paste a link to extract coordinates automatically.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Latitude</Label>
                  <Input placeholder="e.g. -13.962612" {...register('latitude')} />
                  {errors.latitude && <p className="text-red-500 text-xs">{errors.latitude.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label>Longitude</Label>
                  <Input placeholder="e.g. 33.774119" {...register('longitude')} />
                  {errors.longitude && <p className="text-red-500 text-xs">{errors.longitude.message}</p>}
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-100">
                <strong>How to find coordinates:</strong>
                <ol className="list-decimal ml-4 mt-1 space-y-1">
                  <li>Open Google Maps and find the property.</li>
                  <li>Right-click the exact location on the map.</li>
                  <li>Click the coordinates at the top of the menu to copy them.</li>
                  <li>Paste the first number into Latitude, and the second into Longitude.</li>
                </ol>
              </div>
            </div>

            {/* Map Preview */}
            {watchLat && watchLng && !isNaN(parseFloat(watchLat)) && !isNaN(parseFloat(watchLng)) ? (
              <div className="mt-4">
                <Label className="mb-2 block">Live Map Preview</Label>
                <MapPreview 
                  latitude={parseFloat(watchLat)} 
                  longitude={parseFloat(watchLng)} 
                  height="300px" 
                />
              </div>
            ) : (
              <div className="h-[200px] border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 mt-4">
                Enter valid coordinates to see preview
              </div>
            )}
          </CardContent>
        </Card>

        {/* Photo Management */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImagePlus className="w-5 h-5" />
              Property Photos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing images */}
            {existingImages.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium">Current Photos (Click ★ to set Cover)</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {existingImages.map((img, i) => (
                    <div key={img.id} className="relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.thumbnailUrl || img.secureUrl} alt={`img-${i}`} className="w-full h-24 object-cover rounded-lg border" />
                      
                      {/* Cover Badge or Set Cover Button */}
                      {img.isPrimary ? (
                        <span className="absolute bottom-1 left-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10">Cover</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(img.id)}
                          title="Set as Cover Photo"
                          className="absolute bottom-1 left-1 bg-gray-900/60 hover:bg-primary text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
                        >
                          ★ Set Cover
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => deleteExistingImage(img.id)}
                        disabled={deletingImageId === img.id}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 disabled:opacity-50"
                      >
                        {deletingImageId === img.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New image previews */}
            {previews.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium">New Photos to Upload</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {previews.map((src, i) => (
                    <div key={i} className="relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`new-${i}`} className="w-full h-20 object-cover rounded-lg border-2 border-dashed border-blue-300" />
                      <button
                        type="button"
                        onClick={() => removeNewFile(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload trigger */}
            {existingImages.length + newFiles.length < 8 && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <UploadCloud className="w-7 h-7 text-gray-400" />
                <p className="text-sm text-gray-500">Click to add more photos</p>
                <p className="text-xs text-gray-400">Max 8 photos total</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting} className="flex-1 h-12">
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {uploading ? 'Uploading photos...' : 'Saving...'}
              </>
            ) : 'Save Changes'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/admin/properties')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
