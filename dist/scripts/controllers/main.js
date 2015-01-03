'use strict';

cellsim.controller('MainCtrl', function($scope) { });


cellsim.service('SimService', function() {
	this.read = function(id) {
		//return "hello" + id;
    return this.runSim();
	}

  this.runSim = function() 
  {
    var run = new SimulationRun(100, 5000, new RandomBooleanSeedStrategy(0.5), new NeighbourSwapIterationStrategy(0.95, 0.00005));

    run.seed();
    run.iterateAll();

    return run;
  }

});


cellsim.controller('ViewSimCtrl', ['$scope', '$routeParams', 'SimService', function($scope, $routeParams, SimService) {
  $scope.numCells = 120;
  $scope.numGenerations = 500;
  
  $scope.seedStrategies = [{label: "Random", value: "RandomBooleanSeedStrategy"}];
  $scope.seedStrategy = $scope.seedStrategies[0];
  $scope.seedStrategyParam = 0.5;

  $scope.clumpSize = 1;

  $scope.iterationStrategies = [{label: "Neighbour Swap", value: "NeighbourSwapIterationStrategy"}]
  $scope.iterationStrategy = $scope.iterationStrategies[0];
  $scope.iterationStrategyParam = {replacedByNeighbourRate: 0.1, decayRate: 0};

  $scope.colorsTrue = "#007BA7";
  $scope.colorsFalse = "#FFFFFF";
  $scope.colorsVoid = "#CCCCCC";
  

  $scope.runNewSim = function()
  {
    var survivalRate = 1 - $scope.iterationStrategyParam.replacedByNeighbourRate;
    var run = new SimulationRun($scope.numCells, $scope.numGenerations + 1, new RandomBooleanSeedStrategy($scope.seedStrategyParam, 5), new NeighbourSwapIterationStrategy(survivalRate, $scope.iterationStrategyParam.decayRate));

    run.seed($scope.clumpSize);
    run.iterateAll();

    $scope.simResult = run;
    $scope.simCount++;
  }

  $scope.saveAsCsv = function() {
    var result = $scope.simResult;

    var blob = new Blob([simToCsv(result)], {type: "text/csv;charset=utf-8"});

    //console.info(simToCsv(result));
    saveAs(blob, "simulation_data.csv");
  }



   /**
    * http://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata/5100158
    *
    *
    */
    var dataURItoBlob = function(dataURI) {
        // convert base64 to raw binary data held in a string
        // doesn't handle URLEncoded DataURIs

        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0) {
            byteString = atob(dataURI.split(',')[1]);
        } else {
            byteString = unescape(dataURI.split(',')[1]);
        }

        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to an ArrayBuffer
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ab]);
    }

  $scope.saveAsPng = function() {
    var blob = dataURItoBlob( document.getElementsByTagName("canvas")[0].toDataURL("image/png") );
    saveAs(blob, "simulation.png");
  }

  $scope.simCount = 0;

	//$scope.simResult = SimService.read($routeParams['id']);
  //$scope.drawVoidsInline = false;
  $scope.drawVoidsOptions = [{label: "Inline", value: "inline"}, {label: "Grouped", value: "bottom"}, {label: "Hidden", value: "hidden"}]
  $scope.drawVoids = $scope.drawVoidsOptions[1];

}]);