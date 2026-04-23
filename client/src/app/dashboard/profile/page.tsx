'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import { useUpdateProfile, useUpdateAvatar } from '@/hooks/useAuth';
import { useToast } from '@/components/providers/ToastProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Camera } from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, fetchUser } = useAuthStore();
  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile();
  const { mutateAsync: updateAvatar, isPending: isUpdatingAvatar } = useUpdateAvatar();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    // Ensure we fetch latest user profile to remove placeholder data
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user?.profile) {
      reset({
        firstName: user.profile.firstName || '',
        lastName: user.profile.lastName || '',
        phone: user.profile.phone || '',
        bio: user.profile.bio || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileForm) => {
    try {
      await updateProfile(data);
      addToast('Profile updated successfully!', 'success');
      fetchUser(); // Refresh user profile in store
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Failed to update profile.', 'error');
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size should be less than 5MB', 'error');
      return;
    }

    try {
      await updateAvatar(file);
      addToast('Profile picture updated!', 'success');
      fetchUser(); // Refresh user profile in store
    } catch (err: any) {
      addToast('Failed to upload profile picture', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div 
              className="relative w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl font-bold cursor-pointer group"
              onClick={handleAvatarClick}
            >
              {isUpdatingAvatar ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : user?.profile?.avatarUrl ? (
                <>
                  <img src={user.profile.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover transition-opacity group-hover:opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </>
              ) : (
                <>
                  <span className="group-hover:opacity-20 transition-opacity">
                    {user?.email?.[0]?.toUpperCase() || <User className="w-10 h-10" />}
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6" />
                  </div>
                </>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
            </div>
            <div>
              <CardTitle>{user?.profile?.firstName} {user?.profile?.lastName}</CardTitle>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <p className="text-gray-400 text-sm capitalize">{user?.role?.toLowerCase()} account</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>First Name</Label>
                <Input placeholder="John" {...register('firstName')} />
                {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Last Name</Label>
                <Input placeholder="Banda" {...register('lastName')} />
                {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName.message}</p>}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Phone Number</Label>
              <Input type="tel" placeholder="+265 999 000 000" {...register('phone')} />
            </div>
            <div className="space-y-1">
              <Label>Bio</Label>
              <Textarea placeholder="Short bio about yourself..." {...register('bio')} />
            </div>
            <Button type="submit" disabled={isUpdatingProfile}>
              {isUpdatingProfile ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle>Account Security</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">Email: <span className="font-medium text-gray-800">{user?.email}</span></p>
          <Button variant="outline">Change Password</Button>
        </CardContent>
      </Card>
    </div>
  );
}
