// BloggerJS v0.4.0
// Licensed under the MIT License
// Copyright (c) 2017-2018 Kenny Cruz
// github.com/jokenox

// Configuración
var config = {
  // Permite las fechas en las URL de entradas.
  postsDatePrefix: false,

  // URL cortas sólo para entrar al sitio,
  // mas no en su funcionamiento general.
  accessOnly: false,

  // Usar API v3 de Blogger.
  useApiV3: false,
  apiKey: "YOUR-API-KEY-HERE"
}

var postsOrPages = ["pages", "posts"],
    blogId = "<data:blog.blogId/>",
    urlTotal, fetchIndex = 1,
    ampChar = "&amp;"[0],
    secondRequest = true,
    feedPriority = 0,
    nextPageToken;

// urlVal();
// Valida si la URL corresponde a un post/página,
// si no, o si corresponde al index.
function urlVal() {
  var url = window.location.pathname;
  var length = url.length;
  var urlEnd = url.substring(length - 5);
  if (urlEnd === ".html") return 0;
  else if (length > 1) return 1;
  else return 2;
}

// urlMod();
// Modifica la URL eliminando la fecha o el "/p/", así como el ".html".
function urlMod() {
  var url = window.location.pathname;
  if (url.substring(1, 2) === "p") {
    url = url.substring(url.indexOf("/",1) + 1);
    url = url.substr(0, url.indexOf(".html"));
    history.replaceState(null, null, "../" + url);
  } else {
    if (!config.postsDatePrefix) url = url.substring(url.indexOf("/",7) + 1);
    else url = url.substring(1);
    url = url.substr(0, url.indexOf(".html"));
    history.replaceState(null, null, "../../" + url);
  }
}

// urlSearch(url, database);
// Busca una url específica en la base de datos, si la encuentra,
// entonces dirigirá a ella.
function urlSearch(url, database) {
  var pathname = url + ".html";
  database.forEach(function(element) {
    var search = element.search(pathname);
    if (search !== -1) window.location = element;
  });
}

// urlManager(database, id);
// Ejecuta una validación de URL, para determinar con el resultado
// la acción a realizar (modificarla o buscarla en el feed del blog).
function urlManager() {
  var validation = urlVal();
  if (validation === 0) {
    if (!config.accessOnly) urlMod();
  } else if (validation === 1) {
    fetchData(postsOrPages[feedPriority], 1);
  } else if (validation === 2) {
    if (!config.accessOnly) history.replaceState(null, null, "/");
  }
}

// fetchData();
// Realiza una petición de datos del blog.
function fetchData(postsOrPages, index) {
  var script = document.createElement("script");
  if (config.useApiV3) {
    var jsonUrl = "https://www.googleapis.com/blogger/v3/blogs/" + blogId + "/" + postsOrPages +
                  "?key=" + config.apiKey + "#maxResults=500#fields=nextPageToken%2Citems(url)#callback=parseData";
    if (nextPageToken) jsonUrl += "#pageToken=" + nextPageToken;
    nextPageToken = undefined;
  } else {
    var jsonUrl = window.location.protocol + "//" + window.location.hostname + "/feeds/" + postsOrPages +
                  "/summary?start-index=" + index + "#max-results=150#orderby=published#alt=json-in-script#callback=parseData";
  }
  jsonUrl = jsonUrl.replace(/#/g, ampChar);
  script.type = "text/javascript";
  script.src = jsonUrl;
  document.getElementsByTagName("head")[0].appendChild(script);
}

// parseData();
// Obtiene datos en formato JSON, los clasifica
// y los envía para comparar la URL actual.
function parseData(json) {
  var database = [];

  if (!config.useApiV3) {
    if (!urlTotal) {
      urlTotal = parseInt(json.feed.openSearch$totalResults.$t);
    }

    try {
      json.feed.entry.forEach(function(element, index) {
        var entry = json.feed.entry[index];
        entry.link.forEach(function(element, index) {
          if (entry.link[index].rel === "alternate") database.push(entry.link[index].href);
        });
      });
    } catch(e) {}
  } else {
    try {
      json.items.forEach(function(element, index) {
        database.push(element.url);
      });
    } catch(e) {}
    nextPageToken = json.nextPageToken;
  }

  urlSearch(window.location.pathname, database);

  if (urlTotal > 150) {
    fetchIndex += 150;
    urlTotal -= 150;
    fetchData(postsOrPages[feedPriority], fetchIndex);
  } else if (nextPageToken) {
    fetchData(postsOrPages[feedPriority]);
  } else if(secondRequest) {
    nextPageToken = undefined;
    urlTotal = 0;
    fetchIndex = 1;
    secondRequest = false;
    if (feedPriority === 0) {
      feedPriority = 1;
      fetchData("posts", 1);
    } else if(feedPriority === 1) {
      feedPriority = 0;
      fetchData("pages", 1);
    }
  }
}

// bloggerJS();
// Incializa BloggerJS.
// Puede recibir como parámetro el orden de búsqueda para las URL,
// es decir, si iniciará a comparar contra las páginas o las entradas.
// 0 ó vacío = Páginas, 1 = Entradas.
function bloggerJS(priority) {
  if (priority) feedPriority = priority;
  urlManager();
}

bloggerJS();
