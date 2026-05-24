// Простая абстракция хранения данных
const DB_KEY = 'emoji_network_db';

function getDB() {
  const db = localStorage.getItem(DB_KEY);
  return db ? JSON.parse(db) : {users: [], posts: [], session: null};
}
function saveDB(data) {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
}
// Добавить нового пользователя
function addUser(user) {
  const db = getDB();
  db.users.push(user);
  saveDB(db);
}
function updateUser(updatedUser) {
  const db = getDB();
  db.users = db.users.map(u => u.id === updatedUser.id ? updatedUser : u);
  saveDB(db);
}
function getUser(userId) {
  const db = getDB();
  return db.users.find(u => u.id === userId);
}
function getAllUsers() {
  return getDB().users;
}
// Посты
function addPost(post) {
  const db = getDB();
  db.posts.push(post);
  saveDB(db);
}
function getPosts() {
  const db = getDB();
  return db.posts;
}
// Сессия (текущий юзер)
function setSession(userId) {
  const db = getDB();
  db.session = userId;
  saveDB(db);
}
function getSessionUser() {
  const db = getDB();
  if (!db.session) return null;
  return db.users.find(u => u.id === db.session);
}
function clearDB() {
  localStorage.removeItem(DB_KEY);
}
