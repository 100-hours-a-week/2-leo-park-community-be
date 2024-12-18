// /backend/utils/uuidUtils.js

/**
 * UUID 문자열을 BINARY(16) 형식으로 변환합니다.
 * @param {string} uuid - 변환할 UUID 문자열
 * @returns {Buffer} - 변환된 BINARY(16) 값
 */
export function uuidToBuffer(uuid) {
    return Buffer.from(uuid.replace(/-/g, ''), 'hex');
}

/**
 * BINARY(16) 값을 UUID 문자열로 변환합니다.
 * @param {Buffer} buffer - 변환할 BINARY(16) 값
 * @returns {string} - 변환된 UUID 문자열
 */
export function bufferToUuid(buffer) {
    const hex = buffer.toString('hex');
    return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20, 32),
    ].join('-');
}