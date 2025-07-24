import { useState, useEffect } from 'react';
import axios from 'axios';
import { CurrentDataDto } from '../../shared/dto';

function App() {
  const [data, setData] = useState<CurrentDataDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get<CurrentDataDto>('http://localhost:3001/current-data');
        setData(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch data from backend');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>🏠 HomeAccount</h1>
        <div style={{ fontSize: '18px', color: '#666' }}>
          ⏳ Loading data from backend...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>🏠 HomeAccount</h1>
        <div style={{ fontSize: '18px', color: '#d32f2f', backgroundColor: '#ffebee', padding: '10px', borderRadius: '4px' }}>
          ❌ {error}
        </div>
        <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
          Make sure the backend is running on http://localhost:3001
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🏠 HomeAccount</h1>
      <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
        <h2>✅ Backend Connected Successfully!</h2>
        
        <div style={{ marginTop: '15px' }}>
          <h3>📄 Data from Shared DTO:</h3>
          <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '4px', border: '1px solid #ddd' }}>
            <p><strong>Current Time:</strong> {data?.currentTime}</p>
            <p><strong>Message:</strong> {data?.message}</p>
          </div>
        </div>

        <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
          <p>🔗 <strong>Backend Endpoint:</strong> GET http://localhost:3001/current-data</p>
          <p>📦 <strong>Using Shared Types:</strong> CurrentDataDto from ../shared/dto.ts</p>
        </div>
      </div>
    </div>
  );
}

export default App; 