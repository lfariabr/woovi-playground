import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        {/* Estilos inline para garantir que o CSS seja carregado, independente do modo standalone */}
        <style dangerouslySetInnerHTML={{ __html: `
          html, body {
            padding: 0;
            margin: 0;
            background-color: #03d69d;
          }
          
          .container {
            padding: 32px 24px;
            background: #f9f9fb;
            border-radius: 12px;
            border: 1px solid #ececec;
            max-width: 480px;
            margin: 0 auto 32px auto;
            box-shadow: 0 2px 8px rgba(0,0,0,0.03);
          }
          
          .sectionHeader {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 20px;
            color: #1a237e;
            letter-spacing: 0.5px;
          }
          
          .accountSectionHeader {
            margin-bottom: 16px;
          }
          
          .accountSectionName {
            font-weight: 600;
          }
        `}} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
