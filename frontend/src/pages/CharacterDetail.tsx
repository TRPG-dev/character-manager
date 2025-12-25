import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCopy, FiEdit, FiGlobe, FiLock, FiShare2, FiTrash2, FiX } from 'react-icons/fi';
import { useAuth } from '../auth/useAuth';
import { getCharacter, deleteCharacter, publishCharacter, exportCocofolia } from '../services/api';
import type { Character, SystemEnum } from '../services/api';
import { CthulhuSheetView } from '../components/CthulhuSheetView';
import type { CthulhuSheetData, CthulhuSkill } from '../types/cthulhu';
import { normalizeSheetData as normalizeCthulhuSheetData } from '../utils/cthulhu';
import { Tabs } from '../components/Tabs';
import { ShinobigamiSheetView } from '../components/ShinobigamiSheetView';
import type { ShinobigamiSheetData } from '../types/shinobigami';
import { normalizeSheetData as normalizeShinobigamiSheetData } from '../utils/shinobigami';
import { Sw25SheetView } from '../components/Sw25SheetView';
import type { Sw25SheetData } from '../types/sw25';
import { normalizeSheetData as normalizeSw25SheetData } from '../utils/sw25';
import { CharacterSheetView } from '../components/CharacterSheetView';
import { ImageModal } from '../components/ImageModal';
import { useToast } from '../contexts/ToastContext';
import { handleApiError, formatErrorMessage } from '../utils/errorHandler';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { IconText } from '../components/IconText';

const SYSTEM_NAMES: Record<SystemEnum, string> = {
  cthulhu: 'クトゥルフ神話TRPG（旧）',
  cthulhu6: 'クトゥルフ神話TRPG 第6版',
  cthulhu7: 'クトゥルフ神話TRPG 第7版',
  shinobigami: 'シノビガミ',
  sw25: 'ソードワールド2.5',
  satasupe: 'サタスペ',
};

export const CharacterDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, getAccessToken } = useAuth();
  const { showSuccess, showError } = useToast();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isCocofoliaModalOpen, setIsCocofoliaModalOpen] = useState(false);
  const [cocofoliaSkillScope, setCocofoliaSkillScope] = useState<'changed' | 'all'>('changed');
  const [cocofoliaDice, setCocofoliaDice] = useState<'CCB' | 'CC'>('CCB');
  const [cocofoliaIncludeIcon, setCocofoliaIncludeIcon] = useState(false);
  const [cocofoliaLoading, setCocofoliaLoading] = useState(false);
  const [cocofoliaText, setCocofoliaText] = useState<string>('');

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const fetchCharacter = async () => {
      if (!id || !isAuthenticated) return;
      
      setLoading(true);
      try {
        const token = await getAccessToken();
        if (token) {
          const char = await getCharacter(token, id);
          setCharacter(char);
          // 所有者かどうかの判定（簡易版、実際にはuser情報と比較）
          setIsOwner(true); // 認証済みなので所有者と仮定
        }
      } catch (error) {
        console.error('Failed to fetch character:', error);
        const apiError = handleApiError(error);
        showError(formatErrorMessage(apiError));
      } finally {
        setLoading(false);
      }
    };
    fetchCharacter();
  }, [id, isAuthenticated]);

  const handleDelete = async () => {
    if (!id || !confirm('本当に削除しますか？')) return;
    
    try {
      const token = await getAccessToken();
      if (token) {
        await deleteCharacter(token, id);
        showSuccess('キャラクターを削除しました');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Failed to delete character:', error);
      const apiError = handleApiError(error);
      showError(formatErrorMessage(apiError));
    }
  };

  const handleTogglePublish = async () => {
    if (!character || !id) return;
    
    try {
      const token = await getAccessToken();
      if (token) {
        const response = await publishCharacter(token, id, !character.is_public);
        setCharacter({ ...character, is_public: response.is_public, share_token: response.share_token });
        showSuccess(character.is_public ? '非公開にしました' : '公開しました');
      }
    } catch (error) {
      console.error('Failed to toggle publish:', error);
      const apiError = handleApiError(error);
      showError(formatErrorMessage(apiError));
    }
  };

  const copyShareLink = () => {
    if (character?.share_token) {
      const shareUrl = `${window.location.origin}/share/${character.share_token}`;
      navigator.clipboard.writeText(shareUrl);
      showSuccess('共有リンクをコピーしました');
    }
  };

  const openCocofoliaModal = () => {
    setCocofoliaSkillScope('changed');
    setCocofoliaDice('CCB');
    setCocofoliaIncludeIcon(false);
    setCocofoliaText('');
    setIsCocofoliaModalOpen(true);
  };

  const handleCocofoliaExport = async () => {
    if (!id || !character) return;
    setCocofoliaLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) return;
      const res = await exportCocofolia(token, id, {
        system: character.system,
        skill_scope: cocofoliaSkillScope,
        dice: cocofoliaDice,
        include_icon: cocofoliaIncludeIcon,
      });
      setCocofoliaText(res.clipboardText);
      await navigator.clipboard.writeText(res.clipboardText);
      showSuccess('ココフォリア用データをコピーしました');
    } catch (error) {
      console.error('Failed to export cocofolia:', error);
      const apiError = handleApiError(error);
      showError(formatErrorMessage(apiError));
    } finally {
      setCocofoliaLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="キャラクターを読み込み中..." />;
  }

  if (!character) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h2>キャラクターが見つかりません</h2>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-text-inverse)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          <IconText icon={<FiArrowLeft />}>マイページに戻る</IconText>
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', margin: '0 auto'}}>
      {/* ヘッダーセクション */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--color-secondary)',
              color: 'var(--color-text-inverse)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            <IconText icon={<FiArrowLeft />}>マイページに戻る</IconText>
          </button>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 'bold' }}>キャラクター詳細</h1>
          </div>
          {isOwner && (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate(`/characters/${id}/edit`)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-text-inverse)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                <IconText icon={<FiEdit />}>編集</IconText>
              </button>
              {(character.system === 'cthulhu' || character.system === 'cthulhu6' || character.system === 'cthulhu7') && (
                <button
                  onClick={openCocofoliaModal}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--color-secondary)',
                    color: 'var(--color-text-inverse)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                  }}
                >
                  <IconText icon={<FiShare2 />}>ココフォリア出力</IconText>
                </button>
              )}
              <button
                onClick={handleTogglePublish}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: character.is_public ? 'var(--color-warning)' : 'var(--color-success)',
                  color: 'var(--color-text-inverse)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                {character.is_public ? (
                  <IconText icon={<FiLock />}>非公開</IconText>
                ) : (
                  <IconText icon={<FiGlobe />}>公開</IconText>
                )}
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--color-danger)',
                  color: 'var(--color-text-inverse)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                <IconText icon={<FiTrash2 />}>削除</IconText>
              </button>
            </div>
          )}
        </div>

        {character.is_public && character.share_token && isOwner && (
          <div style={{ 
            marginBottom: '1.5rem', 
            padding: '1rem', 
            backgroundColor: 'color-mix(in srgb, var(--color-info) 14%, white)', 
            borderRadius: '8px',
            border: '1px solid color-mix(in srgb, var(--color-info) 25%, var(--color-border))'
          }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', fontSize: '0.875rem' }}>共有リンク:</p>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <code style={{ 
                flex: 1, 
                minWidth: '200px',
                padding: '0.5rem', 
                backgroundColor: 'var(--color-surface)', 
                borderRadius: '4px',
                fontSize: '0.875rem',
                wordBreak: 'break-all'
              }}>
                {window.location.origin}/share/{character.share_token}
              </code>
              <button
                onClick={copyShareLink}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-text-inverse)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  whiteSpace: 'nowrap',
                }}
              >
                <IconText icon={<FiCopy />}>コピー</IconText>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* クトゥルフの場合 */}
      {(character.system === 'cthulhu' || character.system === 'cthulhu6' || character.system === 'cthulhu7') ? (
        // 第6版・第7版の場合は新しいタブ形式の表示
        (character.system === 'cthulhu6' || character.system === 'cthulhu7') ? (
          (() => {
            const sheetData = normalizeCthulhuSheetData(character.sheet_data, character.system as any) as CthulhuSheetData;
            const isCthulhu7 = character.system === 'cthulhu7';
            
            // ヘルパー関数
            const filterUnchangedSkills = (skills: CthulhuSkill[]): CthulhuSkill[] => {
              return skills.filter(skill => {
                const total = skill.total ?? skill.baseValue ?? 0;
                const baseValue = skill.baseValue ?? 0;
                return total !== baseValue;
              });
            };
            
            const formatSkillName = (skill: CthulhuSkill): string => {
              const suffix = (skill.specialty || '').trim();
              return suffix ? `${skill.name}(${suffix})` : skill.name;
            };
            
            const filteredSkills = filterUnchangedSkills(sheetData.skills);
            const filteredCombatSkills = sheetData.combatSkills 
              ? filterUnchangedSkills(sheetData.combatSkills)
              : [];
            
            const attributeLabels: Record<string, string> = {
              STR: 'STR (筋力)',
              CON: 'CON (体力)',
              POW: 'POW (精神力)',
              DEX: 'DEX (敏捷性)',
              APP: 'APP (外見)',
              INT: 'INT (知性)',
              EDU: 'EDU (教育)',
              SIZ: 'SIZ (体格)',
            };
            
            // タブコンテンツの生成
            const tabItems = [];
            
            // 能力値・派生値タブ
            tabItems.push({
              label: '能力値・派生値',
              content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* 能力値 */}
                  <div>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem' }}>能力値</h3>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                      gap: '1rem' 
                    }}>
                      {(Object.keys(sheetData.attributes) as Array<keyof typeof sheetData.attributes>)
                        .filter(key => key !== 'LUK') // LUK(幸運)は表示しない
                        .map((key) => (
                        <div key={key}>
                          <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                            {attributeLabels[key as string]}
                          </div>
                          <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                            {sheetData.attributes[key]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* 派生値 */}
                  <div>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem' }}>派生値</h3>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                      gap: '1rem' 
                    }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>SAN (現在)</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.derived.SAN_current}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>SAN (最大)</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.derived.SAN_max}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>HP (現在)</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.derived.HP_current}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>HP (最大)</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.derived.HP_max}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>MP (現在)</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.derived.MP_current}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>MP (最大)</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.derived.MP_max}</div>
                      </div>
                      {sheetData.derived.IDEA !== undefined && (
                        <div>
                          <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>アイデア</div>
                          <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.derived.IDEA}</div>
                        </div>
                      )}
                      {sheetData.derived.KNOW !== undefined && (
                        <div>
                          <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>知識</div>
                          <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.derived.KNOW}</div>
                        </div>
                      )}
                      {sheetData.derived.DB && (
                        <div>
                          <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>ダメージボーナス</div>
                          <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.derived.DB}</div>
                        </div>
                      )}
                      {isCthulhu7 && sheetData.derived.BUILD !== undefined && (
                        <div>
                          <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>ビルド</div>
                          <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.derived.BUILD}</div>
                        </div>
                      )}
                      {isCthulhu7 && sheetData.derived.MOV !== undefined && (
                        <div>
                          <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>移動力</div>
                          <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.derived.MOV}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            });
            
            // 技能・格闘技能タブ
            tabItems.push({
              label: '技能・格闘技能',
              content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* 技能 */}
                  {(filteredSkills.length > 0 || (sheetData.customSkills && sheetData.customSkills.length > 0)) && (
                    <div>
                      <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem' }}>技能</h3>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                        gap: '1rem' 
                      }}>
                        {filteredSkills.map((skill, index) => (
                          <div key={`default-${index}`}>
                            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>{formatSkillName(skill)}</div>
                            <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                              {skill.total ?? skill.baseValue ?? 0}
                            </div>
                          </div>
                        ))}
                        {(sheetData.customSkills || []).map((skill, index) => (
                          <div key={`custom-${index}`}>
                            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>{skill.name ? formatSkillName(skill) : '(無名)'}</div>
                            <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                              {skill.total ?? skill.baseValue ?? 0}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* 格闘技能 */}
                  {filteredCombatSkills.length > 0 && (
                    <div>
                      <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem' }}>格闘技能</h3>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                        gap: '1rem' 
                      }}>
                        {filteredCombatSkills.map((skill, index) => (
                          <div key={`combat-${index}`}>
                            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>{formatSkillName(skill)}</div>
                            <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                              {skill.total ?? skill.baseValue ?? 0}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            });
            
            // 武器タブ
            if ((sheetData.weapons || []).length > 0) {
              tabItems.push({
                label: '武器',
                content: (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                    gap: '1rem' 
                  }}>
                    {(sheetData.weapons || []).map((weapon, index) => (
                      <div
                        key={index}
                        style={{
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          padding: '1rem',
                          backgroundColor: '#f8f9fa',
                        }}
                      >
                        <h3 style={{ marginTop: 0, marginBottom: '0.75rem', fontSize: '1.125rem' }}>
                          {weapon.name || '(無名の武器)'}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                          <div>
                            <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>技能値</div>
                            <div style={{ fontWeight: 'bold' }}>{weapon.value}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>ダメージ</div>
                            <div style={{ fontWeight: 'bold' }}>{weapon.damage || '-'}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>射程</div>
                            <div style={{ fontWeight: 'bold' }}>{weapon.range || '-'}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>攻撃回数</div>
                            <div style={{ fontWeight: 'bold' }}>{weapon.attacks}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>装弾数</div>
                            <div style={{ fontWeight: 'bold' }}>{weapon.ammo}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>故障</div>
                            <div style={{ fontWeight: 'bold' }}>{weapon.malfunction}</div>
                          </div>
                          {!isCthulhu7 && weapon.durability && (
                            <div>
                              <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>耐久力</div>
                              <div style={{ fontWeight: 'bold' }}>{weapon.durability}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              });
            }
            
            // 所持品・財産タブ
            if ((sheetData.items || []).length > 0 || sheetData.cash || sheetData.assets) {
              tabItems.push({
                label: '所持品・財産',
                content: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* 所持品 */}
                    {(sheetData.items || []).length > 0 && (
                      <div>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem' }}>所持品</h3>
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                          gap: '0.75rem' 
                        }}>
                          {(sheetData.items || []).map((item, index) => (
                            <div
                              key={index}
                              style={{
                                padding: '0.75rem',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '4px',
                                border: '1px solid #dee2e6',
                              }}
                            >
                              <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                                {item.name || '(無名のアイテム)'}
                              </div>
                              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                                数量: ×{item.quantity}
                              </div>
                              {item.detail && (
                                <div style={{ fontSize: '0.875rem', color: '#495057', marginTop: '0.5rem' }}>
                                  {item.detail}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* 財産 */}
                    {(sheetData.cash || sheetData.assets) && (
                      <div>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem' }}>財産</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                          {sheetData.cash && (
                            <div>
                              <h4 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>現金・財産</h4>
                              <div
                                style={{
                                  padding: '1rem',
                                  backgroundColor: '#f8f9fa',
                                  borderRadius: '4px',
                                  border: '1px solid #dee2e6',
                                  whiteSpace: 'pre-wrap',
                                  lineHeight: '1.6',
                                }}
                              >
                                {sheetData.cash}
                              </div>
                            </div>
                          )}
                          {sheetData.assets && (
                            <div>
                              <h4 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>資産</h4>
                              <div
                                style={{
                                  padding: '1rem',
                                  backgroundColor: '#f8f9fa',
                                  borderRadius: '4px',
                                  border: '1px solid #dee2e6',
                                  whiteSpace: 'pre-wrap',
                                  lineHeight: '1.6',
                                }}
                              >
                                {sheetData.assets}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              });
            }
            
            // 通過したシナリオタブ
            if ((sheetData.scenarios && sheetData.scenarios.length > 0)) {
              tabItems.push({
                label: '通過したシナリオ',
                content: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {sheetData.scenarios.map((scenario, index) => (
                      <div
                        key={index}
                        style={{
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          padding: '1rem',
                          backgroundColor: '#f8f9fa',
                        }}
                      >
                        <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.125rem' }}>
                          {scenario.name || '(無名のシナリオ)'}
                        </h3>
                        {scenario.memo && (
                          <div
                            style={{
                              padding: '0.75rem',
                              backgroundColor: '#fff',
                              borderRadius: '4px',
                              whiteSpace: 'pre-wrap',
                              lineHeight: '1.6',
                              fontSize: '0.875rem',
                            }}
                          >
                            {scenario.memo}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              });
            }
            
            // 第7版: バックストーリータブ / 第6版: 魔導書・呪文・アーティファクト・遭遇した超自然の存在タブ
            if (isCthulhu7) {
              tabItems.push({
                label: 'バックストーリー',
                content: (() => {
                  const fields: Array<{ key: string; label: string }> = [
                    { key: 'appearance', label: '容姿の描写' },
                    { key: 'traits', label: '特徴' },
                    { key: 'beliefs', label: 'イデオロギー/信念' },
                    { key: 'injuries', label: '負傷、傷跡' },
                    { key: 'importantPeople', label: '重要な人々' },
                    { key: 'phobiasManias', label: '恐怖症、マニア' },
                    { key: 'meaningfulPlaces', label: '意味のある場所' },
                    { key: 'treasuredPossessions', label: '秘蔵の品' },
                  ];
                  
                  // 入力された内容がある項目のみ表示（memoまたはisKeyがtrueの場合）
                  const entries = fields
                    .map((f) => {
                      const entry = (sheetData.backstory7 as any)?.[f.key];
                      return {
                        ...f,
                        memo: entry?.memo ?? '',
                        isKey: !!entry?.isKey,
                      };
                    })
                    .filter((f) => (f.memo && f.memo.trim().length > 0) || f.isKey);
                  
                  const mythosSections = [
                    { title: '魔導書', items: sheetData.mythosBooks || [] },
                    { title: '呪文', items: sheetData.spells || [] },
                    { title: 'アーティファクト', items: sheetData.artifacts || [] },
                    { title: '遭遇した超自然の存在', items: sheetData.encounteredEntities || [] },
                  ].filter((s) => (s.items || []).length > 0);
                  
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {entries.length > 0 && (
                        entries.map((e) => (
                          <div key={e.key} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem', backgroundColor: '#f8f9fa' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.125rem' }}>
                              {e.isKey ? `${e.label}★` : e.label}
                            </h3>
                            {e.memo && (
                              <div style={{ padding: '0.75rem', backgroundColor: '#fff', borderRadius: '4px', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                {e.memo}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                      
                      {mythosSections.length > 0 && (
                        <div>
                          {mythosSections.map((sec) => (
                            <div key={sec.title} style={{ marginTop: '1rem' }}>
                              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>{sec.title}</h3>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {sec.items.map((it: any, idx: number) => (
                                  <div key={idx} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem', backgroundColor: '#f8f9fa' }}>
                                    <h4 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1rem' }}>
                                      {(it?.name || '(無名)') + (it?.isKey ? '★' : '')}
                                    </h4>
                                    {it?.memo && (
                                      <div style={{ padding: '0.75rem', backgroundColor: '#fff', borderRadius: '4px', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.875rem' }}>
                                        {it.memo}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {sheetData.notes && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>その他のメモ</h3>
                          <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                            {sheetData.notes}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              });
            } else {
              // 第6版: 魔導書・呪文・アーティファクト・遭遇した超自然の存在タブ
              if ((sheetData.mythosBooks && sheetData.mythosBooks.length > 0) ||
                  (sheetData.spells && sheetData.spells.length > 0) ||
                  (sheetData.artifacts && sheetData.artifacts.length > 0) ||
                  (sheetData.encounteredEntities && sheetData.encounteredEntities.length > 0)) {
                tabItems.push({
                  label: '魔導書・呪文・アーティファクト・遭遇した超自然の存在',
                  content: (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                      {/* 魔導書 */}
                      {(sheetData.mythosBooks && sheetData.mythosBooks.length > 0) && (
                        <div>
                          <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>魔導書</h3>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                            {sheetData.mythosBooks.map((item, index) => (
                              <div
                                key={index}
                                style={{
                                  border: '1px solid #ddd',
                                  borderRadius: '4px',
                                  padding: '1rem',
                                  backgroundColor: '#f8f9fa',
                                }}
                              >
                                <h4 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1rem' }}>
                                  {item.name || '(無名の魔導書)'}
                                </h4>
                                {item.memo && (
                                  <div
                                    style={{
                                      padding: '0.75rem',
                                      backgroundColor: '#fff',
                                      borderRadius: '4px',
                                      whiteSpace: 'pre-wrap',
                                      lineHeight: '1.6',
                                      fontSize: '0.875rem',
                                    }}
                                  >
                                    {item.memo}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* 呪文 */}
                      {(sheetData.spells && sheetData.spells.length > 0) && (
                        <div>
                          <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>呪文</h3>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                            {sheetData.spells.map((item, index) => (
                              <div
                                key={index}
                                style={{
                                  border: '1px solid #ddd',
                                  borderRadius: '4px',
                                  padding: '1rem',
                                  backgroundColor: '#f8f9fa',
                                }}
                              >
                                <h4 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1rem' }}>
                                  {item.name || '(無名の呪文)'}
                                </h4>
                                {item.memo && (
                                  <div
                                    style={{
                                      padding: '0.75rem',
                                      backgroundColor: '#fff',
                                      borderRadius: '4px',
                                      whiteSpace: 'pre-wrap',
                                      lineHeight: '1.6',
                                      fontSize: '0.875rem',
                                    }}
                                  >
                                    {item.memo}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* アーティファクト */}
                      {(sheetData.artifacts && sheetData.artifacts.length > 0) && (
                        <div>
                          <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>アーティファクト</h3>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                            {sheetData.artifacts.map((item, index) => (
                              <div
                                key={index}
                                style={{
                                  border: '1px solid #ddd',
                                  borderRadius: '4px',
                                  padding: '1rem',
                                  backgroundColor: '#f8f9fa',
                                }}
                              >
                                <h4 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1rem' }}>
                                  {item.name || '(無名のアーティファクト)'}
                                </h4>
                                {item.memo && (
                                  <div
                                    style={{
                                      padding: '0.75rem',
                                      backgroundColor: '#fff',
                                      borderRadius: '4px',
                                      whiteSpace: 'pre-wrap',
                                      lineHeight: '1.6',
                                      fontSize: '0.875rem',
                                    }}
                                  >
                                    {item.memo}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* 遭遇した超自然の存在 */}
                      {(sheetData.encounteredEntities && sheetData.encounteredEntities.length > 0) && (
                        <div>
                          <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>遭遇した超自然の存在</h3>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                            {sheetData.encounteredEntities.map((item, index) => (
                              <div
                                key={index}
                                style={{
                                  border: '1px solid #ddd',
                                  borderRadius: '4px',
                                  padding: '1rem',
                                  backgroundColor: '#f8f9fa',
                                }}
                              >
                                <h4 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1rem' }}>
                                  {item.name || '(無名の存在)'}
                                </h4>
                                {item.memo && (
                                  <div
                                    style={{
                                      padding: '0.75rem',
                                      backgroundColor: '#fff',
                                      borderRadius: '4px',
                                      whiteSpace: 'pre-wrap',
                                      lineHeight: '1.6',
                                      fontSize: '0.875rem',
                                    }}
                                  >
                                    {item.memo}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                });
              }
              
              // 第6版: 背景・その他タブ
              if (sheetData.backstory || sheetData.notes) {
                tabItems.push({
                  label: '背景・その他',
                  content: (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {sheetData.backstory && (
                        <div>
                          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>背景</h3>
                          <div
                            style={{
                              padding: '1rem',
                              backgroundColor: '#f8f9fa',
                              borderRadius: '4px',
                              border: '1px solid #dee2e6',
                              whiteSpace: 'pre-wrap',
                              lineHeight: '1.6',
                            }}
                          >
                            {sheetData.backstory}
                          </div>
                        </div>
                      )}
                      {sheetData.notes && (
                        <div>
                          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>その他のメモ</h3>
                          <div
                            style={{
                              padding: '1rem',
                              backgroundColor: '#f8f9fa',
                              borderRadius: '4px',
                              border: '1px solid #dee2e6',
                              whiteSpace: 'pre-wrap',
                              lineHeight: '1.6',
                            }}
                          >
                            {sheetData.notes}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                });
              }
            }
            
            return (
              <>
                {/* 基本情報セクション（アイコン＋基本情報を1カラムで表示） */}
                <section style={{ 
                  padding: '1.5rem',
                  backgroundColor: 'var(--color-surface-muted)',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  marginBottom: '2rem',
                }}>
                  <h2 style={{ 
                    marginTop: 0, 
                    marginBottom: '1rem', 
                    fontSize: '1.5rem',
                    borderBottom: '2px solid var(--color-primary)',
                    paddingBottom: '0.5rem'
                  }}>
                    {character.name}
                  </h2>
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                    {/* アイコン部分 */}
                    <div style={{ flexShrink: 0 }}>
                      {character.profile_image_url ? (
                        <div 
                          style={{ 
                            cursor: 'pointer',
                            display: 'inline-block',
                          }}
                          onClick={() => setIsImageModalOpen(true)}
                        >
                          <img
                            src={character.profile_image_url}
                            alt={character.name}
                            style={{
                              width: '120px',
                              height: '120px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '2px solid var(--color-border)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              transition: 'transform 0.2s, box-shadow 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.02)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                            }}
                          />
                        </div>
                      ) : (
                        <div style={{
                          width: '120px',
                          height: '120px',
                          backgroundColor: 'var(--color-surface-muted)',
                          border: '2px dashed var(--color-border)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--color-text-muted)',
                          fontSize: '2rem',
                        }}>
                          🖼️
                        </div>
                      )}
                    </div>
                    
                    {/* 基本情報内容 */}
                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>システム</div>
                        <div style={{ fontSize: '1.0rem', fontWeight: 'bold' }}>{SYSTEM_NAMES[character.system]}</div>
                      </div>
                      {character.tags.length > 0 && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>タグ</div>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {character.tags.map(tag => (
                              <span
                                key={tag}
                                style={{
                                  padding: '0.375rem 0.75rem',
                                  backgroundColor: 'var(--color-primary)',
                                  color: 'var(--color-text-inverse)',
                                  borderRadius: '4px',
                                  fontSize: '0.875rem',
                                  fontWeight: '500',
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {sheetData.playerName && (
                        <div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>プレイヤー名</div>
                          <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.playerName}</div>
                        </div>
                      )}
                      {sheetData.occupation && (
                        <div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>職業</div>
                          <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.occupation}</div>
                        </div>
                      )}
                      {sheetData.age && (
                        <div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>年齢</div>
                          <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.age}</div>
                        </div>
                      )}
                      {sheetData.gender && (
                        <div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>性別</div>
                          <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.gender}</div>
                        </div>
                      )}
                      {sheetData.birthplace && (
                        <div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>出身地</div>
                          <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.birthplace}</div>
                        </div>
                      )}
                      {!isCthulhu7 && sheetData.schoolDegree && (
                        <div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>学校・学位</div>
                          <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.schoolDegree}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
                
                {isImageModalOpen && character.profile_image_url && (
                  <ImageModal
                    imageUrl={character.profile_image_url}
                    alt={character.name}
                    onClose={() => setIsImageModalOpen(false)}
                  />
                )}
                
                {/* タブ形式で各セクションを表示 */}
                <Tabs items={tabItems} defaultActiveIndex={0} />
              </>
            );
          })()
        ) : (
          // 旧版（cthulhu）の場合は従来の表示
          <>
            {/* 2カラムレイアウト（PC画面のみ） */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isDesktop ? 'repeat(2, 1fr)' : 'repeat(1, 1fr)',
              gap: '1.5rem',
              marginBottom: '2rem',
            }}>
              {/* 左カラム: プロフィール画像、基本情報、能力値、派生値 */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
              }}>
                {/* プロフィール画像セクション */}
                <section>
                  {character.profile_image_url ? (
                    <div 
                      style={{ 
                        marginBottom: '1rem',
                        cursor: 'pointer',
                        display: 'inline-block',
                      }}
                      onClick={() => setIsImageModalOpen(true)}
                    >
                      <img
                        src={character.profile_image_url}
                        alt={character.name}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '400px',
                          width: 'auto',
                          height: 'auto',
                          borderRadius: '8px',
                          border: '2px solid var(--color-border)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.02)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        }}
                      />
                      <div style={{ 
                        marginTop: '0.5rem', 
                        fontSize: '0.875rem', 
                        color: 'var(--color-text-muted)',
                        textAlign: 'center'
                      }}>
                        クリックで拡大表示
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      width: '100%',
                      maxWidth: '400px',
                      height: '300px',
                      backgroundColor: 'var(--color-surface-muted)',
                      border: '2px dashed var(--color-border)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-text-muted)',
                      fontSize: '1rem',
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🖼️</div>
                        <div>プロフィール画像なし</div>
                      </div>
                    </div>
                  )}
                  {isImageModalOpen && character.profile_image_url && (
                    <ImageModal
                      imageUrl={character.profile_image_url}
                      alt={character.name}
                      onClose={() => setIsImageModalOpen(false)}
                    />
                  )}
                </section>

                {/* 基本情報セクション */}
                <section style={{ 
                  padding: '1.5rem',
                  backgroundColor: 'var(--color-surface-muted)',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                }}>
                  <h2 style={{ 
                    marginTop: 0, 
                    marginBottom: '1rem', 
                    fontSize: '1.5rem',
                    borderBottom: '2px solid var(--color-primary)',
                    paddingBottom: '0.5rem'
                  }}>
                    基本情報
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>システム</div>
                      <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{SYSTEM_NAMES[character.system]}</div>
                    </div>
                    {character.tags.length > 0 && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>タグ</div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {character.tags.map(tag => (
                            <span
                              key={tag}
                              style={{
                                padding: '0.375rem 0.75rem',
                                backgroundColor: 'var(--color-primary)',
                                color: 'var(--color-text-inverse)',
                                borderRadius: '4px',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {(() => {
                      const sheetData = normalizeCthulhuSheetData(character.sheet_data, character.system as any) as CthulhuSheetData;
                      return (
                        <>
                          {sheetData.playerName && (
                            <div>
                              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>プレイヤー名</div>
                              <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.playerName}</div>
                            </div>
                          )}
                          {sheetData.occupation && (
                            <div>
                              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>職業</div>
                              <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.occupation}</div>
                            </div>
                          )}
                          {sheetData.age && (
                            <div>
                              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>年齢</div>
                              <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.age}</div>
                            </div>
                          )}
                          {sheetData.gender && (
                            <div>
                              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>性別</div>
                              <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.gender}</div>
                            </div>
                          )}
                          {sheetData.birthplace && (
                            <div>
                              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>出身地</div>
                              <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.birthplace}</div>
                            </div>
                          )}
                          {(character.system === 'cthulhu' || character.system === 'cthulhu6') && sheetData.schoolDegree && (
                            <div style={{ gridColumn: '1 / -1' }}>
                              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>学校・学位</div>
                              <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.schoolDegree}</div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </section>

                {/* 能力値・派生値セクション（CthulhuSheetViewから取得） */}
                <CthulhuSheetView 
                  data={normalizeCthulhuSheetData(character.sheet_data, character.system as any) as CthulhuSheetData}
                  system={character.system}
                  showOnlyAttributes={true}
                />
              </div>

              {/* 右カラム: 技能、格闘技能、武器、所持品 */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
              }}>
                <CthulhuSheetView 
                  data={normalizeCthulhuSheetData(character.sheet_data, character.system as any) as CthulhuSheetData}
                  system={character.system}
                  showOnlySkillsAndItems={true}
                />
              </div>
            </div>

            {/* 2カラムレイアウトの下: その他 */}
            <CthulhuSheetView 
              data={normalizeCthulhuSheetData(character.sheet_data, character.system as any) as CthulhuSheetData}
              system={character.system}
              showOnlyOther={true}
            />
          </>
        )
      ) : (
        <>
          {/* キャラクターシートセクション */}
          {character.system === 'shinobigami' ? (
            <>
              {/* シノビガミの場合は2カラムレイアウト（PC画面のみ） */}
              {isDesktop ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1.5rem',
                  marginTop: '2rem',
                }}>
                  {/* 左カラム: プロフィール画像、基本情報、流派、能力値 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* プロフィール画像セクション */}
                    <section>
                      {character.profile_image_url ? (
                        <div 
                          style={{ 
                            marginBottom: '1rem',
                            cursor: 'pointer',
                            display: 'inline-block',
                          }}
                          onClick={() => setIsImageModalOpen(true)}
                        >
                          <img
                            src={character.profile_image_url}
                            alt={character.name}
                            style={{
                              maxWidth: '100%',
                              maxHeight: '400px',
                              width: 'auto',
                              height: 'auto',
                              borderRadius: '8px',
                              border: '2px solid var(--color-border)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              transition: 'transform 0.2s, box-shadow 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.02)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                            }}
                          />
                          <div style={{ 
                            marginTop: '0.5rem', 
                            fontSize: '0.875rem', 
                            color: 'var(--color-text-muted)',
                            textAlign: 'center'
                          }}>
                            クリックで拡大表示
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          width: '100%',
                          maxWidth: '400px',
                          height: '300px',
                          backgroundColor: 'var(--color-surface-muted)',
                          border: '2px dashed var(--color-border)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--color-text-muted)',
                          fontSize: '1rem',
                        }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🖼️</div>
                            <div>プロフィール画像なし</div>
                          </div>
                        </div>
                      )}
                      {isImageModalOpen && character.profile_image_url && (
                        <ImageModal
                          imageUrl={character.profile_image_url}
                          alt={character.name}
                          onClose={() => setIsImageModalOpen(false)}
                        />
                      )}
                    </section>

                    {/* 基本情報セクション */}
                    <section style={{ 
                      padding: '1.5rem',
                      backgroundColor: 'var(--color-surface-muted)',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)'
                    }}>
                      <h2 style={{ 
                        marginTop: 0, 
                        marginBottom: '1rem', 
                        fontSize: '1.5rem',
                        borderBottom: '2px solid var(--color-primary)',
                        paddingBottom: '0.5rem'
                      }}>
                        基本情報
                      </h2>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>システム</div>
                          <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{SYSTEM_NAMES[character.system]}</div>
                        </div>
                        {character.system === 'shinobigami' && (() => {
                          const sheetData = normalizeShinobigamiSheetData(character.sheet_data) as ShinobigamiSheetData;
                          return (
                            <>
                              {sheetData.playerName && (
                                <div>
                                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>プレイヤー名</div>
                                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.playerName}</div>
                                </div>
                              )}
                              {sheetData.age !== undefined && (
                                <div>
                                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>年齢</div>
                                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.age}</div>
                                </div>
                              )}
                              {sheetData.gender && (
                                <div>
                                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>性別</div>
                                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.gender}</div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                        {character.tags.length > 0 && (
                          <div style={{ gridColumn: '1 / -1' }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>タグ</div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              {character.tags.map(tag => (
                                <span
                                  key={tag}
                                  style={{
                                    padding: '0.375rem 0.75rem',
                                    backgroundColor: 'var(--color-primary)',
                                    color: 'var(--color-text-inverse)',
                                    borderRadius: '4px',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </section>

                    {/* キャラクターシート（流派・能力値） */}
                    <ShinobigamiSheetView 
                      data={normalizeShinobigamiSheetData(character.sheet_data) as ShinobigamiSheetData}
                      isDesktop={isDesktop}
                      showLeftColumn={true}
                    />
                  </div>

                  {/* 右カラム: 忍法、奥義、忍具、背景、メモ */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <ShinobigamiSheetView 
                      data={normalizeShinobigamiSheetData(character.sheet_data) as ShinobigamiSheetData}
                      isDesktop={isDesktop}
                      showRightColumn={true}
                    />
                  </div>
                </div>
              ) : null}

              {/* 特技セクション（2カラムの下に表示） */}
              {isDesktop && (
                <ShinobigamiSheetView 
                  data={normalizeShinobigamiSheetData(character.sheet_data) as ShinobigamiSheetData}
                  isDesktop={isDesktop}
                  showSkills={true}
                />
              )}

              {!isDesktop && (
                <>
                  {/* 1カラムレイアウト（タブレット・スマートフォン） */}
                  <section style={{ marginBottom: '2rem' }}>
                    {character.profile_image_url ? (
                      <div 
                        style={{ 
                          marginBottom: '1rem',
                          cursor: 'pointer',
                          display: 'inline-block',
                        }}
                        onClick={() => setIsImageModalOpen(true)}
                      >
                        <img
                          src={character.profile_image_url}
                          alt={character.name}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '400px',
                            width: 'auto',
                            height: 'auto',
                            borderRadius: '8px',
                            border: '2px solid var(--color-border)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.02)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                          }}
                        />
                        <div style={{ 
                          marginTop: '0.5rem', 
                          fontSize: '0.875rem', 
                          color: 'var(--color-text-muted)',
                          textAlign: 'center'
                        }}>
                          クリックで拡大表示
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        width: '100%',
                        maxWidth: '400px',
                        height: '300px',
                        backgroundColor: 'var(--color-surface-muted)',
                        border: '2px dashed var(--color-border)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-text-muted)',
                        fontSize: '1rem',
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🖼️</div>
                          <div>プロフィール画像なし</div>
                        </div>
                      </div>
                    )}
                    {isImageModalOpen && character.profile_image_url && (
                      <ImageModal
                        imageUrl={character.profile_image_url}
                        alt={character.name}
                        onClose={() => setIsImageModalOpen(false)}
                      />
                    )}
                  </section>

                  {/* 基本情報セクション */}
                  <section style={{ 
                    marginBottom: '2rem',
                    padding: '1.5rem',
                    backgroundColor: 'var(--color-surface-muted)',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)'
                  }}>
                    <h2 style={{ 
                      marginTop: 0, 
                      marginBottom: '1rem', 
                      fontSize: '1.5rem',
                      borderBottom: '2px solid var(--color-primary)',
                      paddingBottom: '0.5rem'
                    }}>
                      基本情報
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>システム</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{SYSTEM_NAMES[character.system]}</div>
                      </div>
                      {character.system === 'shinobigami' && (() => {
                        const sheetData = normalizeShinobigamiSheetData(character.sheet_data) as ShinobigamiSheetData;
                        return (
                          <>
                            {sheetData.playerName && (
                              <div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>プレイヤー名</div>
                                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.playerName}</div>
                              </div>
                            )}
                            {sheetData.age !== undefined && (
                              <div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>年齢</div>
                                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.age}</div>
                              </div>
                            )}
                            {sheetData.gender && (
                              <div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>性別</div>
                                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.gender}</div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                      {character.tags.length > 0 && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>タグ</div>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {character.tags.map(tag => (
                              <span
                                key={tag}
                                style={{
                                  padding: '0.375rem 0.75rem',
                                  backgroundColor: 'var(--color-primary)',
                                  color: 'var(--color-text-inverse)',
                                  borderRadius: '4px',
                                  fontSize: '0.875rem',
                                  fontWeight: '500',
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* キャラクターシートセクション */}
                  <section style={{ 
                    marginTop: '2rem',
                    padding: '1.5rem',
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)'
                  }}>
                    <h2 style={{ 
                      marginTop: 0, 
                      marginBottom: '1.5rem', 
                      fontSize: '1.5rem',
                      borderBottom: '2px solid var(--color-primary)',
                      paddingBottom: '0.5rem'
                    }}>
                      キャラクターシート
                    </h2>
                    <ShinobigamiSheetView 
                      data={normalizeShinobigamiSheetData(character.sheet_data) as ShinobigamiSheetData}
                      isDesktop={isDesktop}
                    />
                  </section>
                </>
              )}
            </>
          ) : character.system === 'sw25' ? (
            <>
              {/* ソードワールド2.5の場合 */}
              <section style={{ marginBottom: '2rem' }}>
                {character.profile_image_url ? (
                  <div 
                    style={{ 
                      marginBottom: '1rem',
                      cursor: 'pointer',
                      display: 'inline-block',
                    }}
                    onClick={() => setIsImageModalOpen(true)}
                  >
                    <img
                      src={character.profile_image_url}
                      alt={character.name}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '400px',
                        width: 'auto',
                        height: 'auto',
                        borderRadius: '8px',
                        border: '2px solid var(--color-border)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                      }}
                    />
                    <div style={{ 
                      marginTop: '0.5rem', 
                      fontSize: '0.875rem', 
                      color: 'var(--color-text-muted)',
                      textAlign: 'center'
                    }}>
                      クリックで拡大表示
                    </div>
                  </div>
                ) : (
                  <div style={{
                    width: '100%',
                    maxWidth: '400px',
                    height: '300px',
                    backgroundColor: 'var(--color-surface-muted)',
                    border: '2px dashed var(--color-border)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text-muted)',
                    fontSize: '1rem',
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🖼️</div>
                      <div>プロフィール画像なし</div>
                    </div>
                  </div>
                )}
                {isImageModalOpen && character.profile_image_url && (
                  <ImageModal
                    imageUrl={character.profile_image_url}
                    alt={character.name}
                    onClose={() => setIsImageModalOpen(false)}
                  />
                )}
              </section>

              {/* 基本情報セクション */}
              <section style={{ 
                marginBottom: '2rem',
                padding: '1.5rem',
                backgroundColor: 'var(--color-surface-muted)',
                borderRadius: '8px',
                border: '1px solid var(--color-border)'
              }}>
                <h2 style={{ 
                  marginTop: 0, 
                  marginBottom: '1rem', 
                  fontSize: '1.5rem',
                  borderBottom: '2px solid var(--color-primary)',
                  paddingBottom: '0.5rem'
                }}>
                  基本情報
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>システム</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{SYSTEM_NAMES[character.system]}</div>
                  </div>
                  {character.system === 'sw25' && (() => {
                    const sheetData = normalizeSw25SheetData(character.sheet_data) as Sw25SheetData;
                    return (
                      <>
                        {sheetData.playerName && (
                          <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>プレイヤー名</div>
                            <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.playerName}</div>
                          </div>
                        )}
                        {sheetData.characterName && (
                          <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>キャラクター名</div>
                            <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.characterName}</div>
                          </div>
                        )}
                        {sheetData.race && (
                          <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>種族</div>
                            <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.race}</div>
                          </div>
                        )}
                        {sheetData.birth && (
                          <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>生まれ</div>
                            <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.birth}</div>
                          </div>
                        )}
                        {sheetData.age !== undefined && (
                          <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>年齢</div>
                            <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.age}</div>
                          </div>
                        )}
                        {sheetData.gender && (
                          <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>性別</div>
                            <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.gender}</div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                  {character.tags.length > 0 && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>タグ</div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {character.tags.map(tag => (
                          <span
                            key={tag}
                            style={{
                              padding: '0.375rem 0.75rem',
                              backgroundColor: 'var(--color-primary)',
                              color: 'var(--color-text-inverse)',
                              borderRadius: '4px',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* キャラクターシートセクション */}
              <section style={{ 
                marginTop: '2rem',
                padding: '1.5rem',
                backgroundColor: 'var(--color-surface)',
                borderRadius: '8px',
                border: '1px solid var(--color-border)'
              }}>
                <h2 style={{ 
                  marginTop: 0, 
                  marginBottom: '1.5rem', 
                  fontSize: '1.5rem',
                  borderBottom: '2px solid var(--color-primary)',
                  paddingBottom: '0.5rem'
                }}>
                  キャラクターシート
                </h2>
                {(() => {
                  const normalizedData = normalizeSw25SheetData(character.sheet_data) as Sw25SheetData;
                  return (
                    <Sw25SheetView
                      data={normalizedData}
                      isDesktop={isDesktop}
                    />
                  );
                })()}
              </section>
            </>
          ) : (
            <section style={{ 
              marginTop: '2rem',
              padding: '1.5rem',
              backgroundColor: 'var(--color-surface)',
              borderRadius: '8px',
              border: '1px solid var(--color-border)'
            }}>
              <h2 style={{ 
                marginTop: 0, 
                marginBottom: '1.5rem', 
                fontSize: '1.5rem',
                borderBottom: '2px solid var(--color-primary)',
                paddingBottom: '0.5rem'
              }}>
                キャラクターシート
              </h2>
              <CharacterSheetView data={character.sheet_data} />
            </section>
          )}
        </>
      )}

      {isCocofoliaModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setIsCocofoliaModalOpen(false)}
        >
          <div
            className="card"
            style={{
              width: 'min(900px, 100%)',
              maxHeight: 'min(85vh, 820px)',
              overflow: 'auto',
              padding: '1rem',
              backgroundColor: 'var(--color-surface)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ margin: 0 }}>ココフォリア出力</h2>
                <div className="text-small text-muted">出力したJSONをコピーして、ココフォリアに貼り付けてください。</div>
                <div className="text-small text-muted">キャラクターを公開している場合は、参照URLに共有リンクが付与されます。</div>
              </div>
              <button
                className="btn btn-outline-danger"
                type="button"
                onClick={() => setIsCocofoliaModalOpen(false)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <FiX aria-hidden />
                閉じる
              </button>
            </div>

            <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '1rem' }}>
              <div>
                <div className="text-small font-bold mb-xs">技能の出力範囲</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="radio"
                      name="cocofolia-skill-scope"
                      value="changed"
                      checked={cocofoliaSkillScope === 'changed'}
                      onChange={() => setCocofoliaSkillScope('changed')}
                    />
                    変更された技能のみ
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="radio"
                      name="cocofolia-skill-scope"
                      value="all"
                      checked={cocofoliaSkillScope === 'all'}
                      onChange={() => setCocofoliaSkillScope('all')}
                    />
                    すべての技能
                  </label>
                </div>
              </div>
              <div>
                <div className="text-small font-bold mb-xs">ダイスコマンド形式</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="radio"
                      name="cocofolia-dice"
                      value="CCB"
                      checked={cocofoliaDice === 'CCB'}
                      onChange={() => setCocofoliaDice('CCB')}
                    />
                    CCB
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="radio"
                      name="cocofolia-dice"
                      value="CC"
                      checked={cocofoliaDice === 'CC'}
                      onChange={() => setCocofoliaDice('CC')}
                    />
                    CC
                  </label>
                </div>
              </div>
              <div>
                <div className="text-small font-bold mb-xs">画像（iconUrl）</div>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={cocofoliaIncludeIcon}
                    onChange={(e) => setCocofoliaIncludeIcon(e.target.checked)}
                  />
                  含める
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <button className="btn btn-primary" type="button" onClick={handleCocofoliaExport} disabled={cocofoliaLoading}>
                {cocofoliaLoading ? '生成中...' : '生成してコピー'}
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={async () => {
                  if (!cocofoliaText) return;
                  await navigator.clipboard.writeText(cocofoliaText);
                  showSuccess('コピーしました');
                }}
                disabled={!cocofoliaText}
              >
                もう一度コピー
              </button>
            </div>

            <div>
              <div className="text-small text-muted mb-sm">プレビュー（コピー対象）</div>
              <textarea
                className="textarea"
                readOnly
                value={cocofoliaText}
                placeholder="「生成してコピー」を押すと、ここにJSONが表示されます。"
                style={{ minHeight: 220, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

