"use client";
import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const jwt = Cookies.get("cookiecms_cookie");
    if (jwt) {
      const adminPageValue = Cookies.get("cookiecms_ap");
      setUser({
        jwt,
        userid: Cookies.get("cookiecms_userid") || null,
        avatar: Cookies.get("cookiecms_avatar") || null,
        username: Cookies.get("cookiecms_username") || null,
        permlvl: Cookies.get("cookiecms_permlvl") || null,
        cookiecms_ap: adminPageValue === "true" || adminPageValue === true,
      });
    } else {
      setUser(false);
    }
    setLoading(false);
  }, []);

  // Функция для выхода пользователя (destroy/logout)
  const destroySession = () => {
    // Удаляем все куки
    Cookies.remove("cookiecms_cookie");
    Cookies.remove("cookiecms_userid");
    Cookies.remove("cookiecms_avatar");
    Cookies.remove("cookiecms_username");
    Cookies.remove("cookiecms_permlvl");
    Cookies.remove("cookiecms_ap");
    Cookies.remove("refresh_token");
    Cookies.remove("cookiecms_username_ds");

    // Сбрасываем состояние пользователя
    setUser(false);
    
    // Возвращаем true для подтверждения успешного выхода
    return true;
  };

  const value = { user, setUser, loading, destroySession };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
