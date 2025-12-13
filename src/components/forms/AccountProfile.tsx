"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { UserValidation } from "@/lib/validations/user";
import { z } from "zod";
import Image from "next/image";
import { ChangeEvent, useState } from "react";
import { Textarea } from "../ui/textarea";
import { isBase64Image } from "@/lib/utils";
import { useUploadThing } from "@/lib/uploadthing";
import { updateUser } from "@/lib/actions/user.actions";
import { usePathname, useRouter } from "next/navigation";
import { Upload, Loader2, User, AtSign, FileText } from "lucide-react";

interface Props {
  user: {
    id: string;
    objectId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
  };
  btnTitle: string;
}

export default function AccountProfile({ user, btnTitle }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { startUpload } = useUploadThing("media");
  
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(UserValidation),
    defaultValues: {
      profile_photo: user?.image || "",
      name: user?.name || "",
      username: user?.username || "",
      bio: user?.bio || ""
    }
  });

  const handleImage = (e: ChangeEvent<HTMLInputElement>, fieldChange: (value: string) => void) => {
    e.preventDefault();
    const fileReader = new FileReader();

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFiles(Array.from(e.target.files));

      if (!file.type.includes('image')) {
        return;
      }

      fileReader.onload = async (event) => {
        const imageDataUrl = event.target?.result?.toString() || '';
        fieldChange(imageDataUrl);
      }
      fileReader.readAsDataURL(file);
    }
  }

  async function onSubmit(values: z.infer<typeof UserValidation>) {
    setIsSubmitting(true);
    
    try {
      const blob = values.profile_photo;
      const hasImageChanged = isBase64Image(blob);

      if (hasImageChanged) {
        const imgRes = await startUpload(files);

        if (imgRes && imgRes[0].url) {
          values.profile_photo = imgRes[0].url;
        }
      }

      await updateUser({
        username: values.username,
        name: values.name,
        bio: values.bio,
        image: values.profile_photo,
        userId: user.id,
        path: pathname
      });

      if (pathname === '/profile/edit') {
        router.back();
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="space-y-8 bg-dark-2 rounded-2xl p-8 shadow-xl border border-dark-4">
        {/* Header */}
        <div className="text-center pb-4 border-b border-dark-4">
          <h2 className="text-2xl font-bold text-light-1">Profile Settings</h2>
          <p className="text-sm text-gray-400 mt-1">Update your account information</p>
        </div>

        {/* Profile Photo */}
        <Controller
          control={control}
          name="profile_photo"
          render={({ field }) => (
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-primary-500/20 transition-all group-hover:ring-primary-500/40">
                  {field.value ? (
                    <Image 
                      src={field.value} 
                      alt="profile photo" 
                      width={128} 
                      height={128} 
                      priority 
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-dark-3 flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <label className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-dark-3 hover:bg-dark-4 rounded-lg transition-colors border border-dark-4">
                  <Upload className="w-4 h-4 text-primary-500" />
                  <span className="text-sm text-light-2">Upload Photo</span>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImage(e, field.onChange)}
                  disabled={isSubmitting}
                />
              </label>
              {errors.profile_photo && (
                <p className="text-sm text-red-500">{errors.profile_photo.message}</p>
              )}
            </div>
          )}
        />

        {/* Name Field */}
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-light-1 font-semibold">
                <User className="w-4 h-4 text-primary-500" />
                Name
              </label>
              <Input
                type="text"
                placeholder="Enter your full name"
                className="bg-dark-3 border-dark-4 text-light-1 placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all h-12 rounded-lg"
                disabled={isSubmitting}
                {...field}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
          )}
        />

        {/* Username Field */}
        <Controller
          control={control}
          name="username"
          render={({ field }) => (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-light-1 font-semibold">
                <AtSign className="w-4 h-4 text-primary-500" />
                Username
              </label>
              <Input
                type="text"
                placeholder="Choose a unique username"
                className="bg-dark-3 border-dark-4 text-light-1 placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all h-12 rounded-lg"
                disabled={isSubmitting}
                {...field}
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>
          )}
        />

        {/* Bio Field */}
        <Controller
          control={control}
          name="bio"
          render={({ field }) => (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-light-1 font-semibold">
                <FileText className="w-4 h-4 text-primary-500" />
                Bio
              </label>
              <Textarea
                rows={5}
                placeholder="Tell us about yourself..."
                className="bg-dark-3 border-dark-4 text-light-1 placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all rounded-lg resize-none"
                disabled={isSubmitting}
                {...field}
              />
              <p className="text-xs text-gray-500">{field.value?.length || 0} characters</p>
              {errors.bio && (
                <p className="text-sm text-red-500">{errors.bio.message}</p>
              )}
            </div>
          )}
        />

        {/* Submit Button */}
        <Button 
          type="button"
          onClick={handleSubmit(onSubmit)}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold h-12 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving Changes...
            </span>
          ) : (
            btnTitle || "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}