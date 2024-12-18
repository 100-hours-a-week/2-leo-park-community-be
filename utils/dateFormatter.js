// /backend/utils/dateFormatter.js

/**
 * 날짜를 지정된 형식으로 변환하는 함수
 * @param {Date} date - 변환할 날짜 객체 (기본값: 현재 날짜)
 * @param {string} locale - 로케일 설정 (기본값: 'ko-KR')
 * @returns {string} 변환된 날짜 문자열
 */
export const formatDate = (date = new Date(), locale = 'ko-KR') => {
    return date.toLocaleString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };