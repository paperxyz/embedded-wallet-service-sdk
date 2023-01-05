import {
  AUTH_TOKEN_LOCAL_STORAGE_NAME,
  DEVICE_SHARE_LOCAL_STORAGE_NAME,
} from "../../constants/settings";

const data = new Map<string, string>();

export class LocalStorage {
  protected isSupported: boolean;
  protected clientId: string;
  constructor({ clientId }: { clientId: string }) {
    this.isSupported = typeof window !== "undefined" && !!window.localStorage;
    this.clientId = clientId;
  }

  protected async getItem(key: string): Promise<string | null> {
    if (this.isSupported) {
      return window.localStorage.getItem(key);
    } else {
      return data.get(key) ?? null;
    }
  }

  protected async setItem(key: string, value: string): Promise<void> {
    if (this.isSupported) {
      return window.localStorage.setItem(key, value);
    } else {
      data.set(key, value);
    }
  }

  protected async removeItem(key: string): Promise<boolean> {
    const item = await this.getItem(key);
    if (this.isSupported && item) {
      window.localStorage.removeItem(key);
      return true;
    }
    return false;
  }

  async saveAuthCookie(cookie: string): Promise<void> {
    this.setItem(AUTH_TOKEN_LOCAL_STORAGE_NAME(this.clientId), cookie);
  }
  async getAuthCookie(): Promise<string | null> {
    return this.getItem(AUTH_TOKEN_LOCAL_STORAGE_NAME(this.clientId));
  }
  async removeAuthCookie(): Promise<boolean> {
    return this.removeItem(AUTH_TOKEN_LOCAL_STORAGE_NAME(this.clientId));
  }

  async saveDeviceShare(share: string): Promise<void> {
    this.setItem(DEVICE_SHARE_LOCAL_STORAGE_NAME(this.clientId), share);
  }
  async getDeviceShare(): Promise<string | null> {
    return this.getItem(DEVICE_SHARE_LOCAL_STORAGE_NAME(this.clientId));
  }
  async removeDeviceShare(): Promise<boolean> {
    return this.removeItem(DEVICE_SHARE_LOCAL_STORAGE_NAME(this.clientId));
  }
}
