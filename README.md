# How to enable Cross-Origin in dev web server

- go to `node_modules\react-scripts\config\webpackDevServer.config` at `module.exports\return`
- add the following line:

```headers : {
      'Access-Control-Allow-Origin': '*',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
```
