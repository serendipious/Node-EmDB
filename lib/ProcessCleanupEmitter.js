"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessCleanupEmitter = void 0;
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
process.on('uncaughtException', function (e) {
    console.error('Uncaught Exception', e);
    process.exit(99);
});
exports.ProcessCleanupEmitter = {
// This is just a placeholder export to make it a module
// The actual functionality is in the process event listeners above
};
//# sourceMappingURL=ProcessCleanupEmitter.js.map