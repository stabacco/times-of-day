import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from 'styled-components'
import App from './App.tsx'
import { initI18n } from './i18n'
import { GlobalStyle } from './styles/GlobalStyle'
import { theme } from './styles/theme'

async function bootstrap() {
  await initI18n()
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <App />
      </ThemeProvider>
    </StrictMode>,
  )
}

void bootstrap()
