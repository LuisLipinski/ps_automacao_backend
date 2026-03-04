import { APIRequestContext, APIResponse } from '@playwright/test';

export class ApiClient {
  constructor(private request: APIRequestContext) {}

  async get(url: string): Promise<APIResponse> {
    return this.request.get(url);
  }

  async post(url: string, data?: any): Promise<APIResponse> {
    return this.request.post(url, { data, headers: { 'Content-Type': 'application/json' } });
  }

  async put(url: string, data?: any): Promise<APIResponse> {
    return this.request.put(url, { data, headers: { 'Content-Type': 'application/json' } });
  }

  async patch(url: string, data?: any): Promise<APIResponse> {
    return this.request.patch(url, { data, headers: { 'Content-Type': 'application/json' } });
  }

  async delete(url: string): Promise<APIResponse> {
    return this.request.delete(url);
  }
}
