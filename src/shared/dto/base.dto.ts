export abstract class BaseDTO {
  public abstract readonly url: string;
  public paramsDTO?: Record<string, unknown>;
  public queryDTO?: Record<string, unknown>;

  public get interpolatedUrl(): string {
    let url = this.url;

    // Replace path parameters
    if (this.paramsDTO) {
      for (const key of Object.keys(this.paramsDTO)) {
        url = url.replace(`:${key}`, String(this.paramsDTO[key]));
      }
    }

    // Build query string
    if (this.queryDTO) {
      const pairs: string[] = [];
      for (const key of Object.keys(this.queryDTO)) {
        const val = (this.queryDTO as Record<string, unknown>)[key];
        if (val === undefined || val === null) continue;
        
        if (Array.isArray(val)) {
          val.forEach(v => pairs.push(`${key}=${encodeURIComponent(String(v))}`));
        } else {
          pairs.push(`${key}=${encodeURIComponent(String(val))}`);
        }
      }
      if (pairs.length) url = `${url}?${pairs.join('&')}`;
    }

    return url; // Return the interpolated URL
  }
}
