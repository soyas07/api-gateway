import app from './app.js';

const port = process.env.PORT || 5000;
app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://0.0.0.0:${port}`);
  /* eslint-enable no-console */
});
