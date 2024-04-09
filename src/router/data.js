export const setTitle = (title) => {
  const url = window.location.pathname;
  let titleHeader;
  title.filter((i) => {
    if (process.env.REACT_APP_ROUTER + i.path === url) titleHeader = i.name;
    return false;
  });
  return titleHeader;
};
