---
layout: post
title:  "Text 2 ScribbleJson"
date:   2026-03-12 23:06:51 +0200
categories: minecraft
---

## Try the Parser

<textarea id="inputText" rows="5" cols="50" placeholder="Paste your text here..."></textarea>
<br>
<button onclick="runParser()">Parse & Download JSON</button>
<div id="output"></div>

<script src="/js/char2width.js"></script>
<script src="/js/parser.js"></script>
<script>
  function runParser() {
    const parser = new TextParser();
    const text = document.getElementById('inputText').value;
    const result = parser.parse(text);
    
    document.getElementById('output').innerHTML = 
      `<pre>${JSON.stringify(result, null, 2)}</pre>`;
    
    parser.downloadAsJSON(result);
  }
</script>