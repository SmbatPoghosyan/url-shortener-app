import React, { useState } from 'react';
import { apiFetch } from '../api';

interface Url {
  slug: string;
  target: string;
}

interface Props {
  onCreated: (url: Url) => void;
}

const isValidUrl = (value: string) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const URLForm: React.FC<Props> = ({ onCreated }) => {
  const [longUrl, setLongUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidUrl(longUrl)) {
      setError('Please enter a valid URL');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const body: Record<string, string> = { target: longUrl };
      if (slug) body.slug = slug;
      const res = await apiFetch('http://localhost:3000/urls', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create URL');
      }
      const data = await res.json();
      onCreated(data);
      setLongUrl('');
      setSlug('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
      <div>
        <label>
          Long URL
          <input
            type="url"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Custom Slug (optional)
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </label>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Shorten URL'}
      </button>
    </form>
  );
};

export default URLForm;
