import app from './app';

const port = process.env.PORT || 5000;
console.log('port', process.env.PORT);
app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});
