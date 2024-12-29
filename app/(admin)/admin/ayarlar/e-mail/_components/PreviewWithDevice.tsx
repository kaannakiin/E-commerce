import React, { useState, useRef, useLayoutEffect } from "react";
import { Box } from "@mantine/core";
import {
  TbDeviceMobile,
  TbDeviceDesktop,
  TbMail,
  TbRefresh,
} from "react-icons/tb";

interface PreviewTemplateProps {
  htmlContent: string;
}

const deviceSizes = {
  mobile: {
    width: "375px",
    maxWidth: "375px",
    name: "Mobile View",
  },
  desktop: {
    width: "100%",
    maxWidth: "800px",
    name: "Desktop View",
  },
};

const PreviewTemplate = ({ htmlContent }: PreviewTemplateProps) => {
  const [device, setDevice] = useState("desktop");
  const frameRef = useRef<HTMLIFrameElement>(null);

  useLayoutEffect(() => {
    if (!frameRef.current) return;
    const frame = frameRef.current;
    const doc = frame.contentDocument;

    if (doc) {
      doc.open();

      // Email preview için gerekli stil ve wrapper'ları ekle
      const enhancedHtmlContent = htmlContent.replace(
        "</head>",
        `
        <style>
          /* Global email stilleri */
          body {
            margin: 0;
            padding: 16px !important;
            background-color: #f8fafc !important;
            min-height: 100vh;
          }
          
          /* Email container için stiller */
          .email-preview-wrapper {
            max-width: 100%;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            overflow: hidden;
            padding: 20px;
          }
          
          /* Responsive düzenlemeler */
          @media (max-width: 600px) {
            body {
              padding: 8px !important;
            }
            .email-preview-wrapper {
              padding: 12px;
            }
            img {
              max-width: 100%;
              height: auto;
            }
          }
        </style>
      </head>`,
      );

      // Email içeriğini wrapper div içine al
      const wrappedContent = enhancedHtmlContent
        .replace("<body", '<body><div class="email-preview-wrapper"')
        .replace("</body>", "</div></body>");

      doc.write(wrappedContent);
      doc.close();
    }
  }, [htmlContent]);

  return (
    <Box className="flex w-full flex-col space-y-4 p-4">
      {/* Device Toggle Controls */}
      <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setDevice("desktop")}
            className={`flex items-center gap-2 rounded-md px-4 py-2 transition-all ${
              device === "desktop"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <TbDeviceDesktop className="h-5 w-5" />
            <span className="font-medium">Masaüstü</span>
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`flex items-center gap-2 rounded-md px-4 py-2 transition-all ${
              device === "mobile"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <TbDeviceMobile className="h-5 w-5" />
            <span className="font-medium">Mobil</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (frameRef.current) {
                const frame = frameRef.current;
                frame.contentDocument?.location.reload();
              }
            }}
            className="flex items-center gap-2 rounded-md px-4 py-2 text-gray-600 transition-all hover:bg-gray-50"
          >
            <TbRefresh className="h-5 w-5" />
            <span className="font-medium">Yenile</span>
          </button>
        </div>
      </div>

      {/* Email Preview Container */}
      <div className="relative flex w-full justify-center overflow-hidden rounded-lg bg-gray-100 p-8">
        <div className="absolute inset-0 flex items-center justify-center">
          <TbMail className="h-32 w-32 text-gray-200" />
        </div>

        <Box
          className="preview-container relative flex-shrink-0 bg-white"
          style={{
            width: deviceSizes[device].width,
            maxWidth: deviceSizes[device].maxWidth,
            border: "1px solid #e5e7eb",
            borderRadius: device === "mobile" ? "24px" : "8px",
            boxShadow:
              device === "mobile"
                ? "0 4px 16px rgba(0,0,0,0.1)"
                : "0 1px 3px rgba(0,0,0,0.1)",
            transition: "all 0.3s ease",
          }}
        >
          {device === "mobile" && (
            <div className="relative">
              <div className="mx-auto h-6 w-36 rounded-b-xl bg-gray-800" />
              <div className="absolute left-1/2 top-1 h-4 w-20 -translate-x-1/2 rounded-full bg-gray-700" />
            </div>
          )}

          <iframe
            ref={frameRef}
            className="w-full border-none bg-transparent"
            title="Email Preview"
            style={{
              width: "100%",
              height: "700px",
              borderRadius: device === "mobile" ? "20px" : "8px",
            }}
            sandbox="allow-same-origin"
          />

          {device === "mobile" && (
            <div className="mx-auto mb-4 h-12 w-12 rounded-full border-2 border-gray-200" />
          )}
        </Box>
      </div>
    </Box>
  );
};

export default PreviewTemplate;
