export async function fetchHtml(url: string): Promise<{
  html: string;
  status: number;
  finalUrl: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();

    if (data.error) {
      return { html: '', status: 0, finalUrl: url, error: data.message || data.error };
    }

    return {
      html: data.html,
      status: data.status,
      finalUrl: data.url,
    };
  } catch (e) {
    return {
      html: '',
      status: 0,
      finalUrl: url,
      error: e instanceof Error ? e.message : 'Network error',
    };
  }
}
