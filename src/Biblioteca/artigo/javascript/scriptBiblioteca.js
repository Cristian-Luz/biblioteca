/*-------------------------------------------------------------------------------------------------------*/

/* BANCO DE DADOS */
var request = window.indexedDB.open("Artigo.DB", 1); // Incrementando a versão do banco de dados
var db;

request.onupgradeneeded = function(event) {
    db = event.target.result;
  
    // Verifica se o objeto de armazenamento "livros" já existe
    if (!db.objectStoreNames.contains("livros")) {
      // Se não existir, crie o objeto de armazenamento "livros"
      var livrosStore = db.createObjectStore("livros", { keyPath: "id", autoIncrement: true });
      // Crie um índice que abranja nome e matéria
      livrosStore.createIndex("nome-materia", ["nome", "materia"]);
      console.log("Objeto de armazenamento 'livros' foi criado com sucesso.");
    }
};

request.onsuccess = function(event) {
    db = event.target.result;
    console.log("Banco de dados aberto com sucesso");
};

request.onerror = function(event) {
  console.error("Erro ao abrir o banco de dados: " + event.target.error);
};



/*-------------------------------------------------------------------------------------------------------*/

/* LIGAR E DESLIGAR O BOTAO ADICIONAR */ 

const btnAdicionar = document.getElementById("btn-adicionar");
const seAdicionarLivro = document.getElementById("se-adicionar-livro");
const btnFechar = document.getElementById("btn-fechar");

btnAdicionar.addEventListener("click", () => {
    seAdicionarLivro.style.display = "flex";
    window.scrollTo(0, 0); // Isso fará a rolagem da página para o topo
});

btnFechar.addEventListener("click", () => {
    seAdicionarLivro.style.display = "none";
});

/*-------------------------------------------------------------------------------------------------------*/

const listaLivros = document.getElementById("lista-livros");

/*-------------------------------------------------------------------------------------------------------*/

/*BOTÃO INPUT*/

const inputNome = document.getElementById("input-nome");
inputNome.setAttribute("maxlength", "38");
const inputMateria = document.getElementById("input-materia");
inputMateria.setAttribute("maxlength", "40");

const btnPDF = document.getElementById("pdfFile") 
const iptPDF = document.getElementById("input-pdf") 
const btnPNG = document.getElementById("pngFile") 
const iptPNG = document.getElementById("input-png") 



btnPDF.addEventListener("click", (event) => {
    event.preventDefault(); // Impede o comportamento padrão de envio do formulário
    iptPDF.click();
});
 
btnPNG.addEventListener("click", (event) => {
    event.preventDefault(); // Impede o comportamento padrão de envio do formulário
    iptPNG.click();
});

/*-------------------------------------------------------------------------------------------------------*/

/* BOTÃO DE ADICIONAR LIVRO A LISTA */  

const btnADC = document.getElementById("btn-adc");

btnADC.addEventListener("click", function(event) {
    event.preventDefault();

    // Captura os valores dos campos de entrada quando o botão é clicado
    var nome = inputNome.value;
    var materia = inputMateria.value;
    var filePDF= iptPDF.files[0];
    var filePNG = iptPNG.files[0];
    
    // Certifique-se de que os campos obrigatórios estejam preenchidos com arquivos
    if (nome.trim() === "" || materia.trim() === "" || !filePDF || !(filePDF instanceof File) || !filePNG || !(filePNG instanceof File)) {
        alert("Por favor, preencha todos os campos obrigatórios com arquivos.");
        return;
    }

    const transaction = db.transaction(["livros"], "readwrite");
    const livrosStore = transaction.objectStore("livros");

    // Cria um novo objeto 'livro' com os valores capturados
    var livro = {
        nome: nome,
        materia: materia,
        filePDF: filePDF,
        fileIMG: filePNG,
    };

    const request = livrosStore.add(livro);

    request.onsuccess = function(event) {
      recarregarListaLivros();
    };
  
    request.onerror = function(event) {
      console.error("Erro ao adicionar o livro ao banco de dados: " + request.error);
      // Fornecer feedback de erro ao usuário
      alert("Erro ao adicionar o livro: " + request.error);
    };

    // Limpar os campos de entrada
    inputNome.value = "";
    inputMateria.value = "";
    iptPDF.value = "";
    iptPNG.value = "";
});

/*-------------------------------------------------------------------------------------------------------*/

function adicionarRegistrosALista(registros) {
    var listaLivros = document.getElementById("lista-livros");

    // Limpe a lista existente
    listaLivros.innerHTML = "";

    registros.forEach(function (registro) {
        var li = document.createElement("li");
        var nomeLivro = document.createElement("span");
        var materiaLivro = document.createElement("span");
        var imagemLivro = document.createElement("img"); 
        var excluirBotao = document.createElement("button"); 
        var abrirPdfBotao = document.createElement("button"); 

        var div = document.createElement("div");
        var div0 = document.createElement("div");
        var div1 = document.createElement("div");
        
        li.classList.add("classe-li");
        nomeLivro.classList.add("livro-nome");
        materiaLivro.classList.add("livro-materia");
        imagemLivro.classList.add("imagem-livro");
        excluirBotao.classList.add("botao");
        abrirPdfBotao.classList.add("botao");

        div.classList.add("classe-da-div");
        div0.classList.add("classe-da-div");
        div1.classList.add("classe-da-div");
        div1.classList.add("classe-da-div-btn");

        nomeLivro.textContent = registro.nome;
        materiaLivro.textContent = registro.materia;
        imagemLivro.src = registro.imagemURL;
        excluirBotao.textContent = "Excluir Livro";
        abrirPdfBotao.textContent = "Abrir PDF";

        // Crie uma URL temporária para a imagem (blob) e atribua-a ao atributo src da imagem
        var imagemUrl = URL.createObjectURL(registro.fileIMG);
        imagemLivro.src = imagemUrl;

        imagemLivro.addEventListener("click", function() {
            // Chame a função para abrir o PDF aqui
            abrirPDF(registro.filePDF);
        });

        // Adicione um manipulador de evento para o botão "Abrir PDF"
        abrirPdfBotao.addEventListener("click", function () {
            abrirPDF(registro.filePDF);
        });

        // Adicione um manipulador de evento para o botão "Excluir Livro"
        excluirBotao.addEventListener("click", function () {
            excluirLivro(registro.id);
        });

        div.appendChild(nomeLivro);
        div0.appendChild(materiaLivro);
        div1.appendChild(abrirPdfBotao);
        div1.appendChild(excluirBotao);

        li.appendChild(imagemLivro);
        li.appendChild(div);
        li.appendChild(div0);
        li.appendChild(div1);

        listaLivros.appendChild(li);
    });
}

request.onsuccess = function(event) {
    db = event.target.result;
    
    // Recupere os registros e atualize a lista
    var transaction = db.transaction(["livros"], "readonly");
    var livrosStore = transaction.objectStore("livros");
  
    var registros = [];
    livrosStore.openCursor().onsuccess = function(event) {
      var cursor = event.target.result;
      if (cursor) {
        registros.push(cursor.value);
        cursor.continue();
      } else {
        adicionarRegistrosALista(registros);
        console.log("Livros recuperados com sucesso");
        console.log(registros);

        
      }
    };
};
  
request.onerror = function(event) {
    console.error("Erro ao abrir o banco de dados: " + event.target.error);
};

function abrirPDF(file) {
    // Crie um objeto URL a partir do arquivo PDF e abra em uma nova janela
    var pdfURL = URL.createObjectURL(file);
    window.open(pdfURL, '_blank');
}

  // Função para excluir um livro do IndexedDB com base no ID
function excluirLivro(livroId) {
    var transaction = db.transaction(["livros"], "readwrite");
    var livrosStore = transaction.objectStore("livros");

    var request = livrosStore.delete(livroId);

    request.onsuccess = function () {
        console.log("Livro excluído com sucesso.");
        // Recarregue a lista de livros após a exclusão
        recarregarListaLivros();
    };

    request.onerror = function () {
        console.error("Erro ao excluir o livro: " + request.error);
    };
}

// Função para recarregar a lista de livros após a exclusão
function recarregarListaLivros() {
    var transaction = db.transaction(["livros"], "readonly");
    var livrosStore = transaction.objectStore("livros");
    var registros = [];

    livrosStore.openCursor().onsuccess = function (event) {
        var cursor = event.target.result;
        if (cursor) {
            registros.push(cursor.value);
            cursor.continue();
        } else {
            adicionarRegistrosALista(registros);
            console.log("Livros recuperados com sucesso após a exclusão.");
        }
    };
}

function filtrarNomeMateria() {
    var searchText = inputPesquisa.value.toLowerCase().trim();

    var transaction = db.transaction(["livros"], "readonly");
    var livrosStore = transaction.objectStore("livros");

    var registros = [];

    livrosStore.openCursor().onsuccess = function(event) {
        var cursor = event.target.result;

        if (cursor) {
            var livro = cursor.value;

            // Verifique se o nome ou a matéria do livro contém o texto de pesquisa
            if (livro.nome.toLowerCase().includes(searchText) || livro.materia.toLowerCase().includes(searchText)) {
                registros.push(livro);
            }

            cursor.continue();
        } else {
            adicionarRegistrosALista(registros);
        }
    };
}

var listaExibicaoLivros = document.getElementById("lista-livros");

var inputPesquisa = document.getElementById("input-pesquisa");

// Adiciona um ouvinte de evento "input" ao elemento com o ID "searchInput".
inputPesquisa.addEventListener("input", function() {

    // Limpa o temporizador anterior, se existir, para evitar chamadas múltiplas.
    clearTimeout(this.timer);
  
    // Define um novo temporizador. Após 300 milissegundos (ou 0,3 segundos),
    // a função dentro do setTimeout será executada.
    this.timer = setTimeout(function() {
  
      // Chama a função "filterImagesByNameOrDescription" e passa o valor atual do campo de pesquisa como argumento.
      filtrarNomeMateria(inputPesquisa.value);
  
    }, 300); // Tempo definido em milissegundos (300ms = 0,3 segundos).
  });
    
/*--------------------------------------------------------------*/

// Obtém uma referência aos botões
var btnNomeAZ = document.getElementById("btn-nome-az");
var btnMateriaAZ = document.getElementById("btn-materia-az");

// Adiciona um evento de clique ao botão "POR NOME A - Z"
btnNomeAZ.addEventListener("click", function() {
    ordenarPorNomeAZ();
});

// Adiciona um evento de clique ao botão "POR MATÉRIA A - Z"
btnMateriaAZ.addEventListener("click", function() {
    ordenarPorMateriaAZ();
});

var ordemNomeAZ = true;
var ordemMateriaAZ = true;

function ordenarPorNomeAZ() {
    var listaLivros = document.getElementById("lista-livros");
    var items = Array.from(listaLivros.children);

    items.sort(function (a, b) {
        var nomeA = a.querySelector(".livro-nome").textContent.toLowerCase();
        var nomeB = b.querySelector(".livro-nome").textContent.toLowerCase();
        var comparacao = nomeA.localeCompare(nomeB);

        return ordemNomeAZ ? comparacao : -comparacao;
    });

    // Alterne a variável de estado
    ordemNomeAZ = !ordemNomeAZ;

    // Remova os itens da lista atual
    items.forEach(function (item) {
        listaLivros.removeChild(item);
    });

    // Adicione os itens ordenados de volta à lista
    items.forEach(function (item) {
        listaLivros.appendChild(item);
    });
}

function ordenarPorMateriaAZ() {
    var listaLivros = document.getElementById("lista-livros");
    var items = Array.from(listaLivros.children);

    items.sort(function (a, b) {
        var materiaA = a.querySelector(".livro-materia").textContent.toLowerCase();
        var materiaB = b.querySelector(".livro-materia").textContent.toLowerCase();
        var comparacao = materiaA.localeCompare(materiaB);

        return ordemMateriaAZ ? comparacao : -comparacao;
    });

    // Alterne a variável de estado
    ordemMateriaAZ = !ordemMateriaAZ;

    // Remova os itens da lista atual
    items.forEach(function (item) {
        listaLivros.removeChild(item);
    });

    // Adicione os itens ordenados de volta à lista
    items.forEach(function (item) {
        listaLivros.appendChild(item);
    });
}

/*--------------------------------------------------------------*/






