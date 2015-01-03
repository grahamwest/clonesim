(function() {
  var IterationStrategy, NeighbourSwapIterationStrategy, RandomBooleanSeedStrategy, SeedStrategy, root,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  /* Seed Strategies
  */


  SeedStrategy = (function() {

    function SeedStrategy() {}

    SeedStrategy.prototype.seed = function(cell) {
      return cell.setValue(0);
    };

    return SeedStrategy;

  })();

  RandomBooleanSeedStrategy = (function(_super) {

    __extends(RandomBooleanSeedStrategy, _super);

    RandomBooleanSeedStrategy.prototype.percentage = 0;

    function RandomBooleanSeedStrategy(percentage) {
      this.percentage = percentage;
    }

    RandomBooleanSeedStrategy.prototype.seed = function(cell) {
      cell.setValue(Math.random() < this.percentage);
      return cell;
    };

    return RandomBooleanSeedStrategy;

  })(SeedStrategy);

  root.RandomBooleanSeedStrategy = RandomBooleanSeedStrategy;

  /* Iteration Strategies
  */


  IterationStrategy = (function() {

    function IterationStrategy() {}

    IterationStrategy.prototype.iterate = function(prevGenCell, newGenCell) {
      return newGenCell.setValue(prevGenCell.getValue());
    };

    return IterationStrategy;

  })();

  NeighbourSwapIterationStrategy = (function() {

    NeighbourSwapIterationStrategy.prototype.percentageSurvival = 0;

    NeighbourSwapIterationStrategy.prototype.percentageDestroyed = 0;

    function NeighbourSwapIterationStrategy(percentageSurvival, percentageDestroyed) {
      this.percentageSurvival = percentageSurvival;
      this.percentageDestroyed = percentageDestroyed;
    }

    NeighbourSwapIterationStrategy.prototype.iterate = function(prevGenCell, newGenCell) {
      var r, surviveThreshold;
      r = Math.random();
      surviveThreshold = this.percentageSurvival * (1 - this.percentageDestroyed);
      if ((r < surviveThreshold) || (prevGenCell.getValue() === null)) {
        return newGenCell.setValue(prevGenCell.getValue());
      } else if (r < surviveThreshold + this.percentageDestroyed) {
        return newGenCell.setValue(null);
      } else {
        return newGenCell.setValue((r - this.percentageSurvival) < ((1 - this.percentageSurvival) / 2) ? prevGenCell.previousNotNull().getValue() : prevGenCell.nextNotNull().getValue());
      }
    };

    return NeighbourSwapIterationStrategy;

  })();

  root.NeighbourSwapIterationStrategy = NeighbourSwapIterationStrategy;

}).call(this);
