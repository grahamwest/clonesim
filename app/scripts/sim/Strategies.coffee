root = exports ? this

### Seed Strategies ###

class SeedStrategy
	seed: (cell) -> cell.setValue(0);

class RandomBooleanSeedStrategy extends SeedStrategy
	percentage: 0;

	constructor: (@percentage) ->
	seed: (cell) -> 
		cell.setValue( Math.random() < this.percentage );
		cell;

root.RandomBooleanSeedStrategy = RandomBooleanSeedStrategy;

### Iteration Strategies ###

class IterationStrategy
	iterate: (prevGenCell, newGenCell) -> newGenCell.setValue(prevGenCell.getValue());

class NeighbourSwapIterationStrategy
	percentageSurvival: 0;
	percentageDestroyed: 0;
	constructor: (@percentageSurvival, @percentageDestroyed) ->

	iterate: (prevGenCell, newGenCell) ->

		r = Math.random();

		surviveThreshold = @percentageSurvival * (1 - @percentageDestroyed);

		if (r < surviveThreshold) or (prevGenCell.getValue() == null)
			newGenCell.setValue(prevGenCell.getValue())
		else if (r < surviveThreshold + @percentageDestroyed)
			newGenCell.setValue(null)
		else
			newGenCell.setValue( if ((r - @percentageSurvival) < ((1-@percentageSurvival)/2)) then prevGenCell.previousNotNull().getValue() else prevGenCell.nextNotNull().getValue() );
			
root.NeighbourSwapIterationStrategy = NeighbourSwapIterationStrategy;