'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { propertyService, PropertyFilters } from '@/lib/services/property.service';

export function useProperties(filters: PropertyFilters = {}) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => propertyService.getProperties(filters).then((r) => r.data),
  });
}

export function useMyProperties() {
  return useQuery({
    queryKey: ['myProperties'],
    queryFn: () => propertyService.getMyProperties().then((r) => r.data),
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyService.getPropertyById(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useCreateProperty() {
  return useMutation({
    mutationFn: (data: any) => propertyService.createProperty(data),
  });
}

export function useUpdateProperty(id: string) {
  return useMutation({
    mutationFn: (data: any) => propertyService.updateProperty(id, data),
  });
}

export function useDeleteProperty() {
  return useMutation({
    mutationFn: (id: string) => propertyService.deleteProperty(id),
  });
}

export function useUploadPropertyImage() {
  return useMutation({
    mutationFn: ({ propertyId, file }: { propertyId: string; file: File }) =>
      propertyService.uploadPropertyImage(propertyId, file),
  });
}

export function useDeletePropertyImage() {
  return useMutation({
    mutationFn: (imageId: string) => propertyService.deletePropertyImage(imageId),
  });
}
