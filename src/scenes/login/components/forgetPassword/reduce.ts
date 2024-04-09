export const todosReducer = (state: any, action: any) => {
  switch (action.type) {
    case "test":
      return action.test;
    default:
      return state;
  }
};
