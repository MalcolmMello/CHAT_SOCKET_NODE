const socket = io();

let username = '';
let userList = [];

let loginPage = document.querySelector('#loginPage');
let chatPage = document.querySelector('#chatPage');

let loginInput = document.querySelector('#loginNameInput');
let textInput = document.querySelector('#chatTextInput');

/* renderiza os usuários quando o nosso user entrar */
function renderUserList() {
   let ul = document.querySelector('.userList');
   ul.innerHTML = '';

   userList.forEach(usersname => {
       ul.innerHTML += `<li>${usersname}</li>`
   });
};

function addMessage(type, user, msg) {
    let ul = document.querySelector('.chatList');

    switch(type) {
        case 'status':
            ul.innerHTML += `<li class="m-status">${msg}</li>`
        break;
        case 'msg':
            if(username == user) {
                ul.innerHTML += `<li class="m-txt"><span class="me">${user}:</span> ${msg}</li>`
            } else {
                ul.innerHTML += `<li class="m-txt"><span>${user}:</span> ${msg}</li>`
            };
            
        break;
    };

    ul.scrollTop = ul.scrollHeight;
}

/* Monitora o input e envia o nome do usuário para o servidor */
loginInput.addEventListener('keyup', (e) => {
    if(e.keyCode === 13) {
        let name = loginInput.value.trim();
        if(name != '') {
            username = name;
            document.title = `Chat (${username})`;

            socket.emit('join-request', username);
        }
    }
});

textInput.addEventListener('keyup', (e) => {
    if(e.keyCode === 13) {
        let txt = textInput.value.trim();
        textInput.value = '';

        if(txt != '') {
            addMessage('msg', username, txt);
            socket.emit('send-msg', txt);
        };
    };
});

/* Recebe sinal de que o user está logado */
socket.on('user-ok', (list) => {
    loginPage.style.display = 'none';
    chatPage.style.display = 'flex';
    textInput.focus();

    addMessage('status', null, 'Conectado!');

    userList = list;
    renderUserList();
});

/* Recebe um alerta quando novos usuários entrarem no chat */

socket.on('list-update', (data) => {
    /* Verifica se algum usuário saiu ou entrou */

    if(data.joined) {
        addMessage('status', null, `${data.joined} entrou no chat.`)
    }

    if(data.left) {
        addMessage('status', null, `${data.left} saiu do chat.`)
    }

    userList = data.list
    renderUserList();
});

socket.on('show-msg', (data) => {
    console.log(data)
    addMessage('msg', data.username, data.message);
});

socket.on('disconnect', () => {
    addMessage('status', null, 'Você foi desconectado!');
    userList = [];
    renderUserList();
});

socket.on('connect_error', () => {
    addMessage('status', null, 'Tentando reconectar...');
});

socket.io.on('reconnect', () => {
    addMessage('status', null, 'Reconectado');
    if(username != '') {
        socket.emit('join-request', username);
    };
});