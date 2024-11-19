interface HttpRequestOptions {
  headers?: HeadersInit;
}

interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
  htmlContent?: string;
}

type RequestBody = Record<string, unknown> | FormData;

const handleResponse = async <T>(
  response: Response,
): Promise<ApiResponse<T>> => {
  try {
    if (response.status === 204) {
      return { status: response.status };
    }

    // Content-Type kontrolü
    const contentType = response.headers.get("content-type");

    // HTML içeriği kontrolü
    if (contentType?.includes("text/html")) {
      const htmlContent = await response.text();
      return {
        htmlContent,
        status: response.status,
      };
    }

    // JSON yanıt kontrolü
    if (contentType?.includes("application/json")) {
      const data = await response.json();
      if (!response.ok) {
        return {
          error: data.message || "Bir hata oluştu",
          status: response.status,
        };
      }
      return {
        data,
        status: response.status,
      };
    }

    // Desteklenmeyen içerik tipi
    return {
      error: `Desteklenmeyen yanıt tipi: ${contentType}`,
      status: response.status,
    };
  } catch (error) {
    console.error("Response handling error:", error);
    return {
      error: "İstek işlenirken bir hata oluştu",
      status: response.status,
    };
  }
};
const get = async <T>(
  url: string,
  options?: HttpRequestOptions,
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(getUrl(url), {
      headers: { ...getHeaders(), ...options?.headers },
    });
    return handleResponse<T>(response);
  } catch (error) {
    return {
      error: "Bağlantı hatası",
      status: 500,
    };
  }
};

const post = async <T>(
  url: string,
  data: RequestBody,
  options?: HttpRequestOptions,
): Promise<ApiResponse<T>> => {
  try {
    const isFormData = data instanceof FormData;

    const headers = isFormData
      ? { ...options?.headers }
      : { ...getHeaders(), ...options?.headers };

    const response = await fetch(getUrl(url), {
      method: "POST",
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });
    return handleResponse<T>(response);
  } catch (error) {
    return {
      error: "Bağlantı hatası",
      status: 500,
    };
  }
};

const put = async <T>(
  url: string,
  data: RequestBody,
  options?: HttpRequestOptions,
): Promise<ApiResponse<T>> => {
  try {
    const isFormData = data instanceof FormData;

    const headers = isFormData
      ? { ...options?.headers }
      : { ...getHeaders(), ...options?.headers };

    const response = await fetch(getUrl(url), {
      method: "PUT",
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });
    return handleResponse<T>(response);
  } catch (error) {
    return {
      error: "Bağlantı hatası",
      status: 500,
    };
  }
};

const deleteRequest = async <T>(
  url: string,
  options?: HttpRequestOptions,
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(getUrl(url), {
      method: "DELETE",
      headers: { ...getHeaders(), ...options?.headers },
    });
    return handleResponse<T>(response);
  } catch (error) {
    return {
      error: "Bağlantı hatası",
      status: 500,
    };
  }
};

const getHeaders = (): Record<string, string> => {
  return {
    "Content-Type": "application/json",
  };
};

const getUrl = (url: string): string => {
  if (url.startsWith("http")) {
    return url;
  }
  return `/api/${url.startsWith("/") ? url.slice(1) : url}`;
};

export const fetchWrapper = {
  get,
  post,
  put,
  delete: deleteRequest,
};
