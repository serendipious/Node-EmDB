// do app specific cleaning before exiting
process.on('exit', function () {
  process.emit('cleanup');
});

// catch ctrl+c event and exit normally
process.on('SIGINT', function () {
  console.warn('SIGINT');
  process.exit(2);
});

//catch uncaught exceptions, trace, then exit normally
process.on('uncaughtException', function(e) {
  console.error('Uncaught Exception', e);
  process.exit(99);
});