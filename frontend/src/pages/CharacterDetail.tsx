import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCopy, FiEdit, FiGlobe, FiLock, FiShare2, FiTrash2, FiX } from 'react-icons/fi';
import { useAuth } from '../auth/useAuth';
import { getCharacter, deleteCharacter, publishCharacter, exportCocofolia } from '../services/api';
import type { Character, SystemEnum } from '../services/api';
import { CthulhuSheetView } from '../components/CthulhuSheetView';
import type { CthulhuSheetData } from '../types/cthulhu';
import { normalizeSheetData as normalizeCthulhuSheetData } from '../utils/cthulhu';
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
  cthulhu: 'クトゥルフ神話TRPG',
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
      <div style={{ padding: '2rem', textAlign: 'center' }}>
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
    <div style={{ width: '100%', margin: '0 auto', padding: '2rem' }}>
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
            <div style={{ marginTop: '0.25rem', fontSize: '1.25rem', fontWeight: 'bold' }}>{character.name}</div>
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
              {character.system === 'cthulhu' && (
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

      {/* クトゥルフの場合のみ2カラムレイアウト */}
      {character.system === 'cthulhu' ? (
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
                    const sheetData = normalizeCthulhuSheetData(character.sheet_data) as CthulhuSheetData;
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
                      </>
                    );
                  })()}
                </div>
              </section>

              {/* 能力値・派生値セクション（CthulhuSheetViewから取得） */}
              <CthulhuSheetView 
                data={normalizeCthulhuSheetData(character.sheet_data) as CthulhuSheetData}
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
                data={normalizeCthulhuSheetData(character.sheet_data) as CthulhuSheetData}
                showOnlySkillsAndItems={true}
              />
            </div>
          </div>

          {/* 2カラムレイアウトの下: その他 */}
          <CthulhuSheetView 
            data={normalizeCthulhuSheetData(character.sheet_data) as CthulhuSheetData}
            showOnlyOther={true}
          />
        </>
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

