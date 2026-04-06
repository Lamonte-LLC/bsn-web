'use client';
/*
  theme.tsx
  wsc-web-sdk-app-nextjs

  Theme Configuration:

  This module defines a theme configuration system for managing visual styles in a React application. 
  It includes themes for Blaze components and the overall application, as well as a mechanism for toggling between light and dark themes.

  Key Concepts:
  - ThemeType: Specifies available themes - "Light" or "Dark".
  - IThemePresets: Defines CSS properties for different component presets used in the application.
  - IPresetsApp: Specifies the presets available for application-wide theming.
  - Themes: Collection of theme presets for both light and dark themes.
  - AppThemeType: Defines background and header colors for the overall application in light and dark modes.

  Theme Presets are part of Web SDK pre-defined layouts

  Usage:
  - Themes are accessed and applied using the ThemeProvider and useTheme hooks.
  - The ThemeProvider encapsulates the application, providing the current theme and a function to toggle between light and dark themes.
  - useTheme hook allows components to access the current theme configuration.

  Example Usage:
  const { blazeTheme, appTheme, toggleTheme } = useTheme();
  // Access 'blazeTheme' for Blaze component styles, 'appTheme' for overall application styles, and 'toggleTheme' to switch between light and dark themes.

  Note: This modular theme configuration promotes maintainability and consistency in styling across the application. Ensure that ThemeProvider wraps the root of your component tree.

  Dependencies:
  - React, createContext, useContext, useState from the React library.
*/

import {
  createContext,
  CSSProperties,
  ReactNode,
  useContext,
  useState,
} from "react";

export type ThemeType = "Light" | "Dark";

export type IThemePresets = {
  "row-circle": CSSProperties;
  "row-rectangle": CSSProperties;
  "grid-2-columns": CSSProperties;
  "row-rectangle-horizontal": CSSProperties;
};

// the presets we are going the use in the application
export type IPresetsApp =
  | "row-circle"
  | "row-rectangle"
  | "grid-2-columns"
  | "row-rectangle-horizontal";

type ThemeKeyValue = { [key in ThemeType]: IThemePresets };

// per each preset we have different values of css that we need to use
export const Themes: ThemeKeyValue = {
  Light: {
    "row-circle": {
      color: "#000",
    },
    "row-rectangle": {
      color: "#fff",
    },
    "grid-2-columns": {
      color: "#fff",
    },
    "row-rectangle-horizontal": {
      color: "#fff",
    },
  },
  Dark: {
    "row-circle": {
      color: "#fff",
    },
    "row-rectangle": {
      color: "#fff",
    },
    "grid-2-columns": {
      color: "#fff",
    },
    "row-rectangle-horizontal": {
      color: "#fff",
    },
  },
};

type AppThemeType = {
  background: string;
  header: string;
};

const light: AppThemeType = {
  background: "#fff",
  header: "#000",
};

const dark: AppThemeType = {
  background: "#000",
  header: "#fff",
};

type ThemeContextProps = {
  blazeTheme: IThemePresets;
  appTheme: AppThemeType;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextProps>({
  blazeTheme: Themes.Light,
  appTheme: light,
  toggleTheme: () => {},
});

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [blazeTheme, setBlazeTheme] = useState<IThemePresets>(Themes.Light);
  const [appTheme, setAppTheme] = useState<AppThemeType>(light);

  const toggleTheme = () => {
    const nextTheme = blazeTheme === Themes.Dark ? Themes.Light : Themes.Dark;
    const nextAppTheme = appTheme === dark ? light : dark;

    setBlazeTheme(nextTheme);
    setAppTheme(nextAppTheme);
  };

  return (
    <ThemeContext.Provider value={{ blazeTheme, appTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export { ThemeProvider, useTheme };
