import { useState, useEffect } from 'react';
import axios from 'axios';
import { CurrentDataDto, VersionResponseDto, ExpensesListResponseDto, ExpenseDto } from '../../shared/dto';

// Migration Info Component
function MigrationInfo() {
  const [migrationInfo, setMigrationInfo] = useState<VersionResponseDto | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMigrationInfo = async () => {
    setLoading(true);
    try {
      const response = await axios.get<VersionResponseDto>('/api/version');
      setMigrationInfo(response.data);
    } catch (error) {
      console.error('Failed to fetch migration info:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMigrationInfo();
  }, []);

  if (loading) return <p>🔄 <strong>Migrations:</strong> Loading...</p>;
  if (!migrationInfo) return <p>❌ <strong>Migrations:</strong> Failed to load</p>;

  const statusEmoji = migrationInfo.migrations.status === 'up-to-date' ? '✅' : 
                     migrationInfo.migrations.status === 'pending' ? '⏳' : '❓';

  return (
    <p>
      {statusEmoji} <strong>Database:</strong> {migrationInfo.database} 
      ({migrationInfo.migrations.applied}/{migrationInfo.migrations.total} migrations, {migrationInfo.migrations.status})
    </p>
  );
}

// Expenses List Component
function ExpensesList() {
  const [expenses, setExpenses] = useState<ExpenseDto[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<ExpensesListResponseDto>('/api/expenses');
      setExpenses(response.data.expenses);
    } catch (err) {
      setError('Failed to fetch expenses');
      console.error('Failed to fetch expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3>💰 Recent Expenses</h3>
        <button 
          onClick={fetchExpenses}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '⏳ Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {error && (
        <div style={{ 
          backgroundColor: '#ffebee', 
          color: '#d32f2f', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '15px',
          border: '1px solid #ffcdd2'
        }}>
          ❌ {error}
        </div>
      )}

      {loading && !expenses && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          ⏳ Loading expenses...
        </div>
      )}

      {expenses && expenses.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          📝 No expenses found
        </div>
      )}

      {expenses && expenses.length > 0 && (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #ddd', overflow: 'hidden' }}>
          <div style={{ backgroundColor: '#f8f9fa', padding: '12px', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px' }}>
              <span>Description</span>
              <span>Amount</span>
              <span>Date</span>
            </div>
          </div>
          {expenses.map((expense) => (
            <div 
              key={expense.id} 
              style={{ 
                padding: '12px', 
                borderBottom: '1px solid #eee',
                display: 'grid', 
                gridTemplateColumns: '2fr 1fr 1fr', 
                gap: '10px',
                alignItems: 'center'
              }}
            >
              <span style={{ fontWeight: '500' }}>{expense.description}</span>
              <span style={{ color: '#dc3545', fontWeight: 'bold' }}>{formatCurrency(expense.amount)}</span>
              <span style={{ color: '#666', fontSize: '14px' }}>{formatDate(expense.date)}</span>
            </div>
          ))}
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#f8f9fa', 
            fontWeight: 'bold',
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr 1fr', 
            gap: '10px'
          }}>
            <span>Total ({expenses.length} expenses)</span>
            <span style={{ color: '#dc3545' }}>
              {formatCurrency(expenses.reduce((sum, exp) => sum + exp.amount, 0))}
            </span>
            <span></span>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [data, setData] = useState<CurrentDataDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<CurrentDataDto>('/api/current-data');
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
          Make sure the backend service is running and accessible
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
            <p>🔗 <strong>API Endpoint:</strong> GET /api/current-data</p>
            <p>📦 <strong>Using Shared Types:</strong> CurrentDataDto from ../shared/dto.ts</p>
            <p>🔘 <strong>Interactive:</strong> Click the button above to fetch fresh data</p>
            <MigrationInfo />
          </div>
      </div>

      <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
        <ExpensesList />
      </div>
    </div>
  );
}

export default App; 