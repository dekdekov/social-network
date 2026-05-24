// Главная логика приложения

const popularEmojis = [
  '😎','👻','🤩','🐼','😺','🦄','🐙','🐶','🐸','🍕','🤖','🦊','🌈','🔥','🎩','💎','🦕','🌻','🚀','😈','🫠'
];

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k.startsWith('on')) node[k.toLowerCase()] = v;
    else if (k === 'style') node.style = v;
    else node.setAttribute(k, v);
  }
  children.flat().forEach(c=>node.append(c.nodeType?c:document.createTextNode(c)));
  return node;
}

function render() {
  const app = document.getElementById('app');
  app.innerHTML = '';
  const user = getSessionUser();
  if (!user) {
    app.append(renderAuth());
    return;
  }
  app.append(
    el('div', {class: 'panel'},
      el('div', {class:'title'}, '👥 Emoji Social Network'),
      el('div', {},
        el('button', {onclick:()=>{setSession(null); render();}}, 'Выйти'),
        ' ' , el('button', {onclick:renderProfile}, 'Мой профиль'),
        ' ', el('button', {onclick:renderFeed}, 'Лента новостей'),
        ' ', el('button', {onclick:()=>{if(confirm('Сбросить ВСЮ базу?')) {clearDB(); location.reload();}}}, '🗑️ Сбросить всё')
      )
    )
  );
  renderFeed();
}

function renderAuth() {
  return el('div', {class:'panel center'},
    el('div', {class:'title'}, 'Вход/Регистрация'),
    el('div', {},
      el('form', {onsubmit:e=>{
        e.preventDefault();
        const nick = e.target.nick.value.trim();
        const emoji = e.target.emoji.value || popularEmojis[Math.floor(Math.random()*popularEmojis.length)];
        if (!nick) return alert('Ник не должен быть пустым!');
        const user = {id: Date.now()+Math.random().toString(16),nick,emoji,desc:'',theme:'default'};
        addUser(user); setSession(user.id); render();
      }},
        el('input', {name:'nick',placeholder:'Ник',autocomplete:'off'}),
        el('input', {name:'emoji',placeholder:'Ваш смайл (любой emoji, напр. 😀)',maxlength:2}),
        el('div', {style:'margin-top:0.7em'},
          'или выбери: ',
          ...popularEmojis.map(em=>el('button',{type:'button',class:'emoji-btn',onclick:(e)=>{e.target.form.emoji.value=em;}},em))
        ),
        el('div', {style:'margin-top:1.3em;'},
          el('button', {type:'submit'}, 'Войти / Зарегистрироваться')
        )
      )
    )
  );
}

function renderProfile() {
  const user = getSessionUser();
  renderPanel(
    el('div', {class:'profile-card'},
      el('div', {class:'profile-emoji'}, user.emoji),
      el('div', {class:'profile-info'},
        el('div', {class:'profile-nick'}, user.nick),
        el('div', {class:'profile-desc'}, user.desc || '—'),
        el('div', {style:'margin-top:1em'},
          el('button',{onclick:editProfile},'⚡ Редактировать профиль')
        )
      )
    )
  );
}

function editProfile() {
  const user = getSessionUser();
  renderPanel(
    el('form', {onsubmit:e=>{
      e.preventDefault();
      user.nick = e.target.nick.value;
      user.desc = e.target.desc.value;
      user.emoji = e.target.emoji.value;
      updateUser(user);
      renderProfile();
    }},
      el('div', {class:'profile-card'},
        el('div', {class:'profile-emoji'},
          el('input', {
            style:'font-size:2.7rem;text-align:center;width:3.7em',
            name:'emoji',
            value:user.emoji,
            maxlength:2
          })
        ),
        el('div', {class:'profile-info'},
          el('input', {name:'nick',value:user.nick,placeholder:'Ник',maxlength:32,style:'margin-bottom:1em'}),
          el('textarea',{name:'desc',placeholder:'О себе',rows:2,style:'width:100%'}, user.desc||'')
        )
      ),
      el('div', {class:'emoji-list'},
        'Выбери смайл: ',
        ...popularEmojis.map(em=>el('button',{type:'button',class:'emoji-btn',onclick:(e)=>{e.target.form.emoji.value=em;}},em))
      ),
      el('div',{style:'margin-top:1em'},
        el('button',{type:'submit'},'Сохранить'),
        ' ',el('button',{type:'button',onclick:renderProfile},'Назад')
      )
    )
  );
}

function renderFeed() {
  renderPanel(
    el('div', {},
      el('div', {class:'title'}, 'Лента новостей'),
      postForm(),
      el('ul', {class:'news-list'},
        ...getPosts()
          .slice().reverse()
          .map(post=>el('li', {}, postItem(post)))
      )
    )
  );
}

function postForm() {
  const user = getSessionUser();
  return el('form',{onsubmit:e=>{
    e.preventDefault();
    const text = e.target.text.value.trim();
    if (!text) return;
    addPost({id:Date.now()+Math.random().toString(16),author:user.id,text,date:new Date().toISOString()});
    e.target.text.value=''; renderFeed();
  },style:'margin-bottom:1.4em'},
    el('textarea',{name:'text',placeholder:'Что нового?',rows:2,style:'resize:none'}),
    el('div',{},el('button',{type:'submit'},'Опубликовать'))
  );
}
function postItem(post) {
  const user = getUser(post.author)||{emoji:'🤔',nick:'???'};
  return el('div', {class:'post'},
    el('div', {class:'post-header'},
      el('span', {style:'font-size:1.45em'}, user.emoji),
      el('span', {}, user.nick)
    ),
    el('div', {class:'post-text'}, post.text)
  );
}
function renderPanel(panelContent) {
  // оставляет верхнюю панель меню и затирает остальной контент
  const app = document.getElementById('app');
  // панель меню уже есть — просто очищаем всё, что ниже (оставляем нулевой элемент)
  while(app.childNodes.length > 1) app.removeChild(app.lastChild);
  app.append(panelContent);
}

window.addEventListener('DOMContentLoaded', render);
