import { useState } from 'react';
import type { CthulhuSheetData } from '../types/cthulhu';

interface BasicInfoFormProps {
  data: CthulhuSheetData;
  onChange: (data: CthulhuSheetData) => void;
}

export const BasicInfoForm = ({ data, onChange }: BasicInfoFormProps) => {
  const updateBasicInfo = (field: 'playerName' | 'occupation' | 'gender' | 'birthplace', value: string) => {
    const updated = { ...data, [field]: value };
    onChange(updated);
  };

  const updateAge = (value: number | undefined) => {
    const updated = { ...data, age: value };
    onChange(updated);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
          プレイヤー名
        </label>
        <input
          type="text"
          value={data.playerName || ''}
          onChange={(e) => updateBasicInfo('playerName', e.target.value)}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
          職業
        </label>
        <input
          type="text"
          value={data.occupation || ''}
          onChange={(e) => updateBasicInfo('occupation', e.target.value)}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
          年齢
        </label>
        <input
          type="number"
          value={data.age || ''}
          onChange={(e) => updateAge(e.target.value ? parseInt(e.target.value) : undefined)}
          min="0"
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
          性別
        </label>
        <input
          type="text"
          value={data.gender || ''}
          onChange={(e) => updateBasicInfo('gender', e.target.value)}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
          出身地
        </label>
        <input
          type="text"
          value={data.birthplace || ''}
          onChange={(e) => updateBasicInfo('birthplace', e.target.value)}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      </div>
    </div>
  );
};

