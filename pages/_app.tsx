import { AppProps } from 'next/app';
import Head from 'next/head';

import NProgress from 'components/nprogress';

import 'fonts.css';

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <Head>
        <title>Poll Daddy Hack</title>
      </Head>
      <NProgress />
      <Component {...pageProps} />
      <style jsx global>{`
        ::selection {
          background-color: var(--selection);
        }

        *,
        *:before,
        *:after {
          box-sizing: inherit;
        }

        html {
          height: 100%;
          box-sizing: border-box;
          touch-action: manipulation;
          font-feature-settings: 'kern';
        }

        body {
          position: relative;
          min-height: 100%;
          margin: 0;
        }

        html,
        body {
          font-size: 16px;
          line-height: 1.45;
          font-family: var(--font-sans);
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: subpixel-antialiased;
          -moz-osx-font-smoothing: grayscale;
          background-color: var(--background);
          color: var(--on-background);
        }

        h2 {
          font-size: 1.2rem;
          margin: 1rem 0;
        }

        .wrapper {
          max-width: calc(var(--page-width) + 2 * 1rem);
          padding: 0 1rem;
          margin: auto;
        }

        .wrapper > h2:first-child {
          margin-top: 0;
        }

        p {
          margin: 1rem 0;
        }

        a {
          cursor: pointer;
          text-decoration: none;
          color: var(--accents-5);
          transition: color 0.2s ease 0s;
        }

        a:hover,
        a.active {
          color: var(--on-background);
        }

        a.active {
          cursor: not-allowed;
        }
      `}</style>
      <style jsx global>{`
        :root {
          --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
            'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
            'Droid Sans', 'Helvetica Neue', sans-serif;
          --font-mono: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;

          --page-width: 800px;
          
          --primary: #c84702;
          --on-primary: #fff;
          --background: #000;
          --on-background: #fff;
          --error: #cf6679;
          --on-error: #000;

          --accents-1: #111;
          --accents-2: #333;
          --accents-3: #444;
          --accents-4: #666;
          --accents-5: #888;
          --accents-6: #999;

          --shadow-small: 0 0 0 1px var(--accents-2);
          --shadow-medium: 0 0 0 1px var(--accents-2);
          --shadow-large: 0 0 0 1px var(--accents-2);

          --selection: #c84702;
        }
      `}</style>
    </>
  );
}
