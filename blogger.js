// BloggerJS v0.1.0
// Copyright (c) 2017 Kenny Cruz
// Licensed under the MIT License

var postsOrPages = ["pages", "posts"],
    urlAmp = "&amp;".substring(0, 1),
    secondRequest = true,
    feedPriority = 0,
    jsonIndex = 1,
    urlTotal;

// urlVal();
// Valida si la URL corresponde a un post/pagina, si no,
// o si corresponde al index.
function urlVal(){

  var url = window.location.pathname;
  var length = url.length;
  var urlEnd = url.substring(length - 5);

  if(urlEnd === ".html") return 0;
  else if(length > 1) return 1;
  else return 2;

}

// urlMod();
// Analiza la URL para identificar si se trata de un post o una pagina,
// para despues modificarla eliminando la fecha o el "/p/", así como el ".html".
function urlMod(){

  var url = window.location.pathname;

  if(url.substring(1, 2) === "p"){
    url = url.substring(url.indexOf("/",1) + 1);
    url = url.substr(0, url.indexOf(".html"));
    history.replaceState(null, null, "../" + url);
  }
  else{
    url = url.substring(url.indexOf("/",7) + 1);
    url = url.substr(0, url.indexOf(".html"));
    history.replaceState(null, null, "../../" + url);
  }

}

// urlSearch(url, database);
// Busca una url especifica en la base de datos, si la encuentra,
// entonces dirigirá a ella.
function urlSearch(url, database){

  var pathname = url + ".html";

  database.forEach(function(element){
    var search = element.search(pathname);
    if(search !== -1) window.location = element;
  });

}

// urlManager(database, id);
// Ejecuta una validación de URL, para determinar con el resultado
// la acción a realizar (modificarla o buscarla en el feed del blog).
function urlManager(){

  var validation = urlVal();

  if(validation === 0) urlMod();
  else if(validation === 1) getJSON(postsOrPages[feedPriority], 1);
  else if(validation === 2) history.replaceState(null, null, "/");

}

// getJSON();
// Realiza una petición al feed y obtiene los datos en formato JSON,
// y los envía mediante un callback.
function getJSON(postsOrPages, index){

  var script = document.createElement("script");
  var jsonUrl = window.location.protocol + "//" + window.location.hostname + "/feeds/" + postsOrPages + "/default?start-index=" + index + "#max-results=150#orderby=published#alt=json-in-script#callback=bloggerJSON";
  jsonUrl = jsonUrl.replace(/#/g, urlAmp);
  script.type = "text/javascript";
  script.src = jsonUrl;
  document.getElementsByTagName("head")[0].appendChild(script);

}

// bloggerJSON();
// Obtiene las URL del feed en formato JSON
// y las envía para comparar la URL actual.
function bloggerJSON(json){

  var database = [];

  if(urlTotal == undefined) urlTotal = parseInt(json.feed.openSearch$totalResults.$t);

  json.feed.entry.forEach(function(element, index){
    var entry = json.feed.entry[index];
    entry.link.forEach(function(element, index){
      if(entry.link[index].rel === "alternate") database.push(entry.link[index].href);
    });
  });

  urlSearch(window.location.pathname, database);

  if(urlTotal > 150){
    jsonIndex += 150;
    urlTotal -= 150;
    getJSON(postsOrPages[feedPriority], jsonIndex);
  }
  else if(secondRequest){

    urlTotal = undefined;
    jsonIndex = 1;
    secondRequest = false;

    if(feedPriority === 0){
      feedPriority = 1;
      getJSON(postsOrPages[feedPriority], 1);
    }
    else if(feedPriority === 1){
      feedPriority = 0;
      getJSON(postsOrPages[feedPriority], 1);
    }

  }

}

// bloggerJS();
// Incializa BloggerJS.
// Puede recibir como parametro el orden de busqueda para las URL,
// es decir, si iniciará a comparar contra las entradas o las páginas.
// 0 ó vacío = Páginas, 1 = Entradas.
function bloggerJS(priority){

  if(priority != undefined) feedPriority = priority;
  urlManager();

}
