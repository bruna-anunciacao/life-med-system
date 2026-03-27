"use client";

import styles from "../profile.module.css";

type ProfileAvatarProps = {
  name: string;
  photoUrl: string | null;
  previewUrl: string | null;
  isEditing: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function ProfileAvatar({ name, photoUrl, previewUrl, isEditing, onFileChange }: ProfileAvatarProps) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  let currentPhoto = previewUrl;

  if (!currentPhoto && photoUrl) {
    currentPhoto = photoUrl.startsWith("http") ? photoUrl : `${apiBaseUrl}${photoUrl}`;
  }

  if (currentPhoto) {
    return (
      <div className="relative group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentPhoto}
          alt={name}
          className={`${styles.avatar} object-cover rounded-full`}
          style={{ width: "70px", height: "70px" }}
        />
        {isEditing && (
          <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-xs font-bold">Trocar</span>
            <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
          </label>
        )}
      </div>
    );
  }

  return (
    <label className="relative cursor-pointer">
      <div className={styles.avatarNoPhoto}>{name.charAt(0).toUpperCase()}</div>
      {isEditing && (
        <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
      )}
    </label>
  );
}
