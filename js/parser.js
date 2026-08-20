/*
  The logic of minecraft books (last time I checked): 

  1) Each line contains 144 pixels
  2) Each character occupies N pixels (see char2widths.js)   
  3) There is an extra 1-pixel padding after each non-white character. 

  My implementation groups the input text into "wordoids" of adjacent non-white characters and white characters (ex, [ "Mother!", " ", " ", "She", " ", "said.", "\n" ])
  We separate these groups of text into lines, such that each line contains at most LINE_WIDTH characters. We don't split wordoids between two lines, we start a new line if a word doesn't fit.
  The lines are then joined together into pages, each page containing 14 lines.

  TODO: 
    1) Add logic to deal with wordoids that are longer than LINE_WIDTH.
    2) Create a live-rendering of the output text on a minecraft book
    3) Test the code in-game more thoroughly. 
*/

class TextParser {
  constructor() {
    this.results = [];
  }

  /*
    tests if a character is a white-space character. 
    you can either pass a character, or a word with an index.
    Usage: 
        this.isWhite( " " ) // true
        this.isWhite( "My heart", 0 ) // false
        this.isWhite( "My heart", 2 ) // true
  */
  isWhite( char, id=0 ) {
     return /\s/.test(char.charAt(id))
  }
  
  group2width( chars ) {
    // if the first character is non-white, the rest also will be. if so, we will add 1-pixel padding after each character. 
    const pad = 0 + !this.isWhite(chars[0])
    let width = pad * chars.length; 
    for ( let c = 0; c < chars.length; c++ ) {
      const char = chars[c]
      width += PIXEL_WIDTHS[char]
    }
    return width
  }

  /*
  This function splits the input into adjacent non-white
  characters and white characters. It also returns an array
  with the width in pixels fo each group of characters. 

  input : "Mother!  She said.\n"
  output: [ "Mother!", " ", " ", "She", " ", "said.", "\n" ]
          [ 36, 3, 3, 18, 3 ]
  */ 
  characters2groups( text ) {
    // outputs
    let groups = []
    let widths = []
    // temporary variables and helper funs
    let characters  = []
    let isPrevWhite = this.isWhite(text.charAt(0));
    let expandGroup = ( new_char ) => { characters.push( new_char ) };
    let addGroupAndReset = ( new_char ) => { groups.push( characters ); widths.push( this.group2width( characters ) ); characters = [ new_char ] }
    // main loop
    for ( let i = 0; i < text.length; i++ ) {
      const char = text.charAt(i)
      const isThisWhite = this.isWhite(char)
      if ( !isThisWhite && !isPrevWhite ) {
        expandGroup( char )
      } else {
        addGroupAndReset( char )
      }
      isPrevWhite = isThisWhite
    }
    addGroupAndReset( "" )
    return [ groups, widths ]
  }

  /*
  organizes groups of characters into lines
  */
  groups2lines( groups ) {
    // outputs
    let lines = []
    let line_widths = []
    // temporary variables
    let line = ""
    let line_capacity = LINE_WIDTH
    let addLine = () => { lines.push( line ); line_widths.push( LINE_WIDTH - line_capacity ); }
    let createLine = ( word, width ) => { line = word; line_capacity = LINE_WIDTH - width;}
    let addLineAndReset = () => { addLine(); createLine( "", 0 ) };
    for ( let i = 0; i < groups.length; i++ ) {
      const g = groups[i].join('')
      if ( g.charAt(0) == "\n" ) { // new line character
        addLineAndReset();
        continue
      }
      const w = Math.max( 0, this.group2width( groups[i] ) )
      if ( w < line_capacity ) { // word-oid fits in current line
        line += g;
        line_capacity -= w;
      } else { // word-oid doesn't fit in current line
        addLine(); 
        createLine( g, w );
      }
    }
    addLine();
    return lines
  }

  /*
  adding 14 lines per page
  */
  lines2pages( lines ) {
    let pages = []
    let page  = ""
    let numlines = 0
    for ( let i = 0; i < lines.length; i++ ) {
      page += lines[i]
      numlines += 1
      if ( numlines == 14 ) {
        pages.push( page )
        numlines = 0
        page = ""
      }
    }
    if ( numlines != 0 ) {
      pages.push( page )
    }
    return pages
  }


  
  parse(text) {

    let groups = this.characters2groups( text )
    let lines  = this.groups2lines( groups[0] )
    let pages  = this.lines2pages( lines )

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