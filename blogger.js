// BloggerJS v0.3.0
// Copyright (c) 2017-2018 Kenny Cruz
// Licensed under the MIT License

// Configuración -----------

// Permite las fechas en las URL de entradas.
var postsDatePrefix = false;

// URL cortas sólo para entrar al sitio,
// mas no en su funcionamiento general.
var accessOnly = false;

// Usar API v3 de Blogger
var useApiV3 = false;
var apiKey = "";
var blogId = "";

// -------------------------

var postsOrPages = ["posts", "pages"],
    urlTotal, jsonIndex = 1,
    secondRequest = true,
    feedPriority = 0,
    amp = "&amp;"[0],
    nextPageToken;

// urlVal();
// Valida si la URL corresponde a un post/página, si no,
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
// Analiza la URL para identificar si se trata de un post o una página,
// para después modificarla eliminando la fecha o el "/p/", así como el ".html".
function urlMod(){
  var url = window.location.pathname;
  if(url.substring(1, 2) === "p"){
    url = url.substring(url.indexOf("/",1) + 1);
    url = url.substr(0, url.indexOf(".html"));
    history.replaceState(null, null, "../" + url);
  }
  else{
    if(!postsDatePrefix) url = url.substring(url.indexOf("/",7) + 1);
    else url = url.substring(1);
    url = url.substr(0, url.indexOf(".html"));
    history.replaceState(null, null, "../../" + url);
  }
}

// urlSearch(url, database);
// Busca una url específica en la base de datos, si la encuentra,
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
  if(validation === 0){
    if(!accessOnly) urlMod();
  }
  else if(validation === 1){
    if(!postsDatePrefix) getJSON(postsOrPages[feedPriority], 1);
    else getJSON("posts", 1);
  }
  else if(validation === 2){
    if(!accessOnly) history.replaceState(null, null, "/");
  }
}

// getJSON();
// Realiza una petición de datos donde vienen las URLs
// y los pasa mediante un callback.
function getJSON(postsOrPages, index){
  var script = document.createElement('script');
  if(useApiV3){
    var jsonUrl = "https://www.googleapis.com/blogger/v3/blogs/" + blogId + "/" + postsOrPages + "?key=" + apiKey + "#maxResults=500#fields=nextPageToken%2Citems(url)#callback=bloggerJSON";
    if(nextPageToken) jsonUrl += "#pageToken=" + nextPageToken;
    nextPageToken = undefined;
  }
  else var jsonUrl = window.location.protocol + "//" + window.location.hostname + "/feeds/" + postsOrPages + "/default?start-index=" + index + "#max-results=150#orderby=published#alt=json-in-script#callback=bloggerJSON";
  jsonUrl = jsonUrl.replace(/#/g, amp);
  script.type = 'text/javascript';
  script.src = jsonUrl;
  document.getElementsByTagName('head')[0].appendChild(script);
}

// bloggerJSON();
// Obtiene datos en formato JSON, los clasifica
// y los envía para comparar la URL actual.
function bloggerJSON(json){
  var database = [];

  if(!useApiV3) if(urlTotal === undefined) urlTotal = parseInt(json.feed.openSearch$totalResults.$t);
  if(!useApiV3){
    json.feed.entry.forEach(function(element, index){
      var entry = json.feed.entry[index];
      entry.link.forEach(function(element, index){
        if(entry.link[index].rel === "alternate") database.push(entry.link[index].href);
      });
    });
  }
  else{
    json.items.forEach(function(element, index){
      database.push(element.url);
    });
    nextPageToken = json.nextPageToken;
  }

  urlSearch(window.location.pathname, database);

  if(urlTotal > 150){
    jsonIndex += 150;
    urlTotal -= 150;
    getJSON(postsOrPages[feedPriority], jsonIndex);
  }
  else if(nextPageToken){
    getJSON(postsOrPages[feedPriority]);
  }
  else if(secondRequest){
    nextPageToken = undefined;
    urlTotal = undefined;
    jsonIndex = 1;
    secondRequest = false;
    if(feedPriority === 0){
      feedPriority = 1;
      getJSON("pages", 1);
    }
    else if(feedPriority === 1){
      feedPriority = 0;
      getJSON("posts", 1);
    }
  }
}

// bloggerJS();
// Incializa BloggerJS.
// Puede recibir como parámetro el orden de búsqueda para las URL,
// es decir, si iniciará a comparar contra las entradas o las páginas.
// 0 ó vacío = Entradas, 1 = Páginas.
function bloggerJS(priority){
  if(priority) feedPriority = priority;
  urlManager();
}
