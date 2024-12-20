import { Card, Paper, Stack, Text, TextInput, Textarea } from "@mantine/core";
import { Controller } from "react-hook-form";
import { LiaSlashSolid } from "react-icons/lia";

const SEOCard = ({ control, errors }) => {
  return (
    <Card padding="lg" radius="md">
      <Text size="lg" fw={700} mb="md">
        SEO
      </Text>
      <Stack gap="xl">
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Controller
            name="slug"
            control={control}
            render={({ field }) => {
              return (
                <TextInput
                  label="Slug"
                  disabled
                  value={field.value || ""}
                  leftSection={
                    <LiaSlashSolid style={{ transform: "rotate(-20deg)" }} />
                  }
                  error={errors.slug?.message}
                />
              );
            }}
          />

          <Controller
            name="pageTitle"
            control={control}
            render={({ field }) => (
              <TextInput
                label="Sayfa Başlığı"
                description="SEO uyumlu, maksimum 60 karakter"
                error={errors.pageTitle?.message}
                {...field}
              />
            )}
          />

          <Controller
            name="metaDescription"
            control={control}
            render={({ field }) => (
              <Textarea
                label="Açıklama"
                description="Maksimum 160 karakter"
                error={errors.metaDescription?.message}
                minRows={4}
                {...field}
              />
            )}
          />
        </div>

        <Paper p="md" radius="md" withBorder>
          <Text size="sm" fw={500} c="dimmed" mb="sm">
            Google Önizleme
          </Text>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <Text
              component="a"
              href="#"
              size="lg"
              style={{
                color: "#1a0dab",
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              {control._formValues.pageTitle || "Sayfa Başlığı"}
            </Text>

            <Text size="sm" style={{ color: "#006621" }}>
              {typeof window !== "undefined" ? window.location.origin : ""}/
              {control._formValues.slug || "sayfa-basligi"}
            </Text>

            <Text size="sm" c="dimmed" style={{ maxWidth: "600px" }}>
              {control._formValues.metaDescription ||
                "Sayfa açıklaması buraya gelecek..."}
            </Text>
          </div>
        </Paper>
      </Stack>
    </Card>
  );
};

export default SEOCard;
