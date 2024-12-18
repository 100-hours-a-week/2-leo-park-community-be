// /backend/controllers/userController.js

// NOTE: 게시글 및 댓글 수정/삭제 엔드포인트에서 작성자 확인을 위한 유틸 함수
import { isAuthor } from '../utils/authorization.js';
// NOTE: 게시글 이미지를 추가하고 수정할 때, json body에 게시글 제목하고 내용과 함께 담아 한번에 보내고 싶어서 base64로 인코딩함
import { saveBase64Image } from '../utils/base64Encoding.js';

import bcrypt from 'bcrypt';

import User from '../models/User.js';

// 로그인
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.verifyPassword(email, password);
    if (!user) {
      return res.status(401).json({
        error: true,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      });
    }

    // 세션에 사용자 정보 저장
    req.session.user = {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      profile_image: user.profile_image,
    };

    res.status(200).json({
      error: false,
      message: '로그인에 성공했습니다.',
    });
  } catch (error) {
    console.error('로그인 중 오류 발생:', error);
    res.status(500).json({
      error: true,
      message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    });
  }
};

// 사용자 프로필 조회
export const getUserProfile = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      error: true,
      message: '로그인이 필요합니다.',
    });
  }

  res.status(200).json(req.session.user);
};

// 로그아웃
export const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('세션 삭제 중 오류 발생:', err);
      return res.status(500).json({
        error: true,
        message: '로그아웃 중 오류가 발생했습니다.',
      });
    }

    res.clearCookie('connect.sid');
    res.status(200).json({
      error: false,
      message: '로그아웃되었습니다.',
    });
  });
};

// 회원가입
export const register = async (req, res) => {
  const { email, password, nickname, profile_image } = req.body;

  try {
    // 입력값 검증
    if (!email) {
      return res
        .status(400)
        .json({ errorField: 'email', message: '이메일을 입력해주세요.' });
    }

    if (!password) {
      return res.status(400).json({
        errorField: 'password',
        message: '비밀번호를 입력해주세요.',
      });
    }

    if (!nickname) {
      return res.status(400).json({
        errorField: 'nickname',
        message: '닉네임을 입력해주세요.',
      });
    }

    // 이메일 형식 확인
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return res.status(400).json({
        errorField: 'email',
        message: '올바른 이메일 형식을 입력해주세요.',
      });
    }

    // 비밀번호 유효성 검사
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/.test(
        password,
      )
    ) {
      return res.status(400).json({
        errorField: 'password',
        message:
          '비밀번호는 8~20자, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.',
      });
    }

    // 닉네임 길이 및 공백 확인
    if (nickname.length > 10) {
      return res.status(400).json({
        errorField: 'nickname',
        message: '닉네임은 최대 10자까지 가능합니다.',
      });
    }

    if (/\s/.test(nickname)) {
      return res.status(400).json({
        errorField: 'nickname',
        message: '닉네임에 공백을 사용할 수 없습니다.',
      });
    }

    // 중복된 이메일 및 닉네임 확인
    const isEmailTaken = await User.getUserByEmail(email);
    if (isEmailTaken) {
      return res.status(409).json({
        errorField: 'email',
        message: '이미 등록된 이메일입니다.',
      });
    }

    const isNicknameTaken = await User.getUserByNickname(nickname);
    if (isNicknameTaken) {
      return res.status(409).json({
        errorField: 'nickname',
        message: '이미 사용 중인 닉네임입니다.',
      });
    }

    // 프로필 이미지 저장
    let profile_image_url = '/public/images/default-profile.png';

    if (profile_image) {
      try {
        const filename = `profile_${Date.now()}.png`;
        console.log('profile_image_url 추출 전'); // 디버깅
        profile_image_url = saveBase64Image(profile_image, filename);
        console.log('profile_image_url:', profile_image_url); // 디버깅
      } catch (error) {
        console.error('프로필 이미지 저장 중 오류 발생:', error);
        return res.status(500).json({ error: '프로필 이미지 저장 중 오류가 발생했습니다.' });
      }
    }

    // 사용자 생성
    const new_user = await User.createUser({
      email,
      password,
      nickname,
      profile_image: profile_image_url,
    });

    res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      email: new_user.email,
      nickname: new_user.nickname,
      profile_image: new_user.profile_image,
    });
  } catch (error) {
    console.error('회원가입 중 오류 발생:', error);
    res.status(500).json({ message: '회원가입 중 오류가 발생했습니다.' });
  }
};

// 계정 삭제
export const deleteUser = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  const user_id = req.session.user.id;

  try {
    // 사용자 삭제 (논리 삭제)
    await User.deleteUser(user_id);

    // 세션 삭제
    req.session.destroy(err => {
      if (err) {
        console.error('세션 삭제 중 오류 발생:', err);
        return res.status(500).json({
          message: '계정 삭제 중 오류가 발생했습니다.',
        });
      }

      res.clearCookie('connect.sid');
      res.status(200).json({ message: '계정이 삭제되었습니다.' });
    });
  } catch (error) {
    console.error('계정 삭제 중 오류 발생:', error);
    res.status(500).json({ message: '계정 삭제 중 오류가 발생했습니다.' });
  }
};

// 계정 정보 수정
export const updateAccount = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  const user_id = req.session.user.id;
  const { new_nickname, profile_image } = req.body;

  try {
    const user = await User.getUserById(user_id);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    const update_data = {};

    // 닉네임 업데이트
    if (new_nickname) {
      if (new_nickname.length > 10 || /\s/.test(new_nickname)) {
        return res.status(400).json({
          error: '닉네임은 10자 이내여야 하며, 공백이 포함될 수 없습니다.',
        });
      }

      const isNicknameTaken = await User.getUserByNickname(new_nickname);
      if (isNicknameTaken && isNicknameTaken.id !== user_id) {
        return res.status(409).json({
          error: '이미 사용 중인 닉네임입니다.',
        });
      }

      update_data.nickname = new_nickname;
      req.session.user.nickname = new_nickname;
    }

    // 프로필 이미지 업데이트
    if (profile_image) {
      try {
        const filename = `profile_${user.email}_${Date.now()}.png`;
        const image_url = saveBase64Image(profile_image, filename);
        update_data.profile_image = image_url;
        req.session.user.profile_image = image_url;
      } catch (error) {
        console.error('프로필 이미지 저장 중 오류 발생:', error);
        return res.status(500).json({ error: '프로필 이미지 저장 중 오류가 발생했습니다.' });
      }
    }

    if (Object.keys(update_data).length === 0) {
      return res.status(200).json({
        message: '변경 내용이 없습니다. 기존 정보를 유지합니다.',
        updatedNickname: req.session.user.nickname,
        updatedProfileImage: req.session.user.profile_image,
      });
    }

    await User.updateUser(user_id, update_data);

    res.status(200).json({
      message: '계정 정보가 성공적으로 변경되었습니다.',
      updatedNickname: req.session.user.nickname,
      updatedProfileImage: req.session.user.profile_image,
    });
  } catch (error) {
    console.error('계정 정보 변경 중 오류 발생:', error);
    res.status(500).json({ error: '계정 정보 변경 중 오류가 발생했습니다.' });
  }
};

// 비밀번호 변경
export const updatePassword = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  const user_id = req.session.user.id;
  const { new_password } = req.body;

  try {
    const user = await User.getUserById(user_id);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/.test(
        new_password,
      )
    ) {
      return res.status(400).json({
        message: '새 비밀번호는 8~20자, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.',
      });
    }

    // 기존 비밀번호와 다른지 체크
    const password_match = await bcrypt.compare(new_password, user.password_hash);
    if (password_match) {
      return res.status(400).json({
        message: '새 비밀번호는 기존 비밀번호와 다르게 설정해야 합니다.',
      });
    }

    // 비밀번호 업데이트
    const hashed_password = await bcrypt.hash(new_password, 10);
    await User.updatePassword(user_id, hashed_password);

    // 세션 무효화 및 로그아웃 처리
    req.session.destroy(err => {
      if (err) {
        console.error('세션 삭제 중 오류 발생:', err);
        return res.status(500).json({
          message: '비밀번호 변경 중 오류가 발생했습니다.',
        });
      }

      res.clearCookie('connect.sid');
      res.status(200).json({
        message: '비밀번호가 성공적으로 변경되었습니다.',
      });
    });
  } catch (error) {
    console.error('비밀번호 변경 중 오류 발생:', error);
    res.status(500).json({ message: '비밀번호 변경 중 오류가 발생했습니다.' });
  }
};