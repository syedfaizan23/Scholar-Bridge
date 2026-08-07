import { useEffect, useState } from 'react';
import API from '../api/axios';

interface AuthedFile {
  objectUrl: string | null;
  isPdf: boolean;
  loading: boolean;
  error: boolean;
}

/**
 * Fetches a protected (auth-required) file URL through the authenticated
 * axios instance and returns a local blob URL — needed because a plain
 * <img src> or <a href> can't send an Authorization header.
 */
export function useAuthenticatedFile(url: string | null): AuthedFile {
  const [state, setState] = useState<AuthedFile>({ objectUrl: null, isPdf: false, loading: false, error: false });

  useEffect(() => {
    if (!url) {
      setState({ objectUrl: null, isPdf: false, loading: false, error: false });
      return;
    }
    let revoke: string | null = null;
    let cancelled = false;
    setState(s => ({ ...s, loading: true, error: false }));

    API.get(url.replace(/^.*\/api/, ''), { responseType: 'blob' })
      .then(res => {
        if (cancelled) return;
        const blobUrl = URL.createObjectURL(res.data);
        revoke = blobUrl;
        setState({ objectUrl: blobUrl, isPdf: (res.data.type || '').includes('pdf'), loading: false, error: false });
      })
      .catch(() => {
        if (!cancelled) setState({ objectUrl: null, isPdf: false, loading: false, error: true });
      });

    return () => {
      cancelled = true;
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [url]);

  return state;
}
