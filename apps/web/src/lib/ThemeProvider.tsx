import { ThemeContext, useThemeProvider } from './theme';

type Props = {
  children: React.ReactNode;
};

export default function ThemeProvider({ children }: Props) {
  const value = useThemeProvider();
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
