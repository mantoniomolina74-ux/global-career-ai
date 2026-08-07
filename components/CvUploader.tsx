"use client";

import { ChangeEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export interface CvUploaderUser {
  id: string;
}

interface CvUploaderProps {
  user: CvUploaderUser | null;
}

export default function CvUploader({ user }: CvUploaderProps) {
  const supabase = createSupabaseBrowserClient();
  const [uploading, setUploading] = useState(false);
  const [cvName, setCvName] = useState("");

  const uploadCV = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file || !user) {
      return;
    }

    setUploading(true);

    const filePath = `${user.id}/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("cvs")
      .upload(filePath, file);

    if (error) {
      alert(JSON.stringify(error));
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("cvs")
      .getPublicUrl(filePath);

    await supabase.from("cvs").insert([
      {
        user_id: user.id,
        file_name: file.name,
        file_url: data.publicUrl,
      },
    ]);

    setCvName(file.name);
    setUploading(false);
  };

  return (
    <div className="border p-4 rounded mb-4">
      <h2 className="font-semibold mb-2">CV Maestro</h2>

      <input type="file" onChange={uploadCV} />

      {uploading && <p>Subiendo...</p>}

      {cvName && <p>CV: {cvName}</p>}
    </div>
  );
}