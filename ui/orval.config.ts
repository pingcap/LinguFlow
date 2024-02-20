const config = {
  linguflow: {
    input: {
      target: 'http://localhost:8000/openapi.json'
    },
    output: {
      mode: 'split',
      target: 'src/api/linguflow.ts',
      client: 'react-query',
      mock: true,
      override: {
        mutator: {
          path: 'src/http_client.ts',
          name: 'customInstance'
        }
      }
    }
  }
}

export default config
