'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import { useUpdateProfile } from '@/hooks/useAuth';
import { useToast } from '@/components/providers/ToastProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User } from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, fetchUser } = useAuthStore();
  const { mutateAsync, isPending } = useUpdateProfile();
  const { addToast } = useToast();

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
      await mutateAsync(data);
      addToast('Profile updated successfully!', 'success');
      fetchUser(); // Refresh user profile in store
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Failed to update profile.', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl font-bold">
              {user?.profile?.avatarUrl ? (
                <img src={user.profile.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                user?.email?.[0]?.toUpperCase() || <User className="w-8 h-8" />
              )}
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
            <Button type="submit" disabled={isPending}>
              {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Changes'}
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
