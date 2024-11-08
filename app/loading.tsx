export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        <h2 className="text-xl font-semibold text-gray-700">Yükleniyor...</h2>
        <p className="text-sm text-gray-500">Lütfen bekleyiniz</p>
      </div>
    </div>
  );
}
