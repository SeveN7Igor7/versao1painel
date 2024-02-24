var firebaseConfig = {
    apiKey: "AIzaSyBzCVbI3t6Cb8qQSlOp1xdcoyIov8VDcWA",
    authDomain: "painel-ef580.firebaseapp.com",
    projectId: "painel-ef580",
    storageBucket: "painel-ef580.appspot.com",
    messagingSenderId: "942535580975",
    appId: "1:942535580975:web:2415019ca7a48a818695da",
    measurementId: "G-Q46MW48X8E"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

var database = firebase.database();

document.addEventListener("DOMContentLoaded", function () {
    // Limpa o conteúdo do contêiner antes de carregar as seções
    var container = document.querySelector(".container");
    container.innerHTML = "";

    // Obtém as seções do Firebase ao carregar a página
    database.ref('secoes').on('value', function (snapshot) {
        var secoes = snapshot.val();

        if (secoes) {
            // Itera sobre as seções e as adiciona ao DOM
            Object.keys(secoes).forEach(function (secaoId) {
                var secao = secoes[secaoId];
                adicionarSecaoAoDOM(secaoId, secao.id, secao.titulo, secao.descricao, secao.tipo);
            });
        }
    });
});

function adicionarSecaoAoDOM(secaoId, id, titulo, descricao, tipo) {
    var container = document.querySelector(".container");

    var novaSecao = document.createElement("div");
    novaSecao.className = "section";
    novaSecao.id = secaoId;

    var panel = document.createElement("div");
    panel.className = "panel";

    var h1 = document.createElement("h1");
    h1.textContent = titulo || "Uso Privado - Nova Seção";

    var p = document.createElement("p");
    p.textContent = descricao || "Conteúdo da Nova Seção aqui.";

    var button = document.createElement("button");
    button.textContent = "VER CONTEÚDO";

    // Adiciona a informação do tipo como um atributo personalizado
    novaSecao.setAttribute("data-tipo", tipo);

    // Adiciona um evento de clique ao botão
    button.addEventListener("click", function () {
        redirecionarParaURL(secaoId);
    });

    panel.appendChild(h1);
    panel.appendChild(p);
    panel.appendChild(button);

    // Adiciona o ID ao DOM
    var idElement = document.createElement("p");
    idElement.textContent = "ID: " + id;
    panel.appendChild(idElement);

    novaSecao.appendChild(panel);
    container.appendChild(novaSecao);
}

function obterProximoID() {
    // Obtém o maior ID das seções no Firebase e retorna o próximo ID
    return database.ref('secoes').once('value').then(function (snapshot) {
        var secoes = snapshot.val();
        var maioresIDs = Object.keys(secoes || {}).map(Number).filter(Boolean);

        if (maioresIDs.length === 0) {
            // Se não há IDs, retorna 3
            return 3;
        } else {
            // Caso contrário, retorna o próximo ID disponível
            var maiorID = Math.max.apply(null, maioresIDs);
            return maiorID + 1;
        }
    });
}

function adicionarNovaSecao() {
    obterProximoID().then(function (proximoID) {
        var container = document.querySelector(".container");

        var titulo = prompt("Digite o título da nova seção:");
        var descricao = prompt("Digite a descrição da nova seção:");
        var tipo = prompt("Escolha o tipo de seção:\n1-> Upar Foto/Texto/Links/Zip\n2-> Somente texto/links");

        // Adiciona os dados da nova seção ao Firebase usando o próximo ID
        var novoNo = {};
        novoNo['secao' + proximoID] = {
            id: proximoID,
            titulo: titulo,
            descricao: descricao,
            tipo: tipo,
            botao: {
                redirecionar: "pagdec" + tipo + ".html",
                texto: "VER CONTEÚDO"
            }
        };

        // Atualiza o Firebase após adicionar a seção ao DOM
        database.ref('secoes').update(novoNo);

        location.reload()

        // Redireciona para a página HTML correspondente à opção escolhida
        var nomePaginaHTML = "pagdec" + tipo + ".html";
        window.location.href = nomePaginaHTML;
    });
}

function salvarPaginaHTML(nomePagina, id, titulo, descricao) {
    // Clone a página HTML correspondente ao tipo de seção
    var tipoPaginaHTML = "pagdec" + tipo + ".html";
    var nomePaginaClone = "pagdiscsec" + id + ".html";

    // Adiciona o conteúdo específico ao clone da página
    var conteudoEspecifico = `<h1>${titulo}</h1><p>${descricao}</p><p>ID: ${id}</p>`;
    var paginaHTMLClone = document.createElement('html');
    paginaHTMLClone.innerHTML = `<body>${conteudoEspecifico}</body>`;

    // Salva o clone da página como pagdiscsec(id da secao).html
    var blob = new Blob([paginaHTMLClone.outerHTML], { type: 'text/html' });
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = nomePaginaClone;
    link.click();
}


function redirecionarParaURL(secaoId) {
    // Obtém o tipo de seção do Firebase
    database.ref('secoes/' + secaoId + '/botao/redirecionar').once('value', function (snapshotURL) {
        var url = snapshotURL.val();

        // Redireciona para a página HTML correspondente
        window.location.href = url;
    });
}


function mostrarSecoesParaRemover() {
    var idToRemove = prompt("Digite o ID da seção que deseja remover:");

    // Verifica se o ID inserido é válido (número)
    if (!isNaN(idToRemove) && idToRemove !== null) {
        removerSecao(idToRemove);
    } else {
        alert("ID inválido. Tente novamente.");
    }
}

function removerSecao(idToRemove) {
    var secaoRef = database.ref('secoes/secao' + idToRemove);

    // Verifica se a seção existe antes
    secaoRef.once('value').then(function (snapshot) {
        if (snapshot.exists()) {
            secaoRef.remove();
            alert("Seção removida com sucesso!");

            // Atualiza o DOM removendo a seção
            var container = document.querySelector(".container");
            var secaoRemover = document.getElementById("secao" + idToRemove);
            if (secaoRemover) {
                container.removeChild(secaoRemover);
            }

            // Recarrega a página automaticamente
            location.reload();
        } else {
            alert("Seção não encontrada. Verifique o ID e tente novamente.");
        }
    });
}
