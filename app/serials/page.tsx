'use client'
//export const metadata = {
 // title: 'Serials',
//};

function formatValue(value: string) {
  try {
    const jsonValue = JSON.parse(value);
    return JSON.stringify(jsonValue, null, 2); // JSON オブジェクトを読みやすく整形
  } catch (e) {
    return value; // JSON パースに失敗した場合はそのまま表示
  }
}

// 削除リクエストを送信する関数
async function handleDelete(key: any) {
  try {
    const response = await fetch('http://localhost:3000/api/deletekey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key }),
    });

    if (response.ok) {
      alert(`Key '${key}' deleted successfully!`);
      location.reload(); // ページをリロードしてデータを更新
    } else {
      alert(`Failed to delete key '${key}'.`);
    }
  } catch (error) {
    console.error('Error deleting key:', error);
    alert(`Error deleting key '${key}'.`);
  }
}

export default async function SerialsPage() {
  let data = [];

  try {
    const response = await fetch('http://localhost:3000/api/getkeys',{  method: 'GET', cache:"no-store"});
    if (response.ok) {
      data = await response.json();
    } else {
      console.error('Failed to fetch data from API');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Serial Data</h1>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Key</th>
              <th style={styles.tableHeader}>Value</th>
              <th style={styles.tableHeader}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map(({ key, value }) => (
              <tr key={key}>
                <td style={styles.tableCell}>{key}</td>
                <td style={styles.tableCell}>
                  <pre style={styles.pre}>{formatValue(value)}</pre>
                </td>
                <td style={styles.tableCell}>
                  <button style={styles.button} onClick={() => handleDelete(key)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    borderRadius: '15px',
    backgroundColor: '#f9f9f9',
    maxWidth: '1200px',
    margin: 'auto',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  heading: {
    textAlign: 'center',
    color: '#333',
    borderBottom: '2px solid #ddd',
    paddingBottom: '10px',
    borderRadius: '15px 15px 0 0',
  },
  tableContainer: {
    overflowX: 'auto', // テーブル全体が枠をはみ出さないようにする
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0',
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  tableHeader: {
    backgroundColor: '#0d6efd',
    color: 'white',
    textAlign: 'left',
    padding: '10px',
    borderRadius: '15px 15px 0 0',
  },
  tableCell: {
    border: '1px solid #ddd',
    padding: '8px',
    verticalAlign: 'top',
    borderRadius: '0',
  },
  pre: {
    margin: '0',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    maxWidth: '800px', // 最大幅を設定
    overflowX: 'auto', // 横スクロール可能にする
    borderRadius: '0 0 15px 15px',
  },
  button: {
    padding: '6px 12px',
    color: 'white',
    backgroundColor: '#f44336',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};
