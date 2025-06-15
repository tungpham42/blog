"use client";

import { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import type { ToolConstructable, OutputData } from "@editorjs/editorjs";
import ImageToolImport from "@editorjs/image";
import RawToolImport from "@editorjs/raw";
import EmbedImport from "@editorjs/embed";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";
import "@/styles/editor.css";

const ImageTool = ImageToolImport as ToolConstructable;
const Embed = EmbedImport as ToolConstructable;
const RawTool = RawToolImport as ToolConstructable;

type EditorComponentProps = {
  onChange?: (data: OutputData) => void; // make optional
  initialData?: OutputData | null;
  readOnly?: boolean;
};

export default function EditorComponent({
  onChange,
  initialData,
  readOnly = false,
}: EditorComponentProps) {
  const editorRef = useRef<EditorJS | null>(null);

  useEffect(() => {
    if (!editorRef.current) {
      const editor = new EditorJS({
        holder: "editorjs",
        data: initialData ?? undefined,
        autofocus: !readOnly,
        readOnly: readOnly,
        onChange: async () => {
          if (onChange) {
            const savedData = await editor.save();
            onChange(savedData);
          }
        },
        tools: {
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  const url = await uploadToCloudinary(file);
                  return {
                    success: 1,
                    file: { url },
                  };
                },
              },
            },
          },
          embed: Embed,
          raw: RawTool,
          header: Header,
          list: List,
          quote: Quote,
        },
      });

      editorRef.current = editor;
    }

    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
    }; // eslint-disable-next-line
  }, []);

  return (
    <div className="editor-wrapper">
      <div id="editorjs" />
    </div>
  );
}

// Upload file to Cloudinary
async function uploadToCloudinary(file: File): Promise<string> {
  const CLOUD_NAME = "filecuatui";
  const UPLOAD_PRESET = "tung-blog";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();
  return data.secure_url;
}
