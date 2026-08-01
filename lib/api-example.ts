export const FETCH_EXAMPLE = `const credentials = Buffer.from('CLIENT_ID:CLIENT_SECRET').toString('base64');

const response = await fetch(
  'https://renderpdf.vercel.app/api/convert',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Basic \${credentials}\`
    },
    body: JSON.stringify({
      html: '<h1>Hello World</h1>',
      options: {
        format: 'A4',
        margin: '20mm'
      }
    })
  }
);

const pdf = await response.blob();`;
