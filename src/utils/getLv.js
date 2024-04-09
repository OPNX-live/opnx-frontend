const getLvl = (pwd) => {
  let lvl = 0;
  if (/[0-9]/.test(pwd)) {
    lvl++;
  }
  if (/[A-Z]/.test(pwd)) {
    lvl++;
  }
  if (/[a-z]/.test(pwd)) {
    lvl++;
  }
  if (/[`~!@#$%^&*()_+<>?:"{},./;'[\]]/.test(pwd)) {
    lvl++;
  }
  return lvl;
};

export default getLvl;