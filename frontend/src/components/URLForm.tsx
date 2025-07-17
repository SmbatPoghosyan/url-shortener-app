import React, { useState } from 'react';
import { apiFetch } from '../api';
import Input from './ui/Input';
import Button from './ui/Button';
import { Url } from './UrlItem';


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
      const body: Record<string, string> = { longUrl };
      if (slug) body.slug = slug;
      const res = await apiFetch('http://localhost:3000/urls', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
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
    <form onSubmit={handleSubmit} className="space-y-4 mb-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" htmlFor="longUrl">
          Long URL
        </label>
        <Input
          id="longUrl"
          type="url"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium" htmlFor="slug">
          Custom Slug (optional)
        </label>
        <Input
          id="slug"
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
      </div>
      {error && <p className="text-red-600">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating...' : 'Shorten URL'}
      </Button>
    </form>
  );
};

export default URLForm;
