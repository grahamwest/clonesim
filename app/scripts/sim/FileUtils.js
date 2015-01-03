/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */
var saveAs=saveAs||navigator.msSaveBlob&&navigator.msSaveBlob.bind(navigator)||function(a){"use strict";var b=a.document,c=function(){return a.URL||a.webkitURL||a},d=a.URL||a.webkitURL||a,e=b.createElementNS("http://www.w3.org/1999/xhtml","a"),f="download"in e,g=function(c){var d=b.createEvent("MouseEvents");return d.initMouseEvent("click",!0,!1,a,0,0,0,0,0,!1,!1,!1,!1,0,null),c.dispatchEvent(d)},h=a.webkitRequestFileSystem,i=a.requestFileSystem||h||a.mozRequestFileSystem,j=function(b){(a.setImmediate||a.setTimeout)(function(){throw b},0)},k="application/octet-stream",l=0,m=[],n=function(){for(var a=m.length;a--;){var b=m[a];"string"==typeof b?d.revokeObjectURL(b):b.remove()}m.length=0},o=function(a,b,c){b=[].concat(b);for(var d=b.length;d--;){var e=a["on"+b[d]];if("function"==typeof e)try{e.call(a,c||a)}catch(f){j(f)}}},p=function(b,d){var q,r,x,j=this,n=b.type,p=!1,s=function(){var a=c().createObjectURL(b);return m.push(a),a},t=function(){o(j,"writestart progress write writeend".split(" "))},u=function(){(p||!q)&&(q=s(b)),r&&(r.location.href=q),j.readyState=j.DONE,t()},v=function(a){return function(){return j.readyState!==j.DONE?a.apply(this,arguments):void 0}},w={create:!0,exclusive:!1};return j.readyState=j.INIT,d||(d="download"),f&&(q=s(b),e.href=q,e.download=d,g(e))?(j.readyState=j.DONE,t(),void 0):(a.chrome&&n&&n!==k&&(x=b.slice||b.webkitSlice,b=x.call(b,0,b.size,k),p=!0),h&&"download"!==d&&(d+=".download"),r=n===k||h?a:a.open(),i?(l+=b.size,i(a.TEMPORARY,l,v(function(a){a.root.getDirectory("saved",w,v(function(a){var c=function(){a.getFile(d,w,v(function(a){a.createWriter(v(function(c){c.onwriteend=function(b){r.location.href=a.toURL(),m.push(a),j.readyState=j.DONE,o(j,"writeend",b)},c.onerror=function(){var a=c.error;a.code!==a.ABORT_ERR&&u()},"writestart progress write abort".split(" ").forEach(function(a){c["on"+a]=j["on"+a]}),c.write(b),j.abort=function(){c.abort(),j.readyState=j.DONE},j.readyState=j.WRITING}),u)}),u)};a.getFile(d,{create:!1},v(function(a){a.remove(),c()}),v(function(a){a.code===a.NOT_FOUND_ERR?c():u()}))}),u)}),u),void 0):(u(),void 0))},q=p.prototype,r=function(a,b){return new p(a,b)};return q.abort=function(){var a=this;a.readyState=a.DONE,o(a,"abort")},q.readyState=q.INIT=0,q.WRITING=1,q.DONE=2,q.error=q.onwritestart=q.onprogress=q.onwrite=q.onabort=q.onerror=q.onwriteend=null,a.addEventListener("unload",n,!1),r}(self);

var roundNumber = function(num, dec) {
  var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
  return result;
}

window.simToCsv = function(result) {
	var rows = [];
    
    var rowMaker = function(run, rowIndex, label, cellMaker) {
      var row = [];
      row.push(label);

      for (var i = 0; i < run.size(); i++)
      {
        row.push(cellMaker(run.data[i], rowIndex, i));
      }

      return row.join(",");
    }

    // header rows
    rows.push( rowMaker(result, 0, "Cell Generation #", function(d, ri, ci) { return ci; } ));

    for (var i = 0; i < result.getFirst().size(); i++)
      rows.push( rowMaker(result, i, i+1, function(d, ri, ci) {
      	if (d.data[ri] === true) return "1";
      	else if (d.data[ri] === false) return "0";
      	else return "-";
      }));

  	var addRow = function(label, cellMaker, rowIndex) {
  		rows.push( rowMaker(result, rowIndex, label, cellMaker) );
  	};

  	addRow("Number Positive Cells", function(generation) { return generation.countCellsWithValue(true); } );
  	addRow("Number Negative Cells", function(generation) { return generation.countCellsWithValue(false); } );

    addRow("Total Positive + Negative Cell Number", function(generation) { return generation.countCellsWithValue(true) + generation.countCellsWithValue(false); } );


    addRow("Number Positive Stripes", function(generation) { return generation.countRunsWithValue(true); } );
    addRow("Number Negative Stripes", function(generation) { return generation.countRunsWithValue(false); } );

    // total stripe count)
    addRow("Uncorrected Stripe Count (positive + negative stripes)", function(generation) { return generation.countRunsWithValue(false) + generation.countRunsWithValue(true); } );

    // proportion false cells
    addRow("Proportion positive cells = p", function(generation) { 
        var countTrue = generation.countCellsWithValue(true);
        var countFalse = generation.countCellsWithValue(false);
        var proportionTrue = countTrue / (countTrue + countFalse);

        generation.proportionTrue = proportionTrue;

        return roundNumber(proportionTrue, 2);
    } );    

    // mean false cells per run
    addRow("Mean # positive cells per stripe width", function(generation) { 
        return generation.countCellsWithValue(true) / generation.countRunsWithValue(true);
    });
      
    // 1/(1-p)
    addRow("Correction factor 1/(1-p)", function(generation) { 
        return 1/(1 - generation.proportionTrue);
    });
    
    // corrected mean false patch length
    addRow("Corrected mean # positive cells per stripe width", function(generation) { 
        var meanTrueCellsRunLength = generation.countCellsWithValue(true) / generation.countRunsWithValue(true);
        var p2 = 1/(1 - generation.proportionTrue);
        return meanTrueCellsRunLength / p2;
    });
            
    // correct count false patches
    addRow("Corrected positive stripe number", function(generation) { 
        var modifier = 1/(1 - generation.proportionTrue);
        return modifier * generation.countRunsWithValue(true);
    });

    // corrected stripe count
    addRow("Corrected total (pos + neg) stripe number", function(generation) { 
        var modifier = 1/(1 - generation.proportionTrue);

        var countTrue = generation.countCellsWithValue(true);
        var runsTrue  = generation.countRunsWithValue(true);
        var countFalse  = generation.countCellsWithValue(false);

        var correctedMeanBlackCellsPerPatch = ((countTrue / runsTrue) / modifier);
        var correctedStripeCount = (countFalse + countTrue) / correctedMeanBlackCellsPerPatch;

        return correctedStripeCount;
    });

    return rows.join("\n");
}