import type { Sw25Weapon, Sw25Armor, Sw25Accessory, Sw25Item } from '../../types/sw25';

interface Sw25EquipmentSectionProps {
  weapons: Sw25Weapon[];
  armors: Sw25Armor[];
  accessories: Sw25Accessory[];
  items: Sw25Item[];
  money?: number;
  onAddWeapon: () => void;
  onUpdateWeapon: (index: number, field: keyof Sw25Weapon, value: any) => void;
  onRemoveWeapon: (index: number) => void;
  onAddArmor: () => void;
  onUpdateArmor: (index: number, field: keyof Sw25Armor, value: any) => void;
  onRemoveArmor: (index: number) => void;
  onAddAccessory: () => void;
  onUpdateAccessory: (index: number, field: keyof Sw25Accessory, value: any) => void;
  onRemoveAccessory: (index: number) => void;
  onAddItem: () => void;
  onUpdateItem: (index: number, field: keyof Sw25Item, value: any) => void;
  onRemoveItem: (index: number) => void;
  onUpdateMoney: (value: number | undefined) => void;
}

export const Sw25EquipmentSection = ({
  weapons,
  armors,
  accessories,
  items,
  money,
  onAddWeapon,
  onUpdateWeapon,
  onRemoveWeapon,
  onAddArmor,
  onUpdateArmor,
  onRemoveArmor,
  onAddAccessory,
  onUpdateAccessory,
  onRemoveAccessory,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onUpdateMoney,
}: Sw25EquipmentSectionProps) => {
  return (
    <>
      {/* 武器 */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 'bold' }}>武器</h4>
        <button
          type="button"
          onClick={onAddWeapon}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '1rem',
          }}
        >
          + 武器を追加
        </button>
        {weapons.map((weapon, index) => (
          <div key={index} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', marginBottom: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  武器名
                </label>
                <input
                  type="text"
                  value={weapon.name}
                  onChange={(e) => onUpdateWeapon(index, 'name', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => onRemoveWeapon(index)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '1.5rem',
                  }}
                >
                  削除
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  用法
                </label>
                <input
                  type="text"
                  value={weapon.usage || ''}
                  onChange={(e) => onUpdateWeapon(index, 'usage', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  必筋
                </label>
                <input
                  type="number"
                  min="0"
                  value={weapon.requiredStrength || 0}
                  onChange={(e) => onUpdateWeapon(index, 'requiredStrength', e.target.value ? parseInt(e.target.value) : 0)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  命中
                </label>
                <input
                  type="number"
                  value={weapon.hit}
                  onChange={(e) => onUpdateWeapon(index, 'hit', parseInt(e.target.value) || 0)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  威力
                </label>
                <input
                  type="text"
                  value={weapon.power || ''}
                  onChange={(e) => onUpdateWeapon(index, 'power', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  C値
                </label>
                <input
                  type="number"
                  min="0"
                  value={weapon.criticalValue || 0}
                  onChange={(e) => onUpdateWeapon(index, 'criticalValue', e.target.value ? parseInt(e.target.value) : 0)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  追加ダメージ
                </label>
                <input
                  type="number"
                  value={weapon.additionalDamage || 0}
                  onChange={(e) => onUpdateWeapon(index, 'additionalDamage', e.target.value ? parseInt(e.target.value) : 0)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  価格
                </label>
                <input
                  type="number"
                  min="0"
                  value={weapon.price || 0}
                  onChange={(e) => onUpdateWeapon(index, 'price', e.target.value ? parseInt(e.target.value) : 0)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  参照ページ
                </label>
                <input
                  type="text"
                  value={weapon.referencePage || ''}
                  onChange={(e) => onUpdateWeapon(index, 'referencePage', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                備考
              </label>
              <input
                type="text"
                value={weapon.memo || ''}
                onChange={(e) => onUpdateWeapon(index, 'memo', e.target.value)}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 防具 */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 'bold' }}>防具</h4>
        <button
          type="button"
          onClick={onAddArmor}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '1rem',
          }}
        >
          + 防具を追加
        </button>
        {armors.map((armor, index) => (
          <div key={index} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', marginBottom: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  防具名
                </label>
                <input
                  type="text"
                  value={armor.name}
                  onChange={(e) => onUpdateArmor(index, 'name', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => onRemoveArmor(index)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '1.5rem',
                  }}
                >
                  削除
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  タイプ
                </label>
                <select
                  value={armor.type || ''}
                  onChange={(e) => onUpdateArmor(index, 'type', e.target.value ? (e.target.value as '鎧' | '盾') : undefined)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="">選択してください</option>
                  <option value="鎧">鎧</option>
                  <option value="盾">盾</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  必筋
                </label>
                <input
                  type="number"
                  min="0"
                  value={armor.requiredStrength || 0}
                  onChange={(e) => onUpdateArmor(index, 'requiredStrength', e.target.value ? parseInt(e.target.value) : 0)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  回避
                </label>
                <input
                  type="number"
                  value={armor.dodge || 0}
                  onChange={(e) => onUpdateArmor(index, 'dodge', e.target.value ? parseInt(e.target.value) : 0)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  防護点
                </label>
                <input
                  type="number"
                  value={armor.defense}
                  onChange={(e) => onUpdateArmor(index, 'defense', parseInt(e.target.value) || 0)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  価格
                </label>
                <input
                  type="number"
                  min="0"
                  value={armor.price || 0}
                  onChange={(e) => onUpdateArmor(index, 'price', e.target.value ? parseInt(e.target.value) : 0)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  参照ページ
                </label>
                <input
                  type="text"
                  value={armor.referencePage || ''}
                  onChange={(e) => onUpdateArmor(index, 'referencePage', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                備考
              </label>
              <input
                type="text"
                value={armor.memo || ''}
                onChange={(e) => onUpdateArmor(index, 'memo', e.target.value)}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 装飾品 */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 'bold' }}>装飾品</h4>
        <button
          type="button"
          onClick={onAddAccessory}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '1rem',
          }}
        >
          + 装飾品を追加
        </button>
        {accessories.map((accessory, index) => (
          <div key={index} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', marginBottom: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  装飾品名
                </label>
                <input
                  type="text"
                  value={accessory.name}
                  onChange={(e) => onUpdateAccessory(index, 'name', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => onRemoveAccessory(index)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '1.5rem',
                  }}
                >
                  削除
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  装備スロット
                </label>
                <select
                  value={accessory.slot || ''}
                  onChange={(e) => onUpdateAccessory(index, 'slot', e.target.value as any || undefined)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="">選択してください</option>
                  <option value="頭">頭</option>
                  <option value="耳">耳</option>
                  <option value="顔">顔</option>
                  <option value="首">首</option>
                  <option value="背中">背中</option>
                  <option value="右手">右手</option>
                  <option value="左手">左手</option>
                  <option value="腰">腰</option>
                  <option value="足">足</option>
                  <option value="他">他</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  価格
                </label>
                <input
                  type="number"
                  min="0"
                  value={accessory.price || 0}
                  onChange={(e) => onUpdateAccessory(index, 'price', e.target.value ? parseInt(e.target.value) : 0)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  参照ページ
                </label>
                <input
                  type="text"
                  value={accessory.referencePage || ''}
                  onChange={(e) => onUpdateAccessory(index, 'referencePage', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                備考
              </label>
              <input
                type="text"
                value={accessory.memo || ''}
                onChange={(e) => onUpdateAccessory(index, 'memo', e.target.value)}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 所持金 */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 'bold' }}>所持金</h4>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            所持金（ガメル）
          </label>
          <input
            type="number"
            min="0"
            value={money || ''}
            onChange={(e) => onUpdateMoney(e.target.value ? parseInt(e.target.value) : undefined)}
            style={{ width: '200px', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
      </div>

      {/* アイテム */}
      <div>
        <h4 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 'bold' }}>アイテム</h4>
        <button
          type="button"
          onClick={onAddItem}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '1rem',
          }}
        >
          + アイテムを追加
        </button>
        {items.map((item, index) => (
          <div key={index} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', marginBottom: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  アイテム名
                </label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => onUpdateItem(index, 'name', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => onRemoveItem(index)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '1.5rem',
                  }}
                >
                  削除
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  数量
                </label>
                <input
                  type="number"
                  min="0"
                  value={item.quantity}
                  onChange={(e) => onUpdateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  参照ページ
                </label>
                <input
                  type="text"
                  value={item.referencePage || ''}
                  onChange={(e) => onUpdateItem(index, 'referencePage', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  価格
                </label>
                <input
                  type="number"
                  min="0"
                  value={item.price || 0}
                  onChange={(e) => onUpdateItem(index, 'price', e.target.value ? parseInt(e.target.value) : 0)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                備考
              </label>
              <input
                type="text"
                value={item.memo || ''}
                onChange={(e) => onUpdateItem(index, 'memo', e.target.value)}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};



