import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  status?: number;
  details?: string[];
}

/**
 * APIエラーをユーザーフレンドリーなメッセージに変換
 */
export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof Error && 'response' in error) {
    const axiosError = error as AxiosError<{ detail?: string | { error?: string; message?: string; details?: string[] } }>;
    const status = axiosError.response?.status;
    const detail = axiosError.response?.data?.detail;

    // ネットワークエラー
    if (!status) {
      return {
        message: 'ネットワークエラーが発生しました。インターネット接続を確認してください。',
      };
    }

    // 認証エラー
    if (status === 401) {
      return {
        message: '認証に失敗しました。再度ログインしてください。',
        status: 401,
      };
    }

    // 権限エラー
    if (status === 403) {
      return {
        message: 'この操作を実行する権限がありません。',
        status: 403,
      };
    }

    // リソースが見つからない
    if (status === 404) {
      return {
        message: 'リソースが見つかりませんでした。',
        status: 404,
      };
    }

    // バリデーションエラー
    if (status === 422) {
      if (typeof detail === 'string') {
        return {
          message: detail,
          status: 422,
        };
      } else if (detail && typeof detail === 'object') {
        return {
          message: detail.message || '入力内容に誤りがあります。',
          status: 422,
          details: detail.details,
        };
      }
    }

    // サーバーエラー
    if (status >= 500) {
      return {
        message: 'サーバーエラーが発生しました。しばらく待ってから再度お試しください。',
        status,
      };
    }

    // その他のエラー
    if (typeof detail === 'string') {
      return {
        message: detail,
        status,
      };
    } else if (detail && typeof detail === 'object') {
      return {
        message: detail.message || 'エラーが発生しました。',
        status,
        details: detail.details,
      };
    }
  }

  // その他のエラー
  if (error instanceof Error) {
    return {
      message: error.message || '予期しないエラーが発生しました。',
    };
  }

  return {
    message: '予期しないエラーが発生しました。',
  };
};

/**
 * エラーメッセージを整形して表示用の文字列に変換
 */
export const formatErrorMessage = (error: ApiError): string => {
  if (error.details && error.details.length > 0) {
    return `${error.message}\n${error.details.join('\n')}`;
  }
  return error.message;
};

