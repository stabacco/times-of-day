import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html, body, #root {
    min-height: 100%;
  }

  body {
    margin: 0;
    min-height: 100vh;
    font-family: ${({ theme }) => theme.fonts.body};
    color: ${({ theme }) => theme.colors.ink};
    background: linear-gradient(
      180deg,
      ${({ theme }) => theme.colors.bgTop} 0%,
      ${({ theme }) => theme.colors.bgBottom} 100%
    );
    background-attachment: fixed;
    -webkit-font-smoothing: antialiased;
  }

  button, select {
    font-family: inherit;
  }
`
