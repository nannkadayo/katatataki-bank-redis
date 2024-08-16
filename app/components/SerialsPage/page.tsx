'use client';
import React, { useEffect, useState, useRef } from 'react';
import { renderSVG } from 'uqr'; // Import renderSVG for QR code generation
import domtoimage from 'dom-to-image'; // Import dom-to-image for converting SVG to PNG

function formatValue(value: string) {
  try {
    const jsonValue = JSON.parse(value);
    return JSON.stringify(jsonValue, null, 2);
  } catch (e) {
    return value;
  }
}

function isUsed(value: string) {
  try {
    const jsonValue = JSON.parse(value);
    return jsonValue.hasOwnProperty('usedAt');
  } catch (e) {
    return false;
  }
}

function formatDate(milliseconds: string | number | Date) {
  const originalDate = new Date(milliseconds);
  return originalDate.toDateString();
}

async function handleDelete(key: any) {
  try {
    const response = await fetch('https://katatataki-bank.lognaze.com/api/deletekey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key }),
    });

    if (response.ok) {
      location.reload();
    } else {
      alert(`Failed to delete key '${key}'.`);
    }
  } catch (error) {
    console.error('Error deleting key:', error);
    alert(`Error deleting key '${key}'.`);
  }
}

export default function SerialsPage() {
  const [data, setData] = useState<any[]>([]);
  const qrRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement> }>({});
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('https://katatataki-bank.lognaze.com/api/getkeys', { method: 'GET', cache: 'no-store' });
        if (response.ok) {
          const jsonData = await response.json();
          setData(jsonData.data);
          jsonData.data.forEach(({ key }) => {
            qrRefs.current[key] = React.createRef();
          });
        } else {
          console.error('Failed to fetch data from API');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  function getStatus(value: string) {
    try {
      const jsonValue = JSON.parse(value);
      const currentTime = Date.now();
      const expiredAt = jsonValue.expiredAt;
      const usedAt = jsonValue.usedAt;
      const ban = jsonValue.ban;
      if (ban) {
        return 'ban';
      } else if (usedAt) {
        return '使用済み';
      } else if (expiredAt === null || expiredAt === undefined) {
    return '無期限';
     } else if (expiredAt < currentTime) {
        return '期限切れ';
      } else {
        return '未使用';
      }
    } catch (e) {
      return '不明';
    }
  }

  function getmemo(value: string) {
    const jsonValue = JSON.parse(value);
    return jsonValue.memo;
  }

  function getpass(value: string) {
    const jsonValue = JSON.parse(value);
    return jsonValue.passCode;
  }

  function getStatusColor(status: string) {
    switch (status) {
      case '使用済み':
        return '#f1684b';
case '期限切れ':
        return '#f18b4b';
　　　　case '無期限':
        return '#92d75b';
      case '未使用':
        return '#92d75b';
      case 'ban':
        return '#f1684b';
      default:
        return 'grey';
    }
  }

  function getnumber(value: string) {
    const jsonValue = JSON.parse(value);
const serial = jsonValue.number
    return serial;
  }

  async function unlock(key: any) {
    try {
      const response = await fetch('/api/unlock', {
        method: 'POST',
        body: JSON.stringify({ key }),
      });
      if (response.ok) {
        location.reload();
      } else {
        alert(`Failed to unlock key '${key}'.`);
      }
    } catch (error) {
      console.error('Error unlocking key:', error);
      alert(`Error unlocking key '${key}'.`);
    }
  }

  async function ban(key: any) {
    try {
      const response = await fetch('/api/ban', {
        method: 'POST',
        body: JSON.stringify({ key }),
      });
      if (response.ok) {
        location.reload();
      } else {
        alert(`Failed to ban key '${key}'.`);
      }
    } catch (error) {
      console.error('Error banning key:', error);
      alert(`Error banning key '${key}'.`);
    }
  }

  function generateQrCode(serial: string) {
    const readableSerialNumber = `${serial.substring(0, 5)}-${serial.substring(5, 10)}-${serial.substring(10, 15)}`;
    return renderSVG(new URL(`/update?sn=${readableSerialNumber}`, location.href).href);
  }

  function handleDownload(key: string) {
    const qrRef = qrRefs.current[key];
    if (qrRef.current) {
      domtoimage.toPng(qrRef.current)
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `serial: ${key} QRCode.png`;
          link.href = dataUrl;
          link.click();
        })
        .catch((error) => {
          console.error('Error generating QR code PNG:', error);
        });
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>シリアルコード一覧</h1>
      <div style={styles.tableContainer}>
        <table style={styles.table} className="order-table">
          <thead>
            <tr>
              <th style={{ ...styles.tableHeader }}>serials</th>
              <th style={{ ...styles.tableHeader }}>Expiry Date</th>
              <th style={{ ...styles.tableHeader }}>frequency</th>
              <th style={{ ...styles.tableHeader }}>memo</th>
              <th style={{ ...styles.tableHeader }}>passcode</th>
              <th style={{ ...styles.tableHeader }}>Status</th>
              <th style={{ ...styles.tableHeader }}>date of use</th>
              <th style={{ ...styles.tableHeader }}>QR Code</th>
              <th style={{ ...styles.tableHeader }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map(({ key, value }) => {
              const parsedValue = JSON.parse(value);
              const expiryDate = parsedValue.expiredAt ? formatDate(parsedValue.expiredAt) : 'N/A';
              const usedDate = parsedValue.usedAt ? formatDate(parsedValue.usedAt) : 'N/A';
              const qrCode = generateQrCode(key);
const keysb = key
 const readableSerialNumber = `${keysb.substring(0, 5)}-${keysb.substring(5, 10)}-${keysb.substring(10, 15)}`;

              return (
                <tr key={readableSerialNumber}>
                  <td style={styles.tableCell2}>{keysb}</td>
                  <td style={styles.tableCell}>
                    <pre style={styles.psub2}>
                      {expiryDate}
                    </pre>
                  </td>
                  <td style={styles.tableCell}>
                    <pre style={styles.psub2}>
                      {getnumber(value)}
                    </pre>
                  </td>
                  <td style={styles.tableCell}>
                    <p style={styles.psub2}>
                      {getmemo(value)}
                    </p>
                  </td>
                  <td style={styles.tableCell}>
                    <pre style={styles.psub2}>
                      {getpass(value)}
                    </pre>
                  </td>
                  <td style={{
                    ...styles.tableCell,
                    backgroundColor: getStatusColor(getStatus(value)),
                    color: 'white',
                  }} title="serialコードの状態">
                    <p style={styles.psub2}>
                      {getStatus(value)}
                    </p>
                  </td>
                  <td style={styles.tableCell}>
                    <pre style={styles.psub2}>
                      {usedDate}
                    </pre>
                  </td>
                  <td style={styles.tableCell}>
                  <div ref={qrRefs.current[key]} dangerouslySetInnerHTML={{ __html: qrCode }} className="w-28 h-28" />
                  <button style={styles.button2} title="QRCodeをpng形式でダウンロード "onClick={() => handleDownload(key)}>Download</button>
                  </td>
                 
                  <td style={styles.tableCell}>
                    <button style={styles.button} title="serialコードの削除" onClick={() => handleDelete(key)}>Delete</button>
                    <button style={styles.button}  title="serialコードのban" onClick={() => ban(key)}>ban</button>
                    <button style={styles.button2}  title="serialコードのban又は使用済みのリセット(使用期限はリセットされません)" onClick={() => unlock(key)}>unlock</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}


const styles = {

  container: {
    padding: '20px',
    borderRadius: '15px',
    backgroundColor: '#f9f9f9',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  heading: {
    textAlign: 'center',
    color: '#333',
    borderBottom: '2px solid #ddd',
    paddingBottom: '10px',
    borderRadius: '15px 15px 0 0',
  },
  tableContainer: {
    flex: 1, // Take available space
    overflowY: 'auto', // Enable vertical scrolling
    maxHeight: '1400px', // Maximum height for the table container
  },
  table: {
    width: '130%',
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
    borderRadius: '0',
  },
  tableCell: {
    border: '1px solid #ddd',
    padding: '8px',
    verticalAlign: 'top',
    borderRadius: '0',
  },
tableCell2: {
    border: '1px solid #ddd',
    padding: '8px',
    verticalAlign: 'top',
    borderRadius: '0',
width: '100px',
whitespace: 'nowrap',
overflowX: 'auto',
  },
  pre: {
    margin: '0',
    whiteSpace: 'pre-wrap',
    wordbreak: 'normal',
    width: '300px', // 最大幅を設定
   // overflowX: 'auto', // 横スクロール可能にする
  },
 presub: {
    margin: '0',
    whiteSpace: 'pre-wrap',
    wordbreak: 'normal',
    width: '120px', // 最大幅を設定
   // overflowX: 'auto', // 横スクロール可能にする
  },
psub2: {
    margin: '0',
    whiteSpace: 'pre-wrap',
    wordbreak: 'normal',
    width: '65px', // 最大幅を設定
   // overflowX: 'auto', // 横スクロール可能にする
  },
  button: {
    padding: '6px 12px',
    color: 'white',
    backgroundColor: '#f44336',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  button2: {
    padding: '6px 12px',
    color: 'white',
    backgroundColor: '#92d75b',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};
