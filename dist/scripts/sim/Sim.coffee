run = new SimulationRun(100, 5000, new RandomBooleanSeedStrategy(0.5), new NeighbourSwapIterationStrategy(0.9));

run.seed();
run.iterateAll();

#console.log run.getFirst().getFirst().next().next().getValue();

console.log run.toBinaryString();

console.log "done";