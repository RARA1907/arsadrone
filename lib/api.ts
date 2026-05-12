/**
 * ArsaDrone API client — typed fetch wrappers
 * Backend: FastAPI @ NEXT_PUBLIC_API_URL
 */

// Turbopack env var injection sorunu — production URL hardcode
const BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "https://arsadrone-api-production-a42e.up.railway.app"
    : "http://localhost:8000");

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Avatar {
  id: string;
  name: string;
  gender: string;
  style: string;
  preview_url: string;
  duration_sec: number;
}

export interface PresignedUploadRequest {
  filename: string;
  content_type: string;
  file_size: number;
}

export interface PresignedUploadResponse {
  upload_url: string;
  file_key: string;
  expires_in: number;
}

export interface OrderCreateRequest {
  customer_name: string;
  customer_phone: string;
  property_type: "arsa" | "daire" | "villa" | "ticari";
  script_text: string;
  avatar_id: string;
  file_keys: string[];
}

export interface OrderCreated {
  id: string;
  status: string;
  created_at: string;
}

export interface OrderSummary {
  id: string;
  customer_name: string;
  property_type: string;
  status: string;
  avatar_name: string | null;
  created_at: string;
}

export interface OrderDetail {
  id: string;
  customer_name: string;
  customer_phone: string;
  property_type: string;
  script_text: string;
  avatar: Avatar | null;
  files: Array<Record<string, unknown>>;
  status: string;
  reject_reason: string | null;
  job: Record<string, unknown> | null;
  share_link: { id: string; url: string; expires_at: string } | null;
  created_at: string;
}

export interface JobStatus {
  id: string;
  order_id: string;
  status: string;
  current_step: string | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      // JSON parse hatası — statusText kullan
    }
    throw new ApiError(res.status, detail);
  }
  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

export const api = {
  /** Aktif avatar listesi */
  avatars: {
    list: (): Promise<Avatar[]> => request("/avatars"),
  },

  /** Dosya yükleme */
  upload: {
    presigned: (body: PresignedUploadRequest): Promise<PresignedUploadResponse> =>
      request("/upload/presigned", { method: "POST", body: JSON.stringify(body) }),

    /** Presigned URL'ye dosyayı direkt PUT eder (browser → R2) */
    toR2: async (presignedUrl: string, file: File): Promise<void> => {
      const res = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) throw new ApiError(res.status, "R2 yükleme başarısız");
    },
  },

  /** Siparişler */
  orders: {
    create: (body: OrderCreateRequest): Promise<OrderCreated> =>
      request("/orders", { method: "POST", body: JSON.stringify(body) }),

    list: (params?: { status?: string; limit?: number; offset?: number }): Promise<OrderSummary[]> => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set("status", params.status);
      if (params?.limit !== undefined) qs.set("limit", String(params.limit));
      if (params?.offset !== undefined) qs.set("offset", String(params.offset));
      const query = qs.toString() ? `?${qs}` : "";
      return request(`/orders${query}`);
    },

    get: (id: string): Promise<OrderDetail> => request(`/orders/${id}`),

    approve: (id: string) => request(`/orders/${id}/approve`, { method: "PATCH" }),

    reject: (id: string, reason: string) =>
      request(`/orders/${id}/reject`, {
        method: "PATCH",
        body: JSON.stringify({ reason }),
      }),

    approveVideo: (id: string) =>
      request(`/orders/${id}/approve-video`, { method: "PATCH" }),
  },

  /** Video job'lar */
  jobs: {
    get: (jobId: string): Promise<JobStatus> => request(`/jobs/${jobId}`),
    retry: (jobId: string) => request(`/jobs/${jobId}/retry`, { method: "POST" }),
  },
};

export { ApiError };
