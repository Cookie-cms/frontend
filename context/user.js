"use client";
import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const jwt = Cookies.get("cookiecms_cookie");
    if (jwt) {
      setUser({
        jwt,
        userid: Cookies.get("cookiecms_userid") || null,
        avatar: Cookies.get("cookiecms_avatar") || null,
        username: Cookies.get("cookiecms_username") || null,
        permlvl: Cookies.get("cookiecms_permlvl") || null,
      });
    } else {
      setUser(false);
    }
  }, []);

  const value = { user, setUser };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}