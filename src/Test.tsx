import { useLocation } from 'react-router';
import './Test.css';
import { useState } from 'react';

export function Test() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageUrl = location.state?.imageUrl;
  return (
    <>
      <view
        style={{
          width: '100%',
          height: '100%'
        }}
      >
        <view
          style={{
            width: '100%',
            height: '25%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {!loading && (
            <image
              src={imageUrl}
              auto-size={true}
              mode="aspectFit"
              placeholder="Loading image..."
              bindtap={async () => {
                setLoading(true);
                const image =
                  NativeModules.NativeLocalStorageModule.getImageAsUint8Array(
                    imageUrl,
                  );

                const boundary =
                  '----WebKitFormBoundary' +
                  Math.random().toString(16).slice(2);
                const fileName = 'image.jpg'; // or extract from imageUrl if needed
                const fileType = 'image/jpeg'; // or detect from imageUrl

                // Fetch the image as a Blob or ArrayBuffer
                const imageUint8 = image.data || new Uint8Array();

                function asciiEncode(str: string): Uint8Array {
                  const arr = new Uint8Array(str.length);
                  for (let i = 0; i < str.length; i++) {
                    arr[i] = str.charCodeAt(i) & 0x7f;
                  }
                  return arr;
                }

                // Build multipart body
                const CRLF = '\r\n';
                const preamble =
                  `--${boundary}${CRLF}` +
                  `Content-Disposition: form-data; name="file"; filename="${fileName}"${CRLF}` +
                  `Content-Type: ${fileType}${CRLF}${CRLF}`;
                const postamble = `${CRLF}--${boundary}--${CRLF}`;

                const preambleBytes = asciiEncode(preamble);
                const postambleBytes = asciiEncode(postamble);
                const body = new Uint8Array(
                  preambleBytes.length +
                    imageUint8.length +
                    postambleBytes.length,
                );
                body.set(preambleBytes, 0);
                body.set(imageUint8, preambleBytes.length);
                body.set(
                  postambleBytes,
                  preambleBytes.length + imageUint8.length,
                );

                // Use fetch with the constructed body and correct Content-Type
                const response = await fetch(
                  'http://192.168.240.1:8000/api/media/upload',
                  {
                    method: 'POST',
                    headers: {
                      Authorization:
                        'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI3MjhjNWJlOC04ZTNmLTRiMDQtYmQzYy0zOTQ1ZGRhMzZhMGQiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6IkFkbWluIiwiZXhwIjoxNzU0NzYwODUzfQ.dlJxUuc8Dwpy17RPtp9zzmptRpCueZcJXVs4ZjIHym8',
                      'Content-Type': `multipart/form-data; boundary=${boundary}`,
                    },
                    body,
                  },
                );
                console.log('Response status:', response.status);
                setLoading(false);
                if (!response.ok) {
                  setError(`Error: ${response.status} ${response.statusText}`);
                  return;
                }
                console.log('response', response);
                const data = await response.json();
                console.log('Response from upload:', data);
              }}
            />
          )}
        </view>
        <view className="flex flex-col">
          <input
            className="input-box"
            text-color="#000000"
            placeholder="Enter some text"
            value={error ?? ''}
            style={{
              height: '100px',
              paddingLeft: '20px',
            }}
            bindinput={(e: any) => {
              console.log('Input event:', e);
            }}
          />
        </view>
      </view>
    </>
  );
}
