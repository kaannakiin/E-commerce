"use client";
import {
  Link,
  RichTextEditor,
  useRichTextEditorContext,
} from "@mantine/tiptap";
import "@mantine/tiptap/styles.css";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import SubScript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { BubbleMenu, FloatingMenu, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import ImageGallery from "./ImageGallery";
import ImageResize from "tiptap-extension-resize-image";

const EditorContent = ({
  content,
  onChange,
  isWithImage = false,
}: {
  content: string | null;
  onChange: (value: string | null) => void;
  isWithImage?: boolean;
}) => {
  const editor = useEditor({
    immediatelyRender: false,
    content: content || "",
    onUpdate: ({ editor }) => {
      onChange(editor.isEmpty ? null : editor.getHTML());
    },
    extensions: [
      StarterKit,
      Underline,
      Link,
      Superscript,
      SubScript,
      Highlight,
      ImageResize.configure({
        inline: true,
        allowBase64: true,
      }),
      Image.configure({
        inline: true, // Bunu true yapıyoruz ki yanına yazı yazılabilsin
        allowBase64: true,
        HTMLAttributes: {
          class: "inline-block resize-image", // inline-block kullanıyoruz
          style: "display: inline-block; margin: 0 4px;", // Temel stil ayarları
        },
      }),
      TextAlign.configure({ types: ["heading", "paragraph", "image"] }), // image'i de ekledik
      Placeholder.configure({
        placeholder: "Dilediğiniz gibi yazabilirsiniz.",
      }),
    ],
  });

  return (
    <RichTextEditor
      className="h-full"
      variant="subtle"
      editor={editor}
      labels={{
        boldControlLabel: "Kalın",
        italicControlLabel: "İtalik",
        underlineControlLabel: "Altı çizili",
        strikeControlLabel: "Üstü çizili",
        clearFormattingControlLabel: "Formatlamayı temizle",
        highlightControlLabel: "Vurgula",
        codeControlLabel: "Kod",

        // Başlıklar
        h1ControlLabel: "Başlık 1",
        h2ControlLabel: "Başlık 2",
        h3ControlLabel: "Başlık 3",
        h4ControlLabel: "Başlık 4",
        h5ControlLabel: "Başlık 5",
        h6ControlLabel: "Başlık 6",

        // Liste ve blok elementleri
        blockquoteControlLabel: "Alıntı",
        hrControlLabel: "Yatay çizgi",
        bulletListControlLabel: "Madde işaretli liste",
        orderedListControlLabel: "Numaralı liste",
        subscriptControlLabel: "Alt simge",
        superscriptControlLabel: "Üst simge",

        // Link kontrolleri
        linkControlLabel: "Bağlantı ekle",
        unlinkControlLabel: "Bağlantıyı kaldır",

        // Hizalama kontrolleri
        alignLeftControlLabel: "Sola hizala",
        alignCenterControlLabel: "Ortala",
        alignJustifyControlLabel: "İki yana yasla",
        alignRightControlLabel: "Sağa hizala",

        // Geri alma kontrolleri
        undoControlLabel: "Geri al",
        redoControlLabel: "İleri al",

        // Link düzenleme modalı
        linkEditorInputLabel: "Bağlantı URL",
        linkEditorInputPlaceholder: "https://ornek.com",
        linkEditorExternalLink: "Yeni sekmede aç",
        linkEditorSave: "Kaydet",
      }}
    >
      <RichTextEditor.Toolbar sticky stickyOffset={60}>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Underline />
          <RichTextEditor.Strikethrough />
          <RichTextEditor.ClearFormatting />
          <RichTextEditor.Highlight />
          <RichTextEditor.Code />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.H1 />
          <RichTextEditor.H2 />
          <RichTextEditor.H3 />
          <RichTextEditor.H4 />
          <RichTextEditor.H5 />
          <RichTextEditor.H6 />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Blockquote />
          <RichTextEditor.Hr />
          <RichTextEditor.BulletList />
          <RichTextEditor.OrderedList />
          <RichTextEditor.Subscript />
          <RichTextEditor.Superscript />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Link />
          <RichTextEditor.Unlink />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.AlignLeft />
          <RichTextEditor.AlignCenter />
          <RichTextEditor.AlignJustify />
          <RichTextEditor.AlignRight />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Undo />
          <RichTextEditor.Redo />
        </RichTextEditor.ControlsGroup>
        {isWithImage && (
          <RichTextEditor.ControlsGroup>
            <InsterTheImageControl />
          </RichTextEditor.ControlsGroup>
        )}
      </RichTextEditor.Toolbar>
      {editor && (
        <BubbleMenu
          editor={editor}
          shouldShow={({ editor, state, from, to }) => {
            const isImage = editor.isActive("image");

            return !isImage && from !== to;
          }}
        >
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Underline />
            <RichTextEditor.Link />
            <RichTextEditor.Unlink />
            <RichTextEditor.ClearFormatting />
            <RichTextEditor.Highlight />
            <RichTextEditor.Code />
            <RichTextEditor.Subscript />
            <RichTextEditor.Superscript />
          </RichTextEditor.ControlsGroup>
        </BubbleMenu>
      )}
      {editor && (
        <FloatingMenu editor={editor}>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H1 />
            <RichTextEditor.H2 />
            <RichTextEditor.H3 />
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
            <RichTextEditor.Blockquote />
            <RichTextEditor.AlignLeft />
            <RichTextEditor.AlignCenter />
            <RichTextEditor.AlignRight />
          </RichTextEditor.ControlsGroup>
        </FloatingMenu>
      )}
      <RichTextEditor.Content className="min-h-[50vh]" />
    </RichTextEditor>
  );
};

interface ControlledRichEditorProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
}

function InsterTheImageControl() {
  const { editor } = useRichTextEditorContext();
  const handleImageSelect = (imageSrc: string) => {
    editor
      ?.chain()
      .focus()
      .setImage({ src: imageSrc, alt: "rich-text-images" })
      .run();
  };

  return (
    <RichTextEditor.Control title="Resim Ekle">
      <ImageGallery onImageSelect={handleImageSelect} />
    </RichTextEditor.Control>
  );
}
const ControlledRichEditor = <T extends FieldValues>({
  control,
  name,
}: ControlledRichEditorProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => (
        <EditorContent content={value} onChange={onChange} />
      )}
    />
  );
};

export default ControlledRichEditor;
