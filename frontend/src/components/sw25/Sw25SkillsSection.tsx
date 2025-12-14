import type { Sw25Skill, Sw25Class } from '../../types/sw25';
import { SW25_SKILLS } from '../../data/sw25';
import { calculateAdventurerLevel, calculateMaxSkills } from '../../utils/sw25';

interface Sw25SkillsSectionProps {
  skills: Sw25Skill[];
  classes: Sw25Class[];
  onAddSkill: () => void;
  onUpdateSkill: (index: number, field: 'name' | 'effect' | 'memo', value: string) => void;
  onRemoveSkill: (index: number) => void;
}

export const Sw25SkillsSection = ({
  skills,
  classes,
  onAddSkill,
  onUpdateSkill,
  onRemoveSkill,
}: Sw25SkillsSectionProps) => {
  // 冒険者レベルの計算
  const adventurerLevel = calculateAdventurerLevel(classes);
  const maxSkills = calculateMaxSkills(adventurerLevel);

  // 自動追加された戦闘特技と手動追加された戦闘特技を分ける
  const autoSkills = skills.filter(skill => {
    const skillData = SW25_SKILLS.find(s => s.name === skill.name);
    return skillData?.category === '自動';
  });
  const manualSkills = skills.filter(skill => {
    const skillData = SW25_SKILLS.find(s => s.name === skill.name);
    return skillData?.category !== '自動';
  });

  // 修得可能数のカウントは手動の戦闘特技数のみ
  const currentSkills = manualSkills.length;
  const canAddSkill = currentSkills < maxSkills;

  // スキル名を変更する際の特別な処理
  const handleSkillNameChange = (skill: Sw25Skill, newName: string) => {
    const originalIndex = skills.findIndex(s => s === skill);
    const selectedSkill = SW25_SKILLS.find(s => s.name === newName);
    if (selectedSkill && originalIndex !== -1) {
      // 名前を変更
      onUpdateSkill(originalIndex, 'name', newName);
      // 効果も自動的に更新
      onUpdateSkill(originalIndex, 'effect', selectedSkill.effect);
    }
  };

  return (
    <>
      <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>冒険者レベル: {adventurerLevel}</strong>
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>修得可能数: {maxSkills}個</strong>（レベル{adventurerLevel % 2 === 1 ? adventurerLevel : adventurerLevel - 1}で{maxSkills}個）
        </div>
        <div>
          <strong>現在の戦闘特技数: {currentSkills}個</strong>
          {autoSkills.length > 0 && (
            <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
              （自動: {autoSkills.length}個、手動: {manualSkills.length}個）
            </span>
          )}
        </div>
      </div>

      {/* 自動追加された戦闘特技 */}
      {autoSkills.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 'bold', color: '#666' }}>
            自動追加された戦闘特技
          </h4>
          {autoSkills.map((skill) => {
            const originalIndex = skills.findIndex(s => s === skill);
            const skillData = SW25_SKILLS.find(s => s.name === skill.name);
            return (
              <div key={originalIndex} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>{skill.name}</strong>
                  {skillData && skillData.requirements && (
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                      ({skillData.requirements})
                    </span>
                  )}
                </div>
                <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                  {skill.effect}
                </div>
                {skill.memo && (
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>
                    備考: {skill.memo}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 手動追加された戦闘特技 */}
      <div style={{ marginBottom: '1rem' }}>
        {canAddSkill && (
          <button
            type="button"
            onClick={onAddSkill}
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
            + 戦闘特技を追加（残り{maxSkills - currentSkills}個）
          </button>
        )}
        {!canAddSkill && (
          <div style={{ padding: '0.5rem', backgroundColor: '#fff3cd', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            修得可能数の上限に達しています。戦闘特技を追加するには冒険者レベルを上げてください。
          </div>
        )}
      </div>
      {manualSkills.map((skill) => {
        const originalIndex = skills.findIndex(s => s === skill);
        const skillData = SW25_SKILLS.find(s => s.name === skill.name);
        return (
          <div key={originalIndex} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', marginBottom: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  戦闘特技名
                </label>
                <select
                  value={skill.name}
                  onChange={(e) => handleSkillNameChange(skill, e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="">選択してください</option>
                  {SW25_SKILLS.filter(s => s.category !== '自動').map(s => (
                    <option key={s.name} value={s.name}>
                      {s.name} {s.requirements ? `(${s.requirements})` : ''}
                    </option>
                  ))}
                </select>
                {skillData && skillData.requirements && (
                  <div style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#666' }}>
                    習得条件: {skillData.requirements}
                  </div>
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => onRemoveSkill(originalIndex)}
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
            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                効果
              </label>
              <textarea
                value={skill.effect}
                onChange={(e) => onUpdateSkill(originalIndex, 'effect', e.target.value)}
                placeholder="効果を入力"
                rows={2}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                備考
              </label>
              <input
                type="text"
                value={skill.memo || ''}
                onChange={(e) => onUpdateSkill(originalIndex, 'memo', e.target.value)}
                placeholder="備考を入力"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          </div>
        );
      })}
    </>
  );
};
