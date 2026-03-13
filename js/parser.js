// js/parser.js
class TextParser {
  constructor() {
    this.results = [];
  }
  
  parse(text) {
    let pages = []
    let page_capacity = PAGE_WIDTH
    let line_capacity = LINE_WIDTH
    let current_page = ""
    for ( let i = 0; i < text.length; i++) {

      let c = text.charAt( i )
      let w = PIXEL_WIDTHS[ c ] + 1

      let next_line = ( w > line_capacity )
      let next_page = ( w > page_capacity ) 

      if ( next_page ) {
        pages.push( current_page )
        current_page  = c 
        page_capacity = PAGE_WIDTH - w
        line_capacity = LINE_WIDTH - w
      //} else if ( next_line ) { // I think new lines are automatically added by minecraft or the Scribbly mod
      //  current_page  += "\n"
      //  current_page  += c 
      //  page_capacity -= w
      //  line_capacity  = LINE_WIDTH - w
      } else {
        current_page  += c 
        line_capacity -= w 
        page_capacity -= w 
      }
    }
    pages.push( current_page )


    return {
      "author": "Trufelino",
      "pages": pages
    };
  }
  
  downloadAsJSON(data, filename = 'scribbly.json') {
    const blob = new Blob([JSON.stringify(data, null, 2)], 
                          {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}