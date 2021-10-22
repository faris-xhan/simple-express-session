const store = {};
const users = [
   { fname: "Test Man", uname: "test", passwd: "123" },
   { fname: "Best Man", uname: "test2", passwd: "321" },
   { fname: "Last Man", uname: "test3", passwd: "000" },
];

export const insertSession = (id, user) => {
   store[id] = user;
   return id;
};

export const deleteSession = (id) => {
   return delete store[id];
};

export const getLoggedinUser = (sessId) => {
   return store[sessId];
};

export const clearSessionStore = () => {
   store = {};
   return true;
};

export const findUserIndex = (uname) => {
   const index = users.findIndex((user) => user.uname === uname);
   return index;
};

export const insertUser = (fname, uname, passwd) => {
   if (findUserIndex(uname) >= 0) {
      return false;
   }

   users.push({ fname, uname, passwd });
   return true;
};

export const getUser = (u, p) => {
   const userIndex = findUserIndex(u);
   if (userIndex >= 0 && p === users[userIndex].passwd) {
      return users[userIndex];
   }
   return undefined;
};
