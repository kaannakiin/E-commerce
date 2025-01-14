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
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { BubbleMenu, FloatingMenu, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import ImageResize from "tiptap-extension-resize-image";
import ImageGallery from "./ImageGallery";
import {
  TbColumnInsertLeft,
  TbColumnInsertRight,
  TbColumnRemove,
  TbRowInsertTop,
  TbRowInsertBottom,
  TbRowRemove,
  TbTableOff,
  TbTablePlus, // Changed from TbTableMergeCells
  TbTableDown, // Changed from TbTableSplit
  TbTable, // Changed from TbLayoutHeaders
} from "react-icons/tb";
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
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "my-custom-table",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "my-custom-tr",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "my-custom-th",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "my-custom-td",
        },
      }),
      ImageResize.configure({
        allowBase64: true,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          style: "display: block; max-width: 100%; height: auto;",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph", "image"],
        alignments: ["left", "center", "right", "justify"],
        defaultAlignment: "left",
      }),
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
        h1ControlLabel: "Başlık 1",
        h2ControlLabel: "Başlık 2",
        h3ControlLabel: "Başlık 3",
        h4ControlLabel: "Başlık 4",
        h5ControlLabel: "Başlık 5",
        h6ControlLabel: "Başlık 6",
        blockquoteControlLabel: "Alıntı",
        hrControlLabel: "Yatay çizgi",
        bulletListControlLabel: "Madde işaretli liste",
        orderedListControlLabel: "Numaralı liste",
        subscriptControlLabel: "Alt simge",
        superscriptControlLabel: "Üst simge",
        linkControlLabel: "Bağlantı ekle",
        unlinkControlLabel: "Bağlantıyı kaldır",
        alignLeftControlLabel: "Sola hizala",
        alignCenterControlLabel: "Ortala",
        alignJustifyControlLabel: "İki yana yasla",
        alignRightControlLabel: "Sağa hizala",
        undoControlLabel: "Geri al",
        redoControlLabel: "İleri al",
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
        {<InsertTableControl />}
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
  isWithImage?: boolean;
}
function InsterTheImageControl() {
  const { editor } = useRichTextEditorContext();
  const handleImageSelect = (imageSrc: string) => {
    editor
      ?.chain()
      .focus()
      .setImage({
        src: imageSrc,
        alt: "rich-text-images",
      })
      .setTextAlign("left") // Varsayılan hizalama
      .run();
  };

  return (
    <RichTextEditor.Control title="Resim Ekle">
      <ImageGallery onImageSelect={handleImageSelect} />
    </RichTextEditor.Control>
  );
}

function InsertTableControl() {
  const { editor } = useRichTextEditorContext();
  const insertTable = () =>
    editor
      ?.chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  const addColumnBefore = () => editor?.chain().focus().addColumnBefore().run();
  const addColumnAfter = () => editor?.chain().focus().addColumnAfter().run();
  const deleteColumn = () => editor?.chain().focus().deleteColumn().run();
  const addRowBefore = () => editor?.chain().focus().addRowBefore().run();
  const addRowAfter = () => editor?.chain().focus().addRowAfter().run();
  const deleteRow = () => editor?.chain().focus().deleteRow().run();
  const deleteTable = () => editor?.chain().focus().deleteTable().run();
  const mergeCells = () => editor?.chain().focus().mergeCells().run();
  const splitCell = () => editor?.chain().focus().splitCell().run();
  const toggleHeaderColumn = () =>
    editor?.chain().focus().toggleHeaderColumn().run();

  return (
    <RichTextEditor.ControlsGroup>
      <RichTextEditor.Control
        title="Tablo Ekle"
        aria-label="Tablo Ekle"
        onClick={insertTable}
      >
        <TbTable size={18} />
      </RichTextEditor.Control>
      <RichTextEditor.Control
        title="Öne Sütun Ekle"
        aria-label="Öne Sütun Ekle"
        onClick={addColumnBefore}
      >
        <TbColumnInsertLeft size={18} />
      </RichTextEditor.Control>

      <RichTextEditor.Control
        title="Arkaya Sütun Ekle"
        aria-label="Arkaya Sütun Ekle"
        onClick={addColumnAfter}
      >
        <TbColumnInsertRight size={18} />
      </RichTextEditor.Control>

      <RichTextEditor.Control
        title="Sütun Sil"
        aria-label="Sütun Sil"
        onClick={deleteColumn}
      >
        <TbColumnRemove size={18} />
      </RichTextEditor.Control>

      <RichTextEditor.Control
        title="Üste Satır Ekle"
        aria-label="Üste Satır Ekle"
        onClick={addRowBefore}
      >
        <TbRowInsertTop size={18} />
      </RichTextEditor.Control>

      <RichTextEditor.Control
        title="Alta Satır Ekle"
        aria-label="Alta Satır Ekle"
        onClick={addRowAfter}
      >
        <TbRowInsertBottom size={18} />
      </RichTextEditor.Control>

      <RichTextEditor.Control
        title="Satır Sil"
        aria-label="Satır Sil"
        onClick={deleteRow}
      >
        <TbRowRemove size={18} />
      </RichTextEditor.Control>

      <RichTextEditor.Control
        title="Tabloyu Sil"
        aria-label="Tabloyu Sil"
        onClick={deleteTable}
      >
        <TbTableOff size={18} />
      </RichTextEditor.Control>

      <RichTextEditor.Control
        title="Hücreleri Birleştir"
        aria-label="Hücreleri Birleştir"
        onClick={mergeCells}
      >
        <TbTablePlus size={18} />
      </RichTextEditor.Control>

      <RichTextEditor.Control
        title="Hücreyi Böl"
        aria-label="Hücreyi Böl"
        onClick={splitCell}
      >
        <TbTableDown size={18} />
      </RichTextEditor.Control>

      <RichTextEditor.Control
        title="Başlık Sütunu"
        aria-label="Başlık Sütunu"
        onClick={toggleHeaderColumn}
      >
        <TbTable size={18} />
      </RichTextEditor.Control>
    </RichTextEditor.ControlsGroup>
  );
}

const ControlledRichEditor = <T extends FieldValues>({
  control,
  name,
  isWithImage = false,
}: ControlledRichEditorProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => (
        <EditorContent
          content={value}
          onChange={onChange}
          isWithImage={isWithImage}
        />
      )}
    />
  );
};

export default ControlledRichEditor;
