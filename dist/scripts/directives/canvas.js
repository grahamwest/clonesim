cellsim.directive('simGrid', function() {

  return {
    compile: function(tElement, tAttrs, transclude) {

      var canvasEl = document.createElement('canvas');
      //canvasEl.setAttribute("style", "width: 100%; height: 100%;");
      
      tElement[0].appendChild(canvasEl);

      var link = function($scope, iElement, iAttrs, controller) {

        $scope.canvasWidth = 1000//canvasEl.width;
        $scope.canvasHeight = 240//canvasEl.height;
        
        $scope.$watch('simResult', redraw);
        
        $scope.firstGenerationToDraw = 0;
        $scope.lastGenerationToDraw = $scope.numGenerations - 1;

        $scope.$watch('simResult', function() { $scope.lastGenerationToDraw = $scope.numGenerations;});
        $scope.$watch('lastGenerationToDraw', function() {$scope.redraw();});
        $scope.$watch('firstGenerationToDraw', function() {$scope.redraw();});
        
        $scope.$watch('simCount', function() {redraw($scope.simResult); });
        $scope.$watch('drawVoids', function() {redraw($scope.simResult); });

        $scope.step = function(stepAmmount) {
          $scope.lastGenerationToDraw += stepAmmount;
        }

        $scope.redraw = function() {redraw($scope.simResult); };
        //$scope.$watch('canvasWidth', function() {redraw($scope.simResult); });
        //$scope.$watch('canvasHeight', function() {redraw($scope.simResult).ctx.; });
        

        var redraw = function(r) {
          if (!r) return;

          // draw
          console.info(r);

          canvasEl.width = r.data.length;//$scope.canvasWidth;
          canvasEl.height = r.data[0].data.length;//$scope.canvasHeight;
          
          canvasEl.width = $scope.canvasWidth;
          canvasEl.height = $scope.canvasHeight;
          

          canvasEl.style.width = $scope.canvasWidth + 'px';
          canvasEl.style.height = $scope.canvasHeight + 'px';
          
          // offscreen canvas
          var useOffscreenCanvas = true;

          if (useOffscreenCanvas)
          {
            var realCanvasEl = canvasEl;
            canvasEl = document.createElement("canvas");
          }

          var ctx = canvasEl.getContext("2d");
          
          if (useOffscreenCanvas)
          {
            canvasEl.width = r.data.length;
            canvasEl.height = r.data[0].data.length;
          }

          var cellWidth = canvasEl.width / r.data.length;
          var cellHeight = canvasEl.height / r.data[0].data.length;

          var trueColor = (iAttrs['colortrue'] || 'black');
          var falseColor = (iAttrs['colorfalse'] || 'white');
          var voidColor = (iAttrs['colorvoid'] || 'gray');

          var drawVoidsInline = $scope.drawVoids.value === "inline";
          var drawVoidsAtBottom = $scope.drawVoids.value === "bottom";
          var hideVoids =  $scope.drawVoids.value === "hidden";

          ctx.clearRect (0, 0, canvasEl.width, canvasEl.height);

          // paint white background
          //ctx.fillStyle = 'white';
          //ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

          var firstGenerationToDraw = Math.min($scope.firstGenerationToDraw || 0, r.data.length);
          var lastGenerationToDraw = Math.min($scope.lastGenerationToDraw || 0, r.data.length);

          for (var i = firstGenerationToDraw; (i <= lastGenerationToDraw && (i < r.data.length)); i++)
          {
            var voidCount = 0;
            var y = 0;
            for (var j = 0; j < r.data[i].data.length; j++)
            {
              var v = r.data[i].data[j];

              ctx.fillStyle = (v === true) ? trueColor : ((v === false) ? falseColor : voidColor);
              if (v != null || drawVoidsInline)
              {
                if (hideVoids) continue; // we need to do a first pass to count the number of voids
                ctx.fillRect(i * cellWidth, y, cellWidth, cellHeight);
                y += cellHeight;
              }
              else 
                voidCount++;
            }

            if (hideVoids)
            {
              // we're not displaying the voids - scale other cells to make up
              var cellHeight = canvasEl.height / (r.data[i].data.length - voidCount);
              y = 0;
              for (var j = 0; j < r.data[i].data.length; j++)
              {
                var v = r.data[i].data[j];

                ctx.fillStyle = (v === true) ? trueColor : ((v === false) ? falseColor : voidColor);
                if (v != null)
                {
                  ctx.fillRect(i * cellWidth, y, cellWidth, cellHeight);
                  y += cellHeight;
                }
              }
            }

            if (drawVoidsAtBottom && !hideVoids)
              for (var k = 0; k < voidCount; k++) {
                ctx.fillStyle = voidColor;
                ctx.fillRect(i * cellWidth, y, cellWidth, cellHeight);
                y += cellHeight;
              }
          }


          if (useOffscreenCanvas)
          {
            var realCtx = realCanvasEl.getContext("2d");

    //            realCtx.webkitImageSmoothingEnabled = false;
    //        realCtx.imageSmoothingEnabled = false;


            var zoomX = realCanvasEl.width / canvasEl.width;
            var zoomY = realCanvasEl.height / canvasEl.height;
                    
            var imgData = ctx.getImageData(0,0,canvasEl.width,canvasEl.height).data;

              // Draw the zoomed-up pixels to a different canvas context
              for (var x=0;x<canvasEl.width;++x){
                for (var y=0;y<canvasEl.height;++y){
                  // Find the starting index in the one-dimensional image data
                  var i = (y*canvasEl.width + x)*4;
                  var r = imgData[i  ];
                  var g = imgData[i+1];
                  var b = imgData[i+2];
                  var a = imgData[i+3];
                  realCtx.fillStyle = "rgba("+r+","+g+","+b+","+(a/255)+")";
                  realCtx.fillRect(x*zoomX,y*zoomY,zoomX,zoomY);
                }
              }
            
    //        realCtx.clearRect (0, 0, realCanvasEl.width, realCanvasEl.height);
    //        realCtx.drawImage(canvasEl, 0, 0, canvasEl.width, canvasEl.height, 0, 0, realCanvasEl.width, realCanvasEl.height);
            canvasEl = realCanvasEl;


          }

        };

      };

      return link;
    }
  };

});