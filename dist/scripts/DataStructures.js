(function() {
  var Cell, Collection, Generation, SimulationRun, root,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  Collection = (function() {

    Collection.prototype.data = [];

    function Collection(data) {
      this.data = data;
    }

    Collection.prototype.setValueForIndex = function(i, v) {
      return this.data[i] = v;
    };

    Collection.prototype.getValueForIndex = function(i) {
      return this.data[i];
    };

    Collection.prototype.size = function() {
      return this.data.length;
    };

    Collection.prototype.getFirst = function() {
      return this.getElementForIndex(0);
    };

    Collection.prototype.getFirstNotNull = function() {
      var first = this.getFirst();
      if (first.getValue() === null) first = first.nextNotNull();
      return first;
    }

    Collection.prototype.getLast = function() {
      return this.getElementForIndex(this.size() - 1);
    };

    Collection.prototype.getLastNotNull = function() {
      var last = this.getLast();
      if (last.getValue() === null) last = last.nextNotNull();
      return last;
    }

    Collection.prototype.getElementForIndex = function(i) {
      if (i >= 0 && i < this.data.length) {
        return this.toElement(i);
      } else {
        throw "index " + i + " outside range 0-" + (this.data.length - 1);
      }
    };

    Collection.prototype.toElement = function(i) {
      throw "abstract method should be overriden";
    };

    return Collection;

  })();

  SimulationRun = (function(_super) {

    __extends(SimulationRun, _super);

    SimulationRun.prototype.toElement = function(i) {
      return this.data[i];
    };

    SimulationRun.prototype.seedStrategy = null;

    SimulationRun.prototype.iterationStrategy = null;

    SimulationRun.prototype.numGenerations = null;

    function SimulationRun(size, numGenerations, seedStrategy, iterationStrategy) {
      this.numGenerations = numGenerations;
      this.seedStrategy = seedStrategy;
      this.iterationStrategy = iterationStrategy;
      this.data = new Array(this.numGenerations);
      this.data[0] = new Generation(size);
    }

    SimulationRun.prototype.seed = function(clumpSize) {
      return this.getFirst().seed(this.seedStrategy, clumpSize);
    };

    SimulationRun.prototype.iterateAll = function() {
      var i, _i, _ref, _results;
      _results = [];
      for (i = _i = 1, _ref = this.data.length - 1; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
        _results.push(this.data[i] = this.data[i - 1].iterate(this.iterationStrategy));
      }
      return _results;
    };

    SimulationRun.prototype.toBinaryString = function() {
      var binVals, i;
      binVals = (function() {
        var _i, _ref, _results;
        _results = [];
        for (i = _i = 0, _ref = this.data.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
          _results.push(this.data[i].toBinaryString());
        }
        return _results;
      }).call(this);
      return binVals.join('\n');
    };

    return SimulationRun;

  })(Collection);

  Generation = (function(_super) {

    __extends(Generation, _super);

    Generation.prototype.toElement = function(i) {
      return new Cell(this, i);
    };

    function Generation(size) {
      Generation.__super__.constructor.call(this, new Array(size));
    }

    Generation.prototype.seed = function(seedStrategy, clumpSize) {
      var seedInternal;
      seedInternal = function(strategy, cell, numNeighboursCopy) {
        var v,
          _this = this;
        strategy.seed(cell);
        if (cell.isLast()) {

        } else if (numNeighboursCopy > 0) {
          v = cell.getValue();
          return seedInternal({
            seed: function(c) {
              return c.setValue(v);
            }
          }, cell.next(), numNeighboursCopy - 1);
        } else {
          return seedInternal(seedStrategy, cell.next(), clumpSize - 1);
        }
      };
      return seedInternal(seedStrategy, this.getFirst(), clumpSize - 1);
    };

    Generation.prototype.iterate = function(iterationStrategy) {
      var i, nextGen, _i, _ref;
      nextGen = new Generation(this.size());
      for (i = _i = 0, _ref = this.data.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        iterationStrategy.iterate(this.getElementForIndex(i), nextGen.getElementForIndex(i));
      }
      return nextGen;
    };

    Generation.prototype.toBinaryString = function() {
      var binVals, cell, f;
      cell = this.getFirst();
      f = cell.toBinaryString();
      binVals = (function() {
        var _results;
        _results = [];
        while (!cell.isLast()) {
          cell = cell.next();
          _results.push(cell.toBinaryString());
        }
        return _results;
      })();
      return f + binVals.join('');
    };

    Generation.prototype.countCellsWithValue = function(v) {
      var cnt, i, _i, _ref;
      cnt = 0;
      for (i = _i = 0, _ref = this.data.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (this.data[i] === v) {
          cnt++;
        }
      }
      return cnt;
    };

    Generation.prototype.toStripes = function() {

      var stripes = [];
      for (var i = 0; i < this.data.length; i++) {
        var cell = this.data[i];
        if (cell != null) {
          // this is a new stripe if it's the first one or different from the last
          if ((stripes.length === 0) || (stripes[stripes.length - 1] != cell))
          {
            stripes.push(cell);
          }
        }
      }

      // close loop - generation is circular so remove double counting at boundary
      if ((stripes.length > 2) && (stripes[0] == stripes[stripes.length - 1]))
      {
         stripes.pop();
      }
      return stripes;
    };

    Generation.prototype.countRunsWithValue = function(v) {

      return this.toStripes().filter(function(e) { return e === v;} ).length;
    };

/*
    Generation.prototype.countRunsWithValue = function(v) {
      
      var cell, cnt, old;
      cnt = 0;
      cell = null;
      while (cell === null || !cell.isLast()) {
        if (cell === null) {
          cell = this.getFirst();
          if (cell.getValue() === v) {
            cnt++;
          }
        }
        old = cell;
        cell = cell.nextNotNull();
        if (cell.index <= old.index) {
          return cnt;
        }
        if ((cell.getValue() !== old.getValue()) && (cell.getValue() === v)) {
          cnt++;
        }
      }

      if (cnt > 1) {
        // check for stripe at loop
        var first = this.getFirstNotNull().getValue();
        var last = this.getLastNotNull().getValue();

        if ((first === last) && (first === v)) {
          // we have a stripe of the color we're looking for which crosses the ege of the loop (so we've double counted) - 
          cnt--;

        }
        console.info("stripes:" + cnt);
      }

      return cnt;
    };
  */

    return Generation;

  })(Collection);


  Cell = (function() {

    Cell.prototype.generation = null;

    Cell.prototype.index = 0;

    function Cell(generation, index) {
      this.generation = generation;
      this.index = index;
    }

    Cell.prototype.setValue = function(v) {
      return this.generation.setValueForIndex(this.index, v);
    };

    Cell.prototype.getValue = function() {
      return this.generation.getValueForIndex(this.index);
    };

    Cell.prototype.isFirst = function() {
      return this.index === 0;
    };

    Cell.prototype.isLast = function() {
      return this.index === this.generation.size() - 1;
    };

    Cell.prototype.next = function() {
      if (this.isLast()) {
        return this.generation.getFirst();
      } else {
        return new Cell(this.generation, this.index + 1);
      }
    };

    Cell.prototype.previous = function() {
      if (this.isFirst()) {
        return this.generation.getLast();
      } else {
        return new Cell(this.generation, this.index - 1);
      }
    };

    Cell.prototype.previousNotNull = function() {
      var p;
      p = this.previous();
      while (p.getValue() === null && (p.index !== this.index)) {
        p = p.previous();
      }
      return p;
    };

    Cell.prototype.nextNotNull = function() {
      var n;
      n = this.next();
      while (n.getValue() === null && (n.index !== this.index)) {
        n = n.next();
      }
      return n;
    };

    Cell.prototype.toBinaryString = function() {
      if (this.getValue()) {
        return '1';
      } else {
        return '0';
      }
    };

    return Cell;

  })();

  root.SimulationRun = SimulationRun;

  root.Generation = Generation;

  root.Cell = Cell;

}).call(this);
