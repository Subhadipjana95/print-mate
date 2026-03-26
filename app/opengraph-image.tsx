import { ImageResponse } from 'next/og';

// Image metadata
export const alt = 'PrintSyte | AI Passport Photo Generator';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to right, #09090b, #171717)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '32px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '60px 100px',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div
            style={{
              fontSize: 84,
              fontWeight: 800,
              letterSpacing: '-0.05em',
              background: 'linear-gradient(to right, #d97706, #fcd34d)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: 24,
            }}
          >
            PrintSyte
          </div>
          <div
            style={{
              fontSize: 42,
              fontWeight: 600,
              color: '#d1d5db',
              textAlign: 'center',
              maxWidth: '800px',
              lineHeight: 1.4,
              marginBottom: 48,
            }}
          >
            Free AI Passport Photo Generator
          </div>
          <div
            style={{
              display: 'flex',
              gap: '24px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(245, 158, 11, 0.1)',
                padding: '16px 32px',
                borderRadius: '999px',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                color: '#fcd34d',
                fontSize: 28,
                fontWeight: 500,
              }}
            >
              Background Removal
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(245, 158, 11, 0.1)',
                padding: '16px 32px',
                borderRadius: '999px',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                color: '#fcd34d',
                fontSize: 28,
                fontWeight: 500,
              }}
            >
              Print-Ready Sheets
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}