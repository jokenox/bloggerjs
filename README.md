<p align="center"><a href="#" target="_blank"><img width="100" src="/img/logo.svg"></a></p>
<h1>BloggerJS</h1>
<p>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-brightgreen.svg"></a>
  <a href="https://github.com/jokenox/bloggerjs/tree/2ea81a1"><img src="https://img.shields.io/badge/latest%20ver-v0.4.0-orange.svg"></a>
</p>

**BloggerJS** es un script para modificar el formato de las URL en un blog de Blogger. Creando visualmente una mejor navegación.<br/><br/>
El script se integra a tu blog y "limpia" las URLs en todo el sitio durante la navegación, eliminando de ellas la fecha ```"/YYYY/MM"``` o el ```"/p"```, según sea el caso, así como también el ```".html"```.
También de esta manera resulta más cómodo compartir una URL, pues luce mucho mejor.<br/>
<p><img src="/img/url_demo.png"></p>

## Implementación

Para implementar **BloggerJS** en tu blog, copia todo el siguiente código:
```javascript
<script type="text/javascript">
// BloggerJS v0.4.0
// Licensed under the MIT License
// Copyright (c) 2017-2018 Kenny Cruz
// github.com/jokenox

// Configuration
var config = {
  postsDatePrefix: false,
  accessOnly: false,

  useApiV3: false,
  apiKey: "YOUR-API-KEY-HERE"
}
var postsOrPages=["pages","posts"],blogId="<data:blog.blogId/>",urlTotal,fetchIndex=1,ampChar="&amp;"[0],secondRequest=!0,feedPriority=0,nextPageToken;function urlVal(){var url=window.location.pathname;var length=url.length;var urlEnd=url.substring(length-5);if(urlEnd===".html")return 0;else if(length>1)return 1;else return 2}
function urlMod(){var url=window.location.pathname;if(url.substring(1,2)==="p"){url=url.substring(url.indexOf("/",1)+1);url=url.substr(0,url.indexOf(".html"));history.replaceState(null,null,"../"+url)}else{if(!config.postsDatePrefix)url=url.substring(url.indexOf("/",7)+1);else url=url.substring(1);url=url.substr(0,url.indexOf(".html"));history.replaceState(null,null,"../../"+url)}}
function urlSearch(url,database){var pathname=url+".html";database.forEach(function(element){var search=element.search(pathname);if(search!==-1)window.location=element})}
function urlManager(){var validation=urlVal();if(validation===0){if(!config.accessOnly)urlMod()}else if(validation===1){fetchData(postsOrPages[feedPriority],1)}else if(validation===2){if(!config.accessOnly)history.replaceState(null,null,"/")}}
function fetchData(postsOrPages,index){var script=document.createElement("script");if(config.useApiV3){var jsonUrl="https://www.googleapis.com/blogger/v3/blogs/"+blogId+"/"+postsOrPages+"?key="+config.apiKey+"#maxResults=500#fields=nextPageToken%2Citems(url)#callback=parseData";if(nextPageToken)jsonUrl+="#pageToken="+nextPageToken;nextPageToken=undefined}else{var jsonUrl=window.location.protocol+"//"+window.location.hostname+"/feeds/"+postsOrPages+"/summary?start-index="+index+"#max-results=150#orderby=published#alt=json-in-script#callback=parseData"}
jsonUrl=jsonUrl.replace(/#/g,ampChar);script.type="text/javascript";script.src=jsonUrl;document.getElementsByTagName("head")[0].appendChild(script)}
function parseData(json){var database=[];if(!config.useApiV3){if(!urlTotal){urlTotal=parseInt(json.feed.openSearch$totalResults.$t)}
try{json.feed.entry.forEach(function(element,index){var entry=json.feed.entry[index];entry.link.forEach(function(element,index){if(entry.link[index].rel==="alternate")database.push(entry.link[index].href)})})}catch(e){}}else{try{json.items.forEach(function(element,index){database.push(element.url)})}catch(e){}
nextPageToken=json.nextPageToken}
urlSearch(window.location.pathname,database);if(urlTotal>150){fetchIndex+=150;urlTotal-=150;fetchData(postsOrPages[feedPriority],fetchIndex)}else if(nextPageToken){fetchData(postsOrPages[feedPriority])}else if(secondRequest){nextPageToken=undefined;urlTotal=0;fetchIndex=1;secondRequest=!1;if(feedPriority===0){feedPriority=1;fetchData("posts",1)}else if(feedPriority===1){feedPriority=0;fetchData("pages",1)}}}
function bloggerJS(priority){if(priority)feedPriority=priority;urlManager()}
bloggerJS()
</script>
```

Ya que copiaste completamente el código anterior, dirígete al código HTML de tu plantilla y busca la etiqueta ```<head>```, pega el código justo debajo de ella:

```html
<head>
<!-- Aquí va el código -->
...
```
Una vez hecho esto, sólo guarda los cambios hechos a tu plantilla. Después de ello, **BloggerJS** estará funcionando.

### Nota:
Aunque con sólo copiar y pegar el código, **BloggerJS** estará funcionando, es recomendable (sobre todo para blogs con mucho contenido) configurar el script para funcionar con el API v3 de Blogger, puesto que esta es muy superior en rendimiento y velocidad.

## Configuración
Al principio del script encontrarás variables de configuración, modificar estas propiedades es opcional. La descripción de cada una está en la siguiente tabla:

| Propiedad       | Valor por defecto | Descripción                                                                             |
|-----------------|-------------------|-----------------------------------------------------------------------------------------|
| postsDatePrefix | false             | Permitir la fecha en las URLs de las entradas/posts.                                    |
| accessOnly      | false             | Las URLs cortas sólo sirven para acceder al sitio, mas no en su funcionamiento general. |
| useApiV3        | false             | Usar API v3 de Blogger.                                                                 |
| apiKey          | -             | API Key para el uso del API v3 de Blogger.                                              |

## Licencia
Licensed under the [MIT License](./LICENSE).<br/>
Copyright (c) 2017-2018 [Kenny Cruz](https://github.com/jokenox).
