'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useCreateProperty, useUploadPropertyImage } from '@/hooks/useProperties';
import { useToast } from '@/components/providers/ToastProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UploadCloud, X, ImagePlus } from 'lucide-react';

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
  hasWiFi: z.boolean().default(false),
  hasPool: z.boolean().default(false),
  hasParking: z.boolean().default(false),
  isFurnished: z.boolean().default(false),
  hasSecurity: z.boolean().default(false),
  hasGarden: z.boolean().default(false),
});

type CreatePropertyForm = z.infer<typeof schema>;

const CITIES = ['Lilongwe', 'Blantyre', 'Zomba', 'Mangochi', 'Mzuzu', 'Salima', 'Karonga', 'Dedza', 'Liwonde'];
const TYPES = ['APARTMENT', 'HOUSE', 'VILLA', 'COMMERCIAL', 'LAND'];
const AMENITIES = [
  { key: 'hasWiFi', label: 'WiFi' },
  { key: 'hasPool', label: 'Swimming Pool' },
  { key: 'hasParking', label: 'Parking' },
  { key: 'isFurnished', label: 'Furnished' },
  { key: 'hasSecurity', label: 'Security' },
  { key: 'hasGarden', label: 'Garden' },
] as const;

export default function CreatePropertyPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { mutateAsync: createProperty, isPending } = useCreateProperty();
  const { mutateAsync: uploadImage } = useUploadPropertyImage();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<CreatePropertyForm>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'APARTMENT', hasWiFi: false, hasPool: false, hasParking: false, isFurnished: false, hasSecurity: false, hasGarden: false },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (selectedFiles.length + files.length > 5) {
      addToast('You can upload up to 5 images.', 'error');
      return;
    }
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setSelectedFiles(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const onSubmit = async (data: CreatePropertyForm) => {
    try {
      // 1. Create the property first
      const res = await createProperty({
        ...data,
        pricePerNight: parseFloat(data.pricePerNight),
        bedrooms: parseInt(data.bedrooms),
        bathrooms: parseInt(data.bathrooms),
      });

      const propertyId = res.data?.data?.id;

      // 2. Upload images if any were selected
      if (propertyId && selectedFiles.length > 0) {
        setUploading(true);
        await Promise.all(
          selectedFiles.map(file => uploadImage({ propertyId, file }))
        );
        setUploading(false);
      }

      addToast('Property created successfully!', 'success');
      router.push('/admin/properties');
    } catch (err: any) {
      setUploading(false);
      addToast(err?.response?.data?.message || 'Failed to create property.', 'error');
    }
  };

  const isSubmitting = isPending || uploading;

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">Add New Property</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Property Title *</Label>
              <Input placeholder="e.g. Luxury 3-Bedroom Villa" {...register('title')} />
              {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Description *</Label>
              <Textarea rows={4} placeholder="Describe the property in detail..." {...register('description')} />
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
                <Label>Price per Night (MWK) *</Label>
                <Input type="number" placeholder="e.g. 85000" {...register('pricePerNight')} />
                {errors.pricePerNight && <p className="text-red-500 text-xs">Required</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle>Location</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>City *</Label>
              <Select {...register('city')}>
                <option value="">Select City</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Street Address *</Label>
              <Input placeholder="e.g. Area 10, Near ..." {...register('address')} />
              {errors.address && <p className="text-red-500 text-xs">{errors.address.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Region *</Label>
              <Input placeholder="e.g. Central Region" {...register('region')} />
              {errors.region && <p className="text-red-500 text-xs">{errors.region.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle>Rooms & Amenities</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Bedrooms *</Label>
                <Input type="number" min="0" placeholder="e.g. 3" {...register('bedrooms')} />
              </div>
              <div className="space-y-1">
                <Label>Bathrooms *</Label>
                <Input type="number" min="0" placeholder="e.g. 2" {...register('bathrooms')} />
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

        {/* ── Photo Upload ─────────────────────────────────────── */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImagePlus className="w-5 h-5" />
              Property Photos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`preview-${i}`} className="w-full h-20 object-cover rounded-lg border" />
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 bg-primary text-white text-[10px] px-1 rounded">Cover</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Trigger */}
            {selectedFiles.length < 5 && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <UploadCloud className="w-8 h-8 text-gray-400" />
                <p className="text-sm text-gray-500">Click to upload photos</p>
                <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 10MB each · Max 5 photos</p>
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
                {uploading ? 'Uploading photos...' : 'Creating...'}
              </>
            ) : 'Create Property'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
