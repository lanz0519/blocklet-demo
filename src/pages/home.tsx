import './home.css';

import { useEffect, useState } from 'react';

import { APIError } from '../../constant/index';
import api from '../libs/api';
import { IUser } from '../type';

function Home() {
  const [profile, setProfile] = useState<IUser>({
    username: '',
    email: '',
    phone: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  async function getUserData(username: string) {
    const { data } = await api.get(`/api/user/info?username=${username}`);
    return data;
  }

  async function createUserData() {
    const { data } = await api.post('/api/user', {
      username: 'default',
      email: 'default@example.com',
      phone: '15061117525',
    });
    return data;
  }

  async function updateUserData(user: IUser) {
    const { data } = await api.put('/api/user/update', user);
    return data;
  }

  useEffect(() => {
    setIsLoading(true);

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    if (userInfo.username) {
      getUserData(userInfo.username)
        .then((data) => {
          if (data.code === APIError.USER_NOT_FOUND) {
            createUserData().then((createRes) => {
              setProfile(createRes);
              localStorage.setItem('userInfo', JSON.stringify(createRes));
              setIsLoading(false);
            });
          } else {
            setProfile(data);
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('getUserData', error);
          setIsLoading(false);
        });
    }

    // 如果数据不存在，则需要默认创建一个
    if (!userInfo.username) {
      createUserData().then((data: IUser) => {
        setProfile(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
        setIsLoading(false);
      });
    }
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    updateUserData(profile).then((data) => {
      setProfile(data);
      setIsEditing(false);
    });
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  return (
    <div className="profile-container">
      <h1>用户资料</h1>
      {isLoading ? (
        <div className="loading">加载中...</div>
      ) : (
        <div>
          {isEditing ? (
            <div className="edit-form">
              <div className="form-group">
                <label htmlFor="username">
                  用户名:{' '}
                  <input
                    id="username"
                    name="username"
                    value={profile.username}
                    onChange={handleChange}
                    placeholder="用户名"
                    disabled
                  />
                </label>
              </div>
              <div className="form-group">
                <label htmlFor="email">
                  邮箱:{' '}
                  <input id="email" name="email" value={profile.email} onChange={handleChange} placeholder="邮箱" />
                </label>
              </div>
              <div className="form-group">
                <label htmlFor="phone">
                  手机号:{' '}
                  <input id="phone" name="phone" value={profile.phone} onChange={handleChange} placeholder="手机号" />
                </label>
              </div>
              <button type="button" onClick={handleSave}>
                保存
              </button>
            </div>
          ) : (
            <div>
              <p>用户名: {profile.username}</p>
              <p>邮箱: {profile.email}</p>
              <p>手机号: {profile.phone}</p>
              <button type="button" onClick={handleEdit}>
                编辑
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Home;
