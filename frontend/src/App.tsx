import { useState, useEffect } from 'react';
import axios from 'axios';
import { CurrentDataDto } from '../../shared/dto';

function App() {
  const [data, setData] = useState<CurrentDataDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<CurrentDataDto>('http://localhost:3001/current-data');
      setData(response.data);
    } catch (err) {
      setError('Failed to fetch data from backend');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !data) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>🏠 HomeAccount</h1>
        <div style={{ fontSize: '18px', color: '#666' }}>
          ⏳ Loading data from backend...
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>🏠 HomeAccount</h1>
        <div style={{ fontSize: '18px', color: '#d32f2f', backgroundColor: '#ffebee', padding: '10px', borderRadius: '4px' }}>
          ❌ {error}
        </div>
        <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
          Make sure the backend is running on http://localhost:3001
        </div>
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={fetchData}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🏠 HomeAccount</h1>
      
      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <button 
          onClick={fetchData}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#0056b3';
            }
          }}
          onMouseOut={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#007bff';
            }
          }}
        >
          {loading ? '⏳ Fetching...' : '🔄 Fetch Current Data'}
        </button>
      </div>

      {error && data && (
        <div style={{ 
          backgroundColor: '#ffebee', 
          color: '#d32f2f', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '20px',
          border: '1px solid #ffcdd2'
        }}>
          ⚠️ {error} (showing previous data)
        </div>
      )}

      <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
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
          <p>🔘 <strong>Interactive:</strong> Click the button above to fetch fresh data</p>
        </div>
      </div>
    </div>
  );
}

export default App; 