import { useCallback } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

export const useAuth = () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Функция для обновления токена
  const refreshToken = useCallback(async () => {
    try {
      const refreshTokenValue = Cookies.get("refresh_token");
      if (!refreshTokenValue) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      const data = await response.json();
      
      if (data.error === false && data.data) {
        const { jwt, refreshToken: newRefreshToken } = data.data;
        
        // Обновляем токены в cookies
        if (jwt) {
          Cookies.set("cookiecms_cookie", jwt, { expires: 1 });
        }
        if (newRefreshToken) {
          Cookies.set("refresh_token", newRefreshToken, { 
            expires: 7, 
            secure: false, 
            sameSite: "strict" 
          });
        }
        
        return jwt;
      } else {
        throw new Error(data.msg || "Failed to refresh token");
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      // handleTokenExpiration();
      return null;
    }
  }, [API_URL]);

  // Функция для обработки истечения токена
  const handleTokenExpiration = useCallback(() => {
    // Очищаем все cookies
    const cookiesToRemove = [
      'cookiecms_avatar',
      'cookiecms_cookie', 
      'cookiecms_userid',
      'cookiecms_username',
      'cookiecms_username_ds',
      'cookiecms_permlvl',
      'refresh_token'
    ];

    cookiesToRemove.forEach(cookie => {
      Cookies.remove(cookie);
    });

    toast.error("Session expired. Please log in again.");
    // window.location.href = '/';
  }, []);

  // Универсальная функция для аутентифицированных запросов
  const makeAuthenticatedRequest = useCallback(async (url, options = {}) => {
    const cookie = Cookies.get("cookiecms_cookie");
    
    const requestOptions = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
        Authorization: `Bearer ${cookie}`,
      },
    };

    let response = await fetch(url, requestOptions);
    
    // Если получили 401, пытаемся обновить токен
    if (response.status === 401) {
      const newToken = await refreshToken();
      
      if (newToken) {
        // Повторяем запрос с новым токеном
        requestOptions.headers.Authorization = `Bearer ${newToken}`;
        response = await fetch(url, requestOptions);
      } else {
        // Если не удалось обновить токен, возвращаем оригинальный ответ
        return response;
      }
    }
    
    return response;
  }, [refreshToken]);

  // Функция для аутентифицированных запросов с файлами (FormData)
  const makeAuthenticatedFileRequest = useCallback(async (url, formData) => {
    const cookie = Cookies.get("cookiecms_cookie");
    
    let requestOptions = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cookie}`,
      },
      body: formData,
    };

    let response = await fetch(url, requestOptions);
    
    // Если получили 401, пытаемся обновить токен
    if (response.status === 401) {
      const newToken = await refreshToken();
      
      if (newToken) {
        // Повторяем запрос с новым токеном
        requestOptions.headers.Authorization = `Bearer ${newToken}`;
        response = await fetch(url, requestOptions);
      }
    }
    
    return response;
  }, [refreshToken]);

  // Проверка наличия токена
  const isAuthenticated = useCallback(() => {
    return !!Cookies.get("cookiecms_cookie");
  }, []);

  // Получение текущего пользователя из cookies
  const getCurrentUser = useCallback(() => {
    return {
      username: Cookies.get("cookiecms_username") || "",
      userId: Cookies.get("cookiecms_userid") || "",
      avatar: Cookies.get("cookiecms_avatar") || "",
      discordUsername: Cookies.get("cookiecms_username_ds") || "",
      permissionLevel: Cookies.get("cookiecms_permlvl") || "",
    };
  }, []);

  return {
    refreshToken,
    handleTokenExpiration,
    makeAuthenticatedRequest,
    makeAuthenticatedFileRequest,
    isAuthenticated,
    getCurrentUser,
  };
};
