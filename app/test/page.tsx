"use client";

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 TestPage useEffect running...');
    
    const loadData = async () => {
      try {
        console.log('📡 Fetching indexed content...');
        const response = await fetch('/api/indexed-content');
        const result = await response.json();
        
        console.log('📦 Response:', result);
        setData(result);
        setLoading(false);
      } catch (error) {
        console.error('❌ Error:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Test Data Loading</h1>
      <div className="bg-gray-100 p-4 rounded">
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
      {data?.content && (
        <div className="mt-4">
          <h2 className="text-xl mb-2">Images ({data.content.length}):</h2>
          <div className="grid grid-cols-4 gap-4">
            {data.content.slice(0, 8).map((item: any) => (
              <div key={item.id} className="border p-2">
                <img src={item.imageUrl} alt={item.title} className="w-full h-32 object-cover mb-2" />
                <p className="text-sm">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}