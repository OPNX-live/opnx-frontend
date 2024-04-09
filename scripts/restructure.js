const exec = require("child_process").exec;
exec(`mkdir build/user`, () => {
  exec(`mv build/static build/user/static`, () => {});
});