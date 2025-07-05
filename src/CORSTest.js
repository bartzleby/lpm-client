import React, { useState } from 'react';

const CORSTest = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test, success, data, error = null) => {
    setResults(prev => [...prev, {
      test,
      success,
      data,
      error: error?.message || error,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const clearResults = () => setResults([]);

  // Test 1: Basic server connectivity
  const testServerHealth = async () => {
    try {
      console.log('🔍 Testing server health...');
      const response = await fetch('http://localhost:5005/');
      const data = await response.json();
      addResult('Server Health', true, data);
      console.log('✅ Server health test passed');
    } catch (error) {
      addResult('Server Health', false, null, error);
      console.error('❌ Server health test failed:', error);
    }
  };

  // Test 2: CORS test endpoint
  const testCORSEndpoint = async () => {
    try {
      console.log('🔍 Testing CORS endpoint...');
      const response = await fetch('http://localhost:5005/api/test');
      const data = await response.json();
      addResult('CORS Test Endpoint', true, data);
      console.log('✅ CORS test endpoint passed');
    } catch (error) {
      addResult('CORS Test Endpoint', false, null, error);
      console.error('❌ CORS test endpoint failed:', error);
    }
  };

  // Test 3: Manual OPTIONS request
  const testOPTIONS = async () => {
    try {
      console.log('🔍 Testing OPTIONS request...');
      const response = await fetch('http://localhost:5005/api/hands', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      
      const headers = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      
      addResult('OPTIONS Request', response.ok, { 
        status: response.status, 
        statusText: response.statusText,
        headers 
      });
      console.log('✅ OPTIONS test passed');
    } catch (error) {
      addResult('OPTIONS Request', false, null, error);
      console.error('❌ OPTIONS test failed:', error);
    }
  };

  // Test 4: GET request with fetch (simulating axios)
  const testGETWithAxios = async () => {
    try {
      console.log('🔍 Testing GET with fetch...');
      const response = await fetch('http://localhost:5005/api/hands', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      addResult('GET with Fetch', true, data);
      console.log('✅ GET with fetch passed');
    } catch (error) {
      addResult('GET with Fetch', false, null, error);
      console.error('❌ GET with fetch failed:', error);
    }
  };

  // Test 5: POST request with fetch (simulating axios)
  const testPOSTWithAxios = async () => {
    try {
      console.log('🔍 Testing POST with fetch...');
      
      const testHand = {
        spec_version: "1.4.6",
        site_name: "Test Site",
        network_name: "Test Network",
        game_type: "NLH",
        table_name: "Test Table",
        small_blind_amount: 5,
        big_blind_amount: 10,
        currency: "USD",
        players: [],
        rounds: [],
        pots: []
      };

      const response = await fetch('http://localhost:5005/api/hands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(testHand)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      addResult('POST with Fetch', true, data);
      console.log('✅ POST with fetch passed');
    } catch (error) {
      addResult('POST with Fetch', false, null, error);
      console.error('❌ POST with fetch failed:', error);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setLoading(true);
    clearResults();
    
    await testServerHealth();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testCORSEndpoint();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testOPTIONS();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testGETWithAxios();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testPOSTWithAxios();
    
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🧪 CORS Testing Dashboard</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={runAllTests} disabled={loading} style={{
          padding: '10px 20px',
          marginRight: '10px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}>
          {loading ? 'Running Tests...' : 'Run All Tests'}
        </button>
        
        <button onClick={clearResults} style={{
          padding: '10px 20px',
          backgroundColor: '#f44336',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Clear Results
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Individual Tests:</h3>
        <button onClick={testServerHealth} style={{ margin: '5px', padding: '5px 10px' }}>Test Server Health</button>
        <button onClick={testCORSEndpoint} style={{ margin: '5px', padding: '5px 10px' }}>Test CORS Endpoint</button>
        <button onClick={testOPTIONS} style={{ margin: '5px', padding: '5px 10px' }}>Test OPTIONS</button>
        <button onClick={testGETWithAxios} style={{ margin: '5px', padding: '5px 10px' }}>Test GET</button>
        <button onClick={testPOSTWithAxios} style={{ margin: '5px', padding: '5px 10px' }}>Test POST</button>
      </div>

      <div>
        <h3>Test Results:</h3>
        {results.length === 0 ? (
          <p>No tests run yet. Click "Run All Tests" to start.</p>
        ) : (
          <div>
            {results.map((result, index) => (
              <div key={index} style={{
                margin: '10px 0',
                padding: '10px',
                border: `2px solid ${result.success ? '#4CAF50' : '#f44336'}`,
                borderRadius: '4px',
                backgroundColor: result.success ? '#e8f5e8' : '#ffeaea'
              }}>
                <div style={{ fontWeight: 'bold' }}>
                  {result.success ? '✅' : '❌'} {result.test} ({result.timestamp})
                </div>
                {result.success ? (
                  <pre style={{ fontSize: '12px', margin: '5px 0' }}>
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                ) : (
                  <div style={{ color: '#d32f2f', margin: '5px 0' }}>
                    Error: {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CORSTest;