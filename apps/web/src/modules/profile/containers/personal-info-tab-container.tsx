"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import type { AuthUser } from "@/types";

import { PersonalInfoForm } from "../components/personal-info-form";
import { ProfileAvatarCard } from "../components/profile-avatar-card";
import { useUpdateProfile } from "../hooks/use-update-profile";
import {
  mapPersonalInfoFormToDto,
  mapUserToPersonalInfoFormValues,
} from "../mappers/profile-form.mapper";
import {
  type UpdateProfileSchema,
  updateProfileSchema,
} from "../schemas/profile.schema";

interface PersonalInfoTabContainerProps {
  user: AuthUser;
}

export function PersonalInfoTabContainer({
  user,
}: PersonalInfoTabContainerProps) {
  const { control, handleSubmit } = useForm<UpdateProfileSchema>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: mapUserToPersonalInfoFormValues(user),
  });

  const updateMutation = useUpdateProfile();

  const onSubmit = async (data: UpdateProfileSchema) => {
    await updateMutation.mutateAsync(mapPersonalInfoFormToDto(data));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <ProfileAvatarCard user={user} />
      <PersonalInfoForm
        email={user.email}
        control={control}
        isSubmitting={updateMutation.isPending}
        onSubmit={handleSubmit(onSubmit)}
      />
    </div>
  );
}
