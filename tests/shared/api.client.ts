import { APIRequestContext, APIResponse } from '@playwright/test';

type Headers = Record<string, string>;

export class ApiClient {
  constructor(private request: APIRequestContext) {}

  async get(url: string, headers?: Headers): Promise<APIResponse> {
    return this.request.get(url, { headers });
  }

  async post(url: string, data?: any, headers?: Headers): Promise<APIResponse> {
    return this.request.post(url, {
      data,
      headers: { 'Content-Type': 'application/json', ...headers }
    });
  }

  async put(url: string, data?: any, headers?: Headers): Promise<APIResponse> {
    return this.request.put(url, {
      data,
      headers: { 'Content-Type': 'application/json', ...headers }
    });
  }

  async patch(url: string, data?: any, headers?: Headers): Promise<APIResponse> {
    return this.request.patch(url, {
      data,
      headers: { 'Content-Type': 'application/json', ...headers }
    });
  }

  async delete(url: string, headers?: Headers): Promise<APIResponse> {
    return this.request.delete(url, { headers });
  }
}
