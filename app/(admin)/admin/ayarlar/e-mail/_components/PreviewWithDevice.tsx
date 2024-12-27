import React, { useState, useRef, useLayoutEffect } from "react";
import { Box, SegmentedControl } from "@mantine/core";
import { TbDeviceMobile, TbDeviceDesktop } from "react-icons/tb";

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
      doc.write(htmlContent);
      doc.close();
    }
  }, [htmlContent]);

  return (
    <Box className="flex w-full flex-col p-4">
      <Box className="mb-4 w-full">
        <SegmentedControl
          fullWidth
          size="md"
          className="shadow-sm"
          value={device}
          onChange={setDevice}
          data={[
            {
              value: "desktop",
              label: (
                <div className="flex items-center justify-center gap-2 px-4 py-2">
                  <TbDeviceDesktop className="h-6 w-6" />
                  <span className="text-base font-medium">Desktop Görünüm</span>
                </div>
              ),
            },
            {
              value: "mobile",
              label: (
                <div className="flex items-center justify-center gap-2 px-4 py-2">
                  <TbDeviceMobile className="h-6 w-6" />
                  <span className="text-base font-medium">Mobil Görünüm</span>
                </div>
              ),
            },
          ]}
        />
      </Box>

      <div className="flex w-full justify-center overflow-x-auto rounded-lg bg-gray-50">
        <Box
          className="preview-container flex-shrink-0 bg-white"
          style={{
            width: deviceSizes[device].width,
            maxWidth: deviceSizes[device].maxWidth,
            border: "1px solid #e5e7eb",
            borderRadius: device === "mobile" ? "20px" : "8px",
            boxShadow:
              device === "mobile"
                ? "0 4px 12px rgba(0,0,0,0.1)"
                : "0 1px 3px rgba(0,0,0,0.1)",
            transition: "all 0.3s ease",
          }}
        >
          {device === "mobile" && (
            <>
              <div className="mx-auto h-6 w-36 rounded-b-xl bg-gray-200" />
              <div className="mt-2 text-center text-sm text-gray-500">
                {deviceSizes[device].name}
              </div>
            </>
          )}

          <iframe
            ref={frameRef}
            className="w-full border-none"
            title="Email Preview"
            style={{
              width: "100%",
              height: "600px",
            }}
            sandbox="allow-same-origin"
          />
        </Box>
      </div>
    </Box>
  );
};

export default PreviewTemplate;
