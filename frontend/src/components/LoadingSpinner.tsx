interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  message?: string;
}

export const LoadingSpinner = ({ size = 'medium', fullScreen = false, message }: LoadingSpinnerProps) => {
  const sizeMap = {
    small: '1rem',
    medium: '2rem',
    large: '3rem',
  };

  const spinner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div
        style={{
          width: sizeMap[size],
          height: sizeMap[size],
          border: `3px solid #f3f3f3`,
          borderTop: `3px solid #007bff`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      {message && (
        <div style={{ color: '#6c757d', fontSize: '0.875rem' }}>{message}</div>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
      >
        {spinner}
      </div>
    );
  }

  return spinner;
};






