root = exports ? this

class Collection
	data: [];

	constructor: (@data) ->

	setValueForIndex: (i, v) -> this.data[i] = v;
	getValueForIndex: (i) -> this.data[i];
	size: -> this.data.length;

	getFirst: -> this.getElementForIndex(0);
	getLast:  -> this.getElementForIndex(this.size() - 1);

	getElementForIndex: (i) ->
		if (i >= 0 && i < this.data.length)
			this.toElement(i)
		else
			throw "index #{i} outside range 0-#{this.data.length-1}";

	toElement: (i) -> throw "abstract method should be overriden";

class SimulationRun extends Collection
	toElement: (i) -> this.data[i];

	seedStrategy: null;
	iterationStrategy: null;
	numGenerations: null;

	constructor: (size, @numGenerations, @seedStrategy, @iterationStrategy) ->
		this.data = new Array(@numGenerations);
		this.data[0] = new Generation(size);

	seed: (clumpSize) -> this.getFirst().seed(this.seedStrategy, clumpSize);

	iterateAll: -> 
		for i in [1..this.data.length-1]
			this.data[i] = this.data[i-1].iterate(this.iterationStrategy);

	toBinaryString: ->
		binVals = for i in [0..this.data.length-1]
			this.data[i].toBinaryString()
		binVals.join('\n');

class Generation extends Collection
	toElement: (i) -> new Cell(this, i);

	constructor: (size) ->
		super(new Array(size));	

	seed: (seedStrategy, clumpSize) ->

		seedInternal = (strategy, cell, numNeighboursCopy) ->
			strategy.seed(cell);

			if cell.isLast() then return;
			else if (numNeighboursCopy > 0)
				v = cell.getValue();
				seedInternal({seed: (c) => c.setValue(v) }, cell.next(), (numNeighboursCopy - 1));
			else
				seedInternal(seedStrategy, cell.next(), clumpSize-1);
		seedInternal(seedStrategy, this.getFirst(), clumpSize-1);

	iterate: (iterationStrategy) ->
		nextGen = new Generation(this.size());
		for i in [0..this.data.length-1]
			iterationStrategy.iterate(this.getElementForIndex(i), nextGen.getElementForIndex(i));
		nextGen;

	toBinaryString: ->
		cell = this.getFirst()
		f = cell.toBinaryString();

		binVals = while not cell.isLast()
			cell = cell.next()
			cell.toBinaryString()

		f + binVals.join('');

	countCellsWithValue: (v) ->
		cnt = 0;
		for i in [0..@data.length]
			if @data[i] == v then cnt++;
		cnt;

	countRunsWithValue: (v) ->
		cnt = 0;

		cell = null;
		while (cell is null or !cell.isLast())
			if cell is null
				cell = @getFirst()
				if (cell.getValue() == v) then cnt++;
			old = cell;
			cell = cell.nextNotNull();

			if (cell.index <= old.index) then return cnt;
			if (cell.getValue() != old.getValue()) && (cell.getValue() == v) then cnt++;

		# we double count the first and last stripe as 2 even if they are really a wrap around
		if (@getLast().getValue() == @getFirst().getValue()) && (@getFirst().getValue() == v)
			cnt--;
		return cnt;

class Cell
	generation: null;
	index: 0;

	constructor: (@generation, @index) ->
	setValue: (v) -> this.generation.setValueForIndex(this.index, v);
	getValue: -> this.generation.getValueForIndex(this.index);
	isFirst:  -> (this.index == 0);
	isLast:   -> (this.index == @generation.size() - 1);
	next:     -> if this.isLast() then this.generation.getFirst() else new Cell(this.generation, this.index + 1);
	previous: -> if this.isFirst() then this.generation.getLast() else new Cell(this.generation, this.index - 1);
	previousNotNull: ->
		p = @previous();
		while p.getValue() == null && (p.index != this.index)
			p = p.previous();
		p
	nextNotNull: ->
		n = @next();
		while n.getValue() == null && (n.index != this.index)
			n = n.next();
		n

	toBinaryString: -> if this.getValue() then '1' else '0';

root.SimulationRun = SimulationRun
root.Generation = Generation
root.Cell = Cell